import { Request, Response } from 'express';
import { QueryResult } from 'pg';

import db from '../db';
import HttpStatuses from '../shared/HttpStatuses';
import {
  RequestWithBody,
  RequestWithParams,
  RequestWithParamsAndBody,
} from './types';

const tableName = 'authors';
type AuthorsRow = {
  author_id: number;
  fk_user_id: number;
  description: string;
};
class AuthorsController {
  static async create(
    req: RequestWithBody<{ description: string; user: number }>,
    res: Response,
  ) {
    const query = `INSERT INTO ${tableName} (description, fk_user_id)
                        VALUES ($1, $2)
                     RETURNING author_id, description, fk_user_id`;
    try {
      const { description, user } = req.body;
      console.log(description, user);

      const result: QueryResult<AuthorsRow> = await db.query(query, [
        description,
        user,
      ]);
      const data = result.rows[0];

      res.send({
        id: data.author_id,
        description: data.description,
        user: data.fk_user_id,
      });
    } catch (e) {
      res.send(e);
    }
  }

  static async update(
    req: RequestWithParamsAndBody<
      { id: string },
      { description: string; user: number }
    >,
    res: Response,
  ) {
    const query = `UPDATE ${tableName}
                      SET description = $1,
                          fk_user_id = $2
                    WHERE authors_id = $3
                RETURNING authors_id, description, fk_user_id`;
    try {
      const { id } = req.params;
      const { description, user } = req.body;
      const result: QueryResult<AuthorsRow> = await db.query(query, [
        description,
        user,
        id,
      ]);
      const data = result.rows[0];

      res.send({
        id: data.author_id,
        description: data.description,
        user: data.fk_user_id,
      });
    } catch (e) {
      res.send(e);
    }
  }

  static async get(req: Request, res: Response) {
    try {
      const result: QueryResult<AuthorsRow> = await db.query(
        `SELECT *
           FROM ${tableName}`,
      );

      res.send(result.rows);
    } catch (e) {
      res.send(e);
    }
  }

  static async getOne(req: RequestWithParams<{ id: string }>, res: Response) {
    const query = `SELECT *
                     FROM ${tableName}
                    WHERE author_id = $1`;
    try {
      const { id } = req.params;
      console.log(typeof id);
      const result: QueryResult<AuthorsRow> = await db.query(query, [id]);
      const data = result.rows[0];

      res.send({
        id: data.author_id,
        description: data.description,
        user: data.fk_user_id,
      });
    } catch (e) {
      res.send(e);
    }
  }

  static async delete(req: RequestWithParams<{ id: string }>, res: Response) {
    const query = `DELETE FROM ${tableName}
                    WHERE authors_id = $1
                RETURNING authors_id, description, fk_user_id`;
    try {
      const { id } = req.params;
      const selectData: QueryResult<AuthorsRow> = await db.query(
        `SELECT *
           FROM ${tableName}
          WHERE authors_id = $1
      `,
        [id],
      );

      if (selectData.rows.length > 0) {
        const result: QueryResult<AuthorsRow> = await db.query(query, [id]);
        const data = result.rows[0];
        res.send({
          id: data.author_id,
          description: data.description,
          user: data.fk_user_id,
        });
      } else {
        // TODO:fix эт не работает (узнать про метод next) возможно как-то связать с методом use у корневого app
        res.status(HttpStatuses.NOT_FOUND);
        throw new Error('Author not found');
      }
    } catch (e) {
      res.send(e);
    }
  }
}

export default AuthorsController;
