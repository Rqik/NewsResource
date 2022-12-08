import { Request, Response } from 'express';
import { QueryResult } from 'pg';

import db from '../db';
import HttpStatuses from '../shared/HttpStatuses';
import {
  RequestWithBody,
  RequestWithParams,
  RequestWithParamsAndBody,
} from './types';

/* eslint-disable @typescript-eslint/no-empty-function */
const tableName = 'categories';
type CategoriesRow = {
  category_id: number;
  description: string;
  fk_category_id: number | null;
};

class CategoriesController {
  static async create(
    req: RequestWithBody<{ description: string; category?: string }>,
    res: Response,
  ) {
    const query = `INSERT INTO ${tableName} (description, fk_category_id)
                      VALUES ($1, $2)
                      RETURNING category_id, description, fk_category_id`;
    try {
      const { description, category } = req.body;
      const result: QueryResult<CategoriesRow> = await db.query(query, [
        description,
        category,
      ]);

      const data = result.rows[0];

      res.send({
        id: data.category_id,
        description: data.description,
        fk_category: data.fk_category_id,
      });
    } catch (e) {
      res.send(e);
    }
  }

  static async update(
    req: RequestWithParamsAndBody<
      { id: string },
      { description: string; category?: string }
    >,
    res: Response,
  ) {
    const query = `UPDATE ${tableName}
                      SET description = $1,
                          fk_category_id = $2
                      WHERE category_id = $3
                      RETURNING category_id, description, fk_category_id`;
    try {
      const { id } = req.params;
      const { description, category } = req.body;
      const result: QueryResult<CategoriesRow> = await db.query(query, [
        description,
        category,
        id,
      ]);
      const data = result.rows[0];
      res.send({
        id: data.category_id,
        description: data.description,
        fk_category: data.fk_category_id,
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
    const query = `SELECT * FROM ${tableName} WHERE category_id = $1`;
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
                    WHERE category_id = $1
                    RETURNING category_id, description, fk_category_id`;
    try {
      const { id } = req.params;
      const selectData: QueryResult<CategoriesRow> = await db.query(
        `SELECT * FROM ${tableName}
          WHERE category_id = $1
      `,
        [id],
      );

      if (selectData.rows.length > 0) {
        const result = await db.query(query, [id]);
        const data = result.rows[0];
        res.send({
          id: data.category_id,
          description: data.description,
          fk_category: data.fk_category_id,
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

export default CategoriesController;
