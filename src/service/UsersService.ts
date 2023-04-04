import { QueryResult } from 'pg';
import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';

import db from '../db';
import UserDto from '../dtos/UserDto';
import { ApiError } from '../exceptions';
import AuthorsService from './AuthorsService';
import { PropsWithId } from './types';
import MailService from './MailService';
import TokensService from './TokensService';

const tableName = 'users';

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
  activate_link?: string;
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

type User = {
  id: number;
  firstName: string;
  lastName: string;
  avatar: string;
  login: string;
  password: string;
  createdAt: string;
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
    const query = `INSERT INTO ${tableName} (first_name, last_name, avatar, login, password, activate_link, admin, email)
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                     RETURNING user_id, first_name, last_name, avatar, login, admin, created_at, password, activate_link, email, is_activated`;

    const candidate = await UsersService.getOne({ login });

    if (candidate !== null) {
      return ApiError.BadRequest(`User with this login ${login} exists`);
    }

    const hashPassword = bcrypt.hashSync(password, 7);
    const activateLink = uuid();
    await MailService.sendActivationMail({ to: email, link: activateLink });

    const { rows }: QueryResult<UsersRow> = await db.query(query, [
      firstName,
      lastName,
      avatar,
      login,
      hashPassword,
      activateLink,
      isAdmin,
      email,
    ]);

    const user = UsersService.convertCase(rows[0]);
    const userDto = new UserDto(user);
    const tokens = TokensService.generateTokens({ ...userDto });
    await TokensService.create({
      userId: userDto.id,
      refreshToken: tokens.refreshToken,
    });

    return { ...user, ...tokens };
  }

  static async activate(activateLink: string) {
    const queryUser = `SELECT *
                         FROM ${tableName}
                        WHERE activate_link = $1`;
    const { rows }: QueryResult<UsersRow> = await db.query(queryUser, [
      activateLink,
    ]);

    const user = UsersService.convertCase(rows[0]);

    if (!user.isActivated) {
      const queryActivate = `UPDATE ${tableName}
                                SET is_activated = $1
                              WHERE user_id = $2
                          RETURNING user_id, first_name, last_name, avatar, login, admin, created_at, is_activated`;
      const { rows: userRows } = await db.query(queryActivate, [true, user.id]);

      return UsersService.convertCase(userRows[0]);
    }

    return user;
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

    const query = `UPDATE ${tableName}
                      SET first_name = $1,
                          last_name = $2,
                          avatar = $3,
                          login = $4,
                          password = $5
                    WHERE user_id = $6
                RETURNING user_id, first_name, last_name, avatar, login, admin, created_at`;

    const { rows }: QueryResult<UsersRow> = await db.query(query, [
      firstName,
      lastName,
      avatar,
      login,
      password,
      id,
    ]);

    const data = rows[0];

    return UsersService.convertCase(data);
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
    const { rows, rowCount: count }: QueryResult<UsersRow> = await db.query(
      `SELECT user_id, first_name, last_name, avatar, login, admin, created_at,
              count(*) OVER() AS total_count
         FROM ${tableName}
        LIMIT $1
       OFFSET $2
         `,
      [perPage, page * perPage],
    );
    const users = rows.map((user) => UsersService.convertCase(user));
    const totalCount = rows[0].total_count || null;

    return {
      count,
      totalCount,
      users,
    };
  }

  static async getOne({ login }: { login: string }) {
    const query = `SELECT *
                     FROM ${tableName}
                    WHERE login = $1`;
    const { rows }: QueryResult<UsersRow> = await db.query(query, [login]);

    if (rows.length === 0) {
      return null;
    }
    const data = rows[0];

    return UsersService.convertCase(data);
  }

  static async getById({ id }: { id: string }) {
    const query = `SELECT *
                     FROM ${tableName}
                    WHERE user_id = $1`;
    const { rows }: QueryResult<UsersRow> = await db.query(query, [id]);
    const data = rows[0];

    return UsersService.convertCase(data);
  }

  static async delete({ id }: PropsWithId) {
    const query = `DELETE
                     FROM ${tableName}
                    WHERE user_id = $1
                RETURNING user_id, first_name, last_name, avatar, login, admin`;
    await AuthorsService.deleteUserAuthors({ id });
    const { rows }: QueryResult<UsersRow> = await db.query(query, [id]);
    const data = rows[0];

    return UsersService.convertCase(data);
  }

  static convertCase(user: UsersRow): User {
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
