import { Request, Response } from 'express';
import { QueryResult } from 'pg';
import db from '../db';
import HttpStatuses from '../shared/HttpStatuses';
import {
  RequestWithBody,
  RequestWithParams,
  RequestWithParamsAndBody,
} from './types';

type DraftsRow = {
  draft_id: number;
  create_at: Date;
  updated_at: Date;
  fk_user_id: number;
  body: string;
};

const tableName = 'drafts';
class DraftsController {
  static async create(req: RequestWithBody<{ title: string }>, res: Response) {
    const query = `INSERT INTO ${tableName} (title)
                        VALUES ($1)
                     RETURNING tag_id, title`;
    try {
      const { title } = req.body;
      const result: QueryResult<DraftsRow> = await db.query(query, [title]);
      const data = result.rows[0];

      res.send({
        id: data.draft_id,
        createAt: data.create_at,
        updateAt: data.updated_at,
        userId: data.fk_user_id,
        body: data.body,
      });
    } catch (e) {
      res.send(e);
    }
  }

  static async update(
    req: RequestWithParamsAndBody<{ id: string }, { title: string }>,
    res: Response,
  ) {
    const query = `UPDATE ${tableName}
                      SET title = $1
                    WHERE tag_id = $2
                RETURNING tag_id, title`;
    try {
      const { id } = req.params;
      const { title } = req.body;
      const result: QueryResult<DraftsRow> = await db.query(query, [title, id]);
      const data = result.rows[0];

      res.send({
        id: data.draft_id,
        createAt: data.create_at,
        updateAt: data.updated_at,
        userId: data.fk_user_id,
        body: data.body,
      });
    } catch (e) {
      res.send(e);
    }
  }

  static async getAll(req: Request, res: Response) {
    try {
      const result: QueryResult<DraftsRow> = await db.query(
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
                    WHERE tag_id = $1`;
    try {
      const { id } = req.params;
      const result: QueryResult<DraftsRow> = await db.query(query, [id]);
      const data = result.rows[0];

      res.send({
        id: data.draft_id,
        createAt: data.create_at,
        updateAt: data.updated_at,
        userId: data.fk_user_id,
        body: data.body,
      });
    } catch (e) {
      res.send(e);
    }
  }

  static async delete(req: RequestWithParams<{ id: string }>, res: Response) {
    const query = `DELETE
                     FROM ${tableName}
                    WHERE tag_id = $1
                RETURNING tag_id, title`;
    const queryNewsTags = `DELETE
                             FROM news_${tableName}
                            WHERE fk_tag_id = $1

    `;
    try {
      const { id } = req.params;
      const selectData: QueryResult<DraftsRow> = await db.query(
        `SELECT * FROM ${tableName}
          WHERE tag_id = $1
      `,
        [id],
      );

      if (selectData.rows.length > 0) {
        await db.query(queryNewsTags, [id]);
        const result: QueryResult<DraftsRow> = await db.query(query, [id]);
        const data = result.rows[0];

        res.send({
          id: data.draft_id,
          createAt: data.create_at,
          updateAt: data.updated_at,
          userId: data.fk_user_id,
          body: data.body,
        });
      } else {
        // TODO:fix эт не работает (узнать про метод next) возможно как-то связать с методом use у корневого app
        res.status(HttpStatuses.NOT_FOUND);
        throw new Error('Tag not found');
      }
    } catch (e) {
      res.send(e);
    }
  }

  static async publish() {}
}

export default new DraftsController();
