import { Request, Response } from 'express';
import { QueryResult } from 'pg';

import db from '../db';
import CategoriesService from '../service/CategoriesService';
import {
  RequestWithBody,
  RequestWithParams,
  RequestWithParamsAndBody,
} from './types';

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
    try {
      const { id } = req.params;
      const { description, category } = req.body;
      const categoryUpdated = await CategoriesService.update({
        id: Number(id),
        description,
        category,
      });
      res.send(categoryUpdated);
    } catch (e) {
      res.send(e);
    }
  }

  static async getAll(req: Request, res: Response) {
    try {
      const categories = await CategoriesService.getAll();

      res.send(categories);
    } catch (e) {
      res.send(e);
    }
  }

  static async getOne(req: RequestWithParams<{ id: string }>, res: Response) {
    try {
      const { id } = req.params;
      const category = await CategoriesService.getOne({ id: Number(id) });

      res.send(category);
    } catch (e) {
      res.send(e);
    }
  }

  static async delete(req: RequestWithParams<{ id: string }>, res: Response) {
    try {
      const { id } = req.params;

      const category = await CategoriesService.delete({ id: Number(id) });
      res.send(category);
    } catch (e) {
      res.send(e);
    }
  }
}

export default CategoriesController;
