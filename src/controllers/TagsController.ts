import { Request, Response } from 'express';
import { QueryResult } from 'pg';
import db from '../db';
import HttpStatuses from '../shared/HttpStatuses';
import {
  RequestWithBody,
  RequestWithParams,
  RequestWithParamsAndBody,
} from './types';

const tableName = 'tags';
type TagsRow = { tag_id: number; title: string };
class TagsController {
  static async create(req: RequestWithBody<{ title: string }>, res: Response) {
    const query = `INSERT INTO ${tableName} (title)
                      VALUES ($1)
                      RETURNING tag_id, title`;
    try {
      const { title } = req.body;
      const result: QueryResult<TagsRow> = await db.query(query, [title]);

      const data = result.rows[0];

      res.send({
        id: data.tag_id,
        title: data.title,
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
      const result: QueryResult<TagsRow> = await db.query(query, [title, id]);
      const data = result.rows[0];

      res.send({
        id: data.tag_id,
        title: data.title,
      });
    } catch (e) {
      res.send(e);
    }
  }

  static async get(req: Request, res: Response) {
    try {
      const result = await db.query(`SELECT * FROM ${tableName}`);

      res.send(result.rows);
    } catch (e) {
      res.send(e);
    }
  }

  static async getOne(req: RequestWithParams<{ id: string }>, res: Response) {
    const query = `SELECT * FROM ${tableName} WHERE tag_id = $1`;
    try {
      const { id } = req.params;
      const result = await db.query(query, [id]);

      res.send(result.rows[0]);
    } catch (e) {
      res.send(e);
    }
  }

  static async delete(req: RequestWithParams<{ id: string }>, res: Response) {
    const query = `DELETE FROM ${tableName}
                    WHERE tag_id = $1
                    RETURNING tag_id, title`;
    try {
      const { id } = req.params;
      const selectData: QueryResult<TagsRow> = await db.query(
        `SELECT * FROM ${tableName}
          WHERE tag_id = $1
      `,
        [id],
      );

      if (selectData.rows.length > 0) {
        const result: QueryResult<TagsRow> = await db.query(query, [id]);
        const data = result.rows[0];

        res.send({
          id: data.tag_id,
          title: data.title,
        });
      } else {
        // TODO:fix эт не работает (узнать про метод next) возможно как-то связать с методом use у корневого app
        res.status(HttpStatuses.NOT_FOUND);
        throw new Error('Category not found');
      }
    } catch (e) {
      res.send(e);
    }
  }
}

export default TagsController;
