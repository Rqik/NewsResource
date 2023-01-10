import { QueryResult } from 'pg';

import db from '../db';
import AuthorsService from './AuthorsService';
import { PropsWithId } from './types';

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
};

type UserProp = {
  firstName: string;
  lastName: string;
  avatar: string;
  login: string;
  password: string;
};

class UsersService {
  static async create({
    firstName,
    lastName,
    avatar,
    login,
    password,
  }: UserProp) {
    const query = `INSERT INTO ${tableName} (first_name, last_name, avatar, login, password)
                        VALUES ($1, $2, $3, $4, $5)
                     RETURNING user_id, first_name, last_name, avatar, login, admin, created_at, password`;

    const result: QueryResult<UsersRow> = await db.query(query, [
      firstName,
      lastName,
      avatar,
      login,
      password,
    ]);
    const data = result.rows[0];

    return UsersService.convertCase(data);
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
    const query = `UPDATE ${tableName}
                      SET first_name = $1,
                          last_name = $2,
                          avatar = $3,
                          login = $4,
                          password = $5
                    WHERE user_id = $6
                RETURNING user_id, first_name, last_name, avatar, login, admin, created_at`;

    const result: QueryResult<UsersRow> = await db.query(query, [
      firstName,
      lastName,
      avatar,
      login,
      password,
      id,
    ]);

    const data = result.rows[0];

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

    const result: QueryResult<UsersRow> = await db.query(query, [
      ...bodyValues,
    ]);
    const data = result.rows[0];

    return UsersService.convertCase(data);
  }

  static async findAll() {
    const result: QueryResult<UsersRow> = await db.query(
      `SELECT user_id, first_name, last_name, avatar, login, admin, created_at
         FROM ${tableName}`,
    );

    return {
      count: result.rowCount,
      data: result.rows.map((user) => UsersService.convertCase(user)),
    };
  }

  static async getOne({ login }: { login: string }) {
    const query = `SELECT *
                     FROM ${tableName}
                    WHERE login = $1`;
    const result: QueryResult<UsersRow> = await db.query(query, [login]);
    const data = result.rows[0];

    return UsersService.convertCase(data);
  }

  static async getById({ id }: { id: string }) {
    const query = `SELECT *
                     FROM ${tableName}
                    WHERE user_id = $1`;
    const result: QueryResult<UsersRow> = await db.query(query, [id]);
    const data = result.rows[0];

    return UsersService.convertCase(data);
  }

  static async delete({ id }: PropsWithId) {
    const query = `DELETE
                     FROM ${tableName}
                    WHERE user_id = $1
                RETURNING user_id, first_name, last_name, avatar, login, admin`;
    await AuthorsService.deleteUserAuthors({ id });
    const result: QueryResult<UsersRow> = await db.query(query, [id]);
    const data = result.rows[0];
    return UsersService.convertCase(data);
  }

  static convertCase(user: UsersRow) {
    return {
      id: user.user_id,
      firstName: user.first_name,
      lastName: user.last_name,
      avatar: user.avatar,
      login: user.login,
      admin: user.admin,
    };
  }
}

export default UsersService;
