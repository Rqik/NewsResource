import { Request, Response } from 'express';
import { QueryResult } from 'pg';

import db from '../db';
import HttpStatuses from '../shared/HttpStatuses';
import { RequestWithParams } from './types';

/* eslint-disable @typescript-eslint/no-empty-function */
const tableName = 'categories';

type CategoryRow = {
  category_id: number;
  description: string;
  fk_category_id: number | null;
};

const queryCategoriesRecursive = (nameTemplate = 'catR') => `
  WITH RECURSIVE ${nameTemplate}(id, category, arr_categories, arr_category_id) as (
    SELECT category_id, description, array[description::varchar], array[category_id]
      FROM categories
    WHERE fk_category_id IS NUll

    UNION

    SELECT category_id, description, description || arr_categories, category_id || arr_category_id
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
    const result: QueryResult<CategoryRow> = await db.query(query, [
      description,
      category,
    ]);

    const data = result.rows[0];

    return CategoriesService.convertCategory(data);
  }

  static async update({
    id,
    description,
    category,
  }: {
    id: number;
    description: string;
    category?: string;
  }) {
    const query = `UPDATE ${tableName}
                      SET description = $1,
                          fk_category_id = $2
                    WHERE category_id = $3
                RETURNING category_id, description, fk_category_id`;
    const result: QueryResult<CategoryRow> = await db.query(query, [
      description,
      category,
      id,
    ]);
    const data = result.rows[0];
    return CategoriesService.convertCategory(data);
  }

  static async getAll() {
    const result: QueryResult<CategoryRow> = await db.query(
      `SELECT *
           FROM ${tableName}`,
    );
    return result.rows.map((category) =>
      CategoriesService.convertCategory(category),
    );
  }

  static async getOne({ id }: { id: number }) {
    const query = `SELECT *
                     FROM ${tableName}
                    WHERE category_id = $1`;
    const result: QueryResult<CategoryRow> = await db.query(query, [id]);

    const data = result.rows[0];
    return CategoriesService.convertCategory(data);
  }

  static async delete({ id }: { id: number }) {
    const query = `DELETE
                     FROM ${tableName}
                    WHERE category_id = $1
                RETURNING category_id, description, fk_category_id`;

    const selectData: QueryResult<CategoryRow> = await db.query(
      `SELECT *
           FROM ${tableName}
          WHERE category_id = $1`,
      [id],
    );

    if (selectData.rows.length > 0) {
      const result: QueryResult<CategoryRow> = await db.query(query, [id]);
      const data = result.rows[0];
      return CategoriesService.convertCategory(data);
    }
    throw new Error('Category not found');
  }

  private static convertCategory(category: CategoryRow) {
    return {
      id: category.category_id,
      description: category.description,
      fk_category: category.fk_category_id,
    };
  }
}

export { queryCategoriesRecursive };
export default CategoriesService;
