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

const queryCategoriesRecursive = (nameTemplate = 'catR') => `
  WITH RECURSIVE ${nameTemplate}(id, category,arr_categories) as (
    SELECT category_id, description, array[description::varchar]
      FROM categories
    WHERE fk_category_id IS NUll

    UNION

    SELECT category_id, description, description || arr_categories
      FROM categories
      JOIN ${nameTemplate} ON categories.fk_category_id = ${nameTemplate}.id
  )
`;

class CategoriesService {
  static async create({
    description,
    category,
  }: {
    description: string;
    category?: string;
  }) {
    const query = `INSERT INTO ${tableName} (description, fk_category_id)
                   VALUES ($1, $2)
                RETURNING category_id, description, fk_category_id`;
    const result: QueryResult<CategoriesRow> = await db.query(query, [
      description,
      category,
    ]);

    const data = result.rows[0];

    return {
      id: data.category_id,
      description: data.description,
      fk_category: data.fk_category_id,
    };
  }

  static async update({
    id,
    description,
    category,
  }: {
    id: string;
    description: string;
    category?: string;
  }) {
    const query = `UPDATE ${tableName}
                      SET description = $1,
                          fk_category_id = $2
                    WHERE category_id = $3
                RETURNING category_id, description, fk_category_id`;
    const result: QueryResult<CategoriesRow> = await db.query(query, [
      description,
      category,
      id,
    ]);
    const data = result.rows[0];
    return {
      id: data.category_id,
      description: data.description,
      fk_category: data.fk_category_id,
    };
  }

  static async getAll(req: Request, res: Response) {
    try {
      const result: QueryResult<CategoriesRow> = await db.query(
        `SELECT *
           FROM ${tableName}`,
      );

      res.send(result.rows);
    } catch (e) {
      res.send(e);
    }
  }

  static async getOne({ id }: { id: string }) {
    const query = `SELECT *
                     FROM ${tableName}
                    WHERE category_id = $1`;
    const result: QueryResult<CategoriesRow> = await db.query(query, [id]);

    const data = result.rows[0];
    return {
      id: data.category_id,
      description: data.description,
      fk_category: data.fk_category_id,
    };
  }

  static async delete(req: RequestWithParams<{ id: string }>, res: Response) {
    const query = `DELETE
                     FROM ${tableName}
                    WHERE category_id = $1
                RETURNING category_id, description, fk_category_id`;
    const { id } = req.params;
    const selectData: QueryResult<CategoriesRow> = await db.query(
      `SELECT *
           FROM ${tableName}
          WHERE category_id = $1`,
      [id],
    );

    if (selectData.rows.length > 0) {
      const result: QueryResult<CategoriesRow> = await db.query(query, [id]);
      const data = result.rows[0];
      return {
        id: data.category_id,
        description: data.description,
        fk_category: data.fk_category_id,
      };
    }
    // TODO:fix эт не работает (узнать про метод next) возможно как-то связать с методом use у корневого app
    res.status(HttpStatuses.NOT_FOUND);
    throw new Error('Category not found');
  }
}

export { queryCategoriesRecursive };
export default CategoriesService;
