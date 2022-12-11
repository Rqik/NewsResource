import { Request, Response } from 'express';
import { QueryResult } from 'pg';

import db from '../db';
import HttpStatuses from '../shared/HttpStatuses';
import {
  RequestWithBody,
  RequestWithParams,
  RequestWithParamsAndBody,
} from './types';

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
class UsersController {
  static async create(
    req: RequestWithBody<{
      firstName: string;
      lastName: string;
      avatar: string;
      login: string;
      password: string;
    }>,
    res: Response,
  ) {
    const query = `INSERT INTO ${tableName} (first_name, last_name, avatar, login, password)
                      VALUES ($1, $2, $3, $4, $5)
                      RETURNING user_id, first_name, last_name, avatar, login, password, create_at, admin`;
    try {
      const { firstName, lastName, avatar, login, password } = req.body;
      const result: QueryResult<UsersRow> = await db.query(query, [
        firstName,
        lastName,
        avatar,
        login,
        password,
      ]);
      const data = result.rows[0];

      res.send({
        id: data.user_id,
        firstName: data.first_name,
        lastName: data.last_name,
        avatar: data.avatar,
        login: data.login,
        admin: data.admin,
      });
    } catch (e) {
      res.send(e);
    }
  }

  static async update(
    req: RequestWithParamsAndBody<
      { id: string },
      {
        firstName: string;
        lastName: string;
        avatar: string;
        login: string;
        password: string;
      }
    >,
    res: Response,
  ) {
    const query = `UPDATE ${tableName}
                      SET firstName = $1,
                      lastName = $2,
                      avatar = $3,
                      login = $4,
                      password = $5
                      WHERE user_id = $6
                      RETURNING user_id, first_name, last_name, avatar, login, admin`;

    try {
      const { id } = req.params;
      const { firstName, lastName, avatar, login, password } = req.body;
      const result: QueryResult<UsersRow> = await db.query(query, [
        firstName,
        lastName,
        avatar,
        login,
        password,
        id,
      ]);
      const data = result.rows[0];

      res.send({
        id: data.user_id,
        firstName: data.first_name,
        lastName: data.last_name,
        avatar: data.avatar,
        login: data.login,
        admin: data.admin,
      });
    } catch (e) {
      res.send(e);
    }
  }

  static async partialUpdate(
    req: RequestWithParamsAndBody<
      { id: string },
      {
        firstName?: string;
        lastName?: string;
        avatar?: string;
        login?: string;
        password?: string;
      }
    >,
    res: Response,
  ) {
    const bodyProps = Object.keys(req.body);
    const bodyValues = Object.values(req.body);
    const snakeReg = /([a-z0–9])([A-Z])/g;
    const setParams = bodyProps.map(
      (el, i) => `${el.replace(snakeReg, '$1_$2').toLowerCase()} = $${i + 1}`,
    );

    const query = `UPDATE ${tableName}
                      SET ${setParams.join(', \n')}
                      WHERE user_id = $${setParams.length + 1}
                      RETURNING user_id, first_name, last_name, avatar, login, admin`;

    try {
      const { id } = req.params;
      const result: QueryResult<UsersRow> = await db.query(query, [
        ...bodyValues,
        id,
      ]);
      const data = result.rows[0];

      res.send({
        id: data.user_id,
        firstName: data.first_name,
        lastName: data.last_name,
        avatar: data.avatar,
        login: data.login,
        admin: data.admin,
      });
    } catch (e) {
      res.send(e);
    }
  }

  static async get(req: Request, res: Response) {
    try {
      const result: QueryResult<UsersRow> = await db.query(
        `SELECT * FROM ${tableName}`,
      );

      res.send(result.rows);
    } catch (e) {
      res.send(e);
    }
  }

  static async getOne(req: RequestWithParams<{ id: string }>, res: Response) {
    const query = `SELECT * FROM ${tableName} WHERE user_id = $1`;
    try {
      const { id } = req.params;
      const result: QueryResult<UsersRow> = await db.query(query, [id]);
      const data = result.rows[0];

      res.send({
        id: data.user_id,
        firstName: data.first_name,
        lastName: data.last_name,
        login: data.login,
        avatar: data.avatar,
        admin: data.admin,
      });
    } catch (e) {
      res.send(e);
    }
  }

  static async delete(req: RequestWithParams<{ id: string }>, res: Response) {
    const query = `DELETE FROM ${tableName}
                    WHERE user_id = $1
                    RETURNING user_id, first_name, last_name, avatar, login, admin`;
    try {
      const { id } = req.params;
      const selectData: QueryResult<UsersRow> = await db.query(
        `SELECT * FROM ${tableName}
          WHERE user_id = $1
      `,
        [id],
      );

      if (selectData.rows.length > 0) {
        const result: QueryResult<UsersRow> = await db.query(query, [id]);
        const data = result.rows[0];
        res.send({
          id: data.user_id,
          firstName: data.first_name,
          lastName: data.last_name,
          login: data.login,
          avatar: data.avatar,
          admin: data.admin,
        });
      } else {
        // TODO:fix эт не работает (узнать про метод next) возможно как-то связать с методом use у корневого app
        res.status(HttpStatuses.NOT_FOUND);
        throw new Error('User not found');
      }
    } catch (e) {
      res.send(e);
    }
  }
}

export default UsersController;
