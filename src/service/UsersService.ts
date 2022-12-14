import { QueryResult } from 'pg';

import db from '../db';
import { PropsWithId } from './types';

const tableName = 'users';

type UsersRow = {
  user_id: number;
  first_name: string;
  last_name: string;
  avatar: string;
  login: string;
  password: string;
  create_at: string;
  admin: boolean;
};
type UserProp = {
  firstName: string;
  lastName: string;
  avatar: string;
  login: string;
  password: string;
};
type UserWithoutSecurityProp = Omit<UserProp, 'password'>;

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
                     RETURNING user_id, first_name, last_name, avatar, login, password, create_at, admin`;

    const result: QueryResult<UsersRow> = await db.query(query, [
      firstName,
      lastName,
      avatar,
      login,
      password,
    ]);
    const data = result.rows[0];

    return {
      id: data.user_id,
      firstName: data.first_name,
      lastName: data.last_name,
      avatar: data.avatar,
      login: data.login,
      admin: data.admin,
    };
  }

  static async update({
    id,
    firstName,
    lastName,
    avatar,
    login,
  }: PropsWithId<UserWithoutSecurityProp>) {
    const query = `UPDATE ${tableName}
                      SET first_name = $1,
                          last_name = $2,
                          avatar = $3,
                          login = $4
                    WHERE user_id = $5
                RETURNING user_id, first_name, last_name, avatar, login, admin`;

    const result: QueryResult<UsersRow> = await db.query(query, [
      firstName,
      lastName,
      avatar,
      login,
      id,
    ]);

    const data = result.rows[0];

    return {
      id: data.user_id,
      firstName: data.first_name,
      lastName: data.last_name,
      avatar: data.avatar,
      login: data.login,
      admin: data.admin,
    };
  }

  static async partialUpdate(body: PropsWithId<Partial<UserProp>>) {
    const bodyProps = Object.keys(body);
    const bodyValues = Object.values(body);
    const snakeReg = /([a-z0–9])([A-Z])/g;
    const setParams = bodyProps.map(
      (el, i) => `${el.replace(snakeReg, '$1_$2').toLowerCase()} = $${i + 1}`,
    );

    const query = `UPDATE ${tableName}
                      SET ${setParams.join(', \n')}
                    WHERE user_id = $${setParams.length + 1}
                RETURNING user_id, first_name, last_name, avatar, login, admin`;

    const result: QueryResult<UsersRow> = await db.query(query, [
      ...bodyValues,
      body.id,
    ]);
    const data = result.rows[0];

    return {
      id: data.user_id,
      firstName: data.first_name,
      lastName: data.last_name,
      avatar: data.avatar,
      login: data.login,
      admin: data.admin,
    };
  }

  static async getAll() {
    const result: QueryResult<UsersRow> = await db.query(
      `SELECT *
         FROM ${tableName}`,
    );

    return result.rows;
  }

  static async getOne({ id }: PropsWithId) {
    const query = `SELECT *
                     FROM ${tableName}
                    WHERE user_id = $1`;
    const result: QueryResult<UsersRow> = await db.query(query, [id]);
    const data = result.rows[0];

    return {
      id: data.user_id,
      firstName: data.first_name,
      lastName: data.last_name,
      login: data.login,
      avatar: data.avatar,
      admin: data.admin,
    };
  }

  static async delete({ id }: PropsWithId) {
    const query = `DELETE
                     FROM ${tableName}
                    WHERE user_id = $1
                RETURNING user_id, first_name, last_name, avatar, login, admin`;
    const selectData: QueryResult<UsersRow> = await db.query(
      `SELECT *
           FROM ${tableName}
          WHERE user_id = $1
      `,
      [id],
    );

    if (selectData.rows.length > 0) {
      const result: QueryResult<UsersRow> = await db.query(query, [id]);
      const data = result.rows[0];
      return {
        id: data.user_id,
        firstName: data.first_name,
        lastName: data.last_name,
        login: data.login,
        avatar: data.avatar,
        admin: data.admin,
      };
    }
    // TODO:fix эт не работает (узнать про метод next) возможно как-то связать с методом use у корневого app
    throw new Error('User not found');
  }
}

export default UsersService;
