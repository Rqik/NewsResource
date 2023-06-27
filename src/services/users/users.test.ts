import { User } from '@prisma/client';
import { boundClass } from 'autobind-decorator';
import bcrypt from 'bcrypt';
import { QueryResult } from 'pg';
import { v4 as uuid } from 'uuid';

import prisma from '@/client';
import db from '@/db';
import UserDto from '@/dtos/UserDto';
import { ApiError } from '@/exceptions';

import { AuthorsService } from '../authors';
import { MailService } from '../mail';
import { TokensService } from '../tokens';
import { PropsWithId } from '../types';

const tableName = 'users';

// TODO: обозначить выбираемые поля
// const baseSelectedFields = {
//   select: {
//     user_id: true,
//     first_name: true,
//     last_name: true,
//     avatar: true,
//     login: true,
//     admin: true,
//   },
// };

type UsersRow = {
  user_id: number;
  first_name: string;
  last_name: string;
  avatar: string;
  login: string;
  password: string;
  created_at: string;
  admin: boolean;
  is_activated: boolean;
  activate_link: string;
  email?: string;
  total_count?: number;
};

type UserProp = {
  firstName: string;
  lastName: string;
  avatar: string | null;
  login: string;
  email: string;
  password: string;
};

type UserConverted = {
  id: number;
  firstName: string;
  lastName: string | null;
  avatar: string | null;
  login: string;
  password: string;
  createdAt: Date | string | null;
  isAdmin: boolean;
  email: string;
  activateLink?: string;
  isActivated: boolean;
};
const adminEmail = ['tabasaranec96@mail.ru'];

@boundClass
class UsersService {
  constructor(
    private prismaClient: typeof prisma,
    private authorsService: typeof AuthorsService,
    private mailService: typeof MailService,
    private tokensService: typeof TokensService,
  ) {}

  async registration({
    firstName,
    lastName,
    login,
    email,
    password,
    avatar = null,
  }: UserProp) {
    const isAdmin = adminEmail.includes(email);

    const candidate = await this.getOne({ login });

    if (candidate !== null) {
      return ApiError.BadRequest(`User with this login ${login} exists`);
    }

    const hashPassword = bcrypt.hashSync(password, 7);
    const activateLink = uuid();
    try {
      await this.mailService.sendActivationMail({
        to: email,
        link: activateLink,
      });

      const user = await this.prismaClient.user.create({
        data: {
          first_name: firstName,
          last_name: lastName,
          avatar,
          login,
          activate_link: activateLink,
          admin: isAdmin,
          email,
          password: hashPassword,
        },
      });

      const userDto = new UserDto(this.convertCase(user));
      const tokens = this.tokensService.generateTokens({ ...userDto });
      await this.tokensService.create({
        userId: userDto.id,
        refreshToken: tokens.refreshToken,
      });

      return { ...this.convertCase(user), ...tokens };
    } catch (error) {
      console.log(error);
    }

    return {} as any;
  }

  async activate(activateLink: string) {
    const user = await this.prismaClient.user.findFirst({
      where: {
        activate_link: { equals: activateLink },
        is_activated: false,
      },
    });
    if (!user) {
      return user;
    }
    const userUpdated = await this.prismaClient.user.update({
      where: {
        user_id: user.user_id,
      },
      data: {
        is_activated: true,
      },
    });

    return this.convertCase(userUpdated);
  }

  async login({ login, password }: { login: string; password: string }) {
    const user = await this.getOne({ login });

    if (user === null) {
      return ApiError.BadRequest(`User ${login} not found`);
    }

    const isPassEquals = await bcrypt.compare(password, user.password);
    if (!isPassEquals) {
      return ApiError.BadRequest('Wrong password');
    }

    const userDto = new UserDto(user);
    const tokens = this.tokensService.generateTokens({ ...userDto });
    await this.tokensService.create({
      userId: userDto.id,
      refreshToken: tokens.refreshToken,
    });

    return { ...user, ...tokens };
  }

  async logout(refreshToken: string) {
    const token = await this.tokensService.delete({ refreshToken });

    return token;
  }

  async refresh(refreshToken: string) {
    if (!refreshToken) {
      return ApiError.UnauthorizeError();
    }

    const userData = this.tokensService.validateRefresh(refreshToken);
    const tokenFromDb = await this.tokensService.getOne({ refreshToken });

    if (!userData && !tokenFromDb) {
      return ApiError.UnauthorizeError();
    }

    if (typeof userData !== 'object' || userData === null) {
      return ApiError.UnauthorizeError();
    }

    const user = await this.getById({ id: userData.id });

    if (!user) {
      return ApiError.UnauthorizeError();
    }

    const userDto = new UserDto(user);
    const tokens = this.tokensService.generateTokens({ ...userDto });

    await this.tokensService.create({
      userId: userDto.id,
      refreshToken: tokens.refreshToken,
    });

    return { ...userData, ...tokens };
  }

  // TODO: реализовать изменение admin
  async update({
    id,
    firstName,
    lastName,
    avatar,
    login,
    password,
  }: PropsWithId<UserProp>) {
    const user = await this.getOne({ login });

    if (user === null) {
      return ApiError.BadRequest(`User ${login} not found`);
    }

    const isPassEquals = await bcrypt.compare(password, user.password);

    if (!isPassEquals) {
      return ApiError.BadRequest('Wrong password');
    }

    const userUpdated = await this.prismaClient.user.update({
      where: {
        user_id: Number(id),
      },
      data: {
        first_name: firstName,
        last_name: lastName,
        avatar,
        login,
      },
    });

    return this.convertCase(userUpdated);
  }

  async partialUpdate(body: Partial<UserProp>) {
    const bodyProps = Object.keys(body);
    const bodyValues = Object.values(body);
    const snakeReg = /([a-z0–9])([A-Z])/g;
    const setParams = bodyProps.map(
      (el, i) => `${el.replace(snakeReg, '$1_$2').toLowerCase()} = $${i + 1}`,
    );

    const query = `UPDATE ${tableName}
                      SET ${setParams.join(', \n')}
                    WHERE login = $${setParams.length + 1}
                RETURNING user_id, first_name, last_name, avatar, login, admin, created_at`;

    const { rows }: QueryResult<UsersRow> = await db.query(query, [
      ...bodyValues,
    ]);
    const data = rows[0];

    return this.convertCase(data);
  }

  async getAll({ page, perPage }: { page: number; perPage: number }) {
    console.log('totalCount');
    const [totalCount, data] = await this.prismaClient.$transaction([
      this.prismaClient.user.count(),
      this.prismaClient.user.findMany({ skip: page * perPage, take: perPage }),
    ]);

    const users = data.map((user) => this.convertCase(user));

    return {
      count: data.length,
      totalCount,
      users,
    };
  }

  async getOne({ login }: { login: string }) {
    const user = await this.prismaClient.user.findUnique({
      where: { login },
    });

    return user ? this.convertCase(user) : user;
  }

  async getById({ id }: PropsWithId) {
    const user = await this.prismaClient.user.findUnique({
      where: { user_id: Number(id) },
    });

    return user ? this.convertCase(user) : user;
  }

  async delete({ id }: PropsWithId) {
    await this.authorsService.deleteUserAuthors({ id });
    const user = await this.prismaClient.user.delete({
      where: { user_id: Number(id) },
    });

    return this.convertCase(user);
  }

  // eslint-disable-next-line class-methods-use-this
  private convertCase(user: UsersRow | User): UserConverted {
    return {
      id: user.user_id,
      firstName: user.first_name,
      lastName: user.last_name,
      avatar: user.avatar,
      login: user.login,
      isAdmin: user.admin,
      activateLink: user.activate_link,
      createdAt: user.created_at,
      password: user.password,
      email: user.email || '',
      isActivated: user.is_activated,
    };
  }
}

export default new UsersService(
  prisma,
  AuthorsService,
  MailService,
  TokensService,
);
