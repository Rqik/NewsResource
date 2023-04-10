import { QueryResult } from 'pg';
import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import { User } from '@prisma/client';

import db from '../db';
import UserDto from '../dtos/UserDto';
import { ApiError } from '../exceptions';
import AuthorsService from './AuthorsService';
import { PropsWithId } from './types';
import MailService from './MailService';
import TokensService from './TokensService';
import prisma from '../prisma';

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
class UsersService {
  static async registration({
    firstName,
    lastName,
    login,
    email,
    password,
    avatar = null,
  }: UserProp) {
    const isAdmin = adminEmail.includes(email);
    // TODO:проверить работает ли unique
    // const query = `INSERT INTO ${tableName} (first_name, last_name, avatar, login, password, activate_link, admin, email)
    //                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    //                  RETURNING user_id, first_name, last_name, avatar, login, admin, created_at, password, activate_link, email, is_activated`;

    // const candidate = await UsersService.getOne({ login });

    // if (candidate !== null) {
    //   return ApiError.BadRequest(`User with this login ${login} exists`);
    // }

    const hashPassword = bcrypt.hashSync(password, 7);
    const activateLink = uuid();
    await MailService.sendActivationMail({ to: email, link: activateLink });

    const user = await prisma.user.create({
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

    const userDto = new UserDto(UsersService.convertCase(user));
    const tokens = TokensService.generateTokens({ ...userDto });
    await TokensService.create({
      userId: userDto.id,
      refreshToken: tokens.refreshToken,
    });

    return { ...user, ...tokens };
  }

  static async activate(activateLink: string) {
    const user = await prisma.user.findFirst({
      where: {
        activate_link: { equals: activateLink },
        is_activated: false,
      },
    });
    if (!user) {
      return user;
    }
    const userUpdated = await prisma.user.update({
      where: {
        user_id: user.user_id,
      },
      data: {
        is_activated: true,
      },
    });

    return UsersService.convertCase(userUpdated);
  }

  static async login({ login, password }: { login: string; password: string }) {
    const user = await UsersService.getOne({ login });

    if (user === null) {
      return ApiError.BadRequest(`User ${login} not found`);
    }

    const isPassEquals = await bcrypt.compare(password, user.password);
    if (!isPassEquals) {
      return ApiError.BadRequest('Wrong password');
    }

    const userDto = new UserDto(user);
    const tokens = TokensService.generateTokens({ ...userDto });
    await TokensService.create({
      userId: userDto.id,
      refreshToken: tokens.refreshToken,
    });

    return { ...user, ...tokens };
  }

  static async logout(refreshToken: string) {
    const token = await TokensService.delete({ refreshToken });

    return token;
  }

  static async refresh(refreshToken: string) {
    if (!refreshToken) {
      return ApiError.UnauthorizeError();
    }

    const userData = TokensService.validateRefresh(refreshToken);
    const tokenFromDb = await TokensService.getOne({ refreshToken });

    if (!userData && !tokenFromDb) {
      return ApiError.UnauthorizeError();
    }

    if (typeof userData !== 'object' || userData === null) {
      return ApiError.UnauthorizeError();
    }

    const user = await UsersService.getById({ id: userData.id });

    if (!user) {
      return ApiError.UnauthorizeError();
    }

    const userDto = new UserDto(user);
    const tokens = TokensService.generateTokens({ ...userDto });

    await TokensService.create({
      userId: userDto.id,
      refreshToken: tokens.refreshToken,
    });

    return { ...userData, ...tokens };
  }

  // TODO: реализовать изменение admin
  static async update({
    id,
    firstName,
    lastName,
    avatar,
    login,
    password,
  }: PropsWithId<UserProp>) {
    const user = await UsersService.getOne({ login });

    if (user === null) {
      return ApiError.BadRequest(`User ${login} not found`);
    }

    const isPassEquals = await bcrypt.compare(password, user.password);

    if (!isPassEquals) {
      return ApiError.BadRequest('Wrong password');
    }

    const userUpdated = await prisma.user.update({
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

    return UsersService.convertCase(userUpdated);
  }

  static async partialUpdate(body: Partial<UserProp>) {
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

    return UsersService.convertCase(data);
  }

  static async getAll({ page, perPage }: { page: number; perPage: number }) {
    const [totalCount, data] = await prisma.$transaction([
      prisma.user.count(),
      prisma.user.findMany({ skip: page * perPage, take: perPage }),
    ]);

    const users = data.map((user) => UsersService.convertCase(user));

    return {
      count: data.length,
      totalCount,
      users,
    };
  }

  static async getOne({ login }: { login: string }) {
    const user = await prisma.user.findUnique({
      where: { login },
    });

    return user ? UsersService.convertCase(user) : user;
  }

  static async getById({ id }: { id: number }) {
    const user = await prisma.user.findUnique({
      where: { user_id: id },
    });

    return user ? UsersService.convertCase(user) : user;
  }

  static async delete({ id }: PropsWithId) {
    await AuthorsService.deleteUserAuthors({ id });
    const user = await prisma.user.delete({
      where: { user_id: Number(id) },
    });

    return UsersService.convertCase(user);
  }

  static convertCase(user: UsersRow | User): UserConverted {
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

export default UsersService;
