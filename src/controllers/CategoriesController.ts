import { NextFunction, Response } from 'express';
import { QueryResult } from 'pg';

import db from '../db';
import CategoriesService from '../service/CategoriesService';
import paginator from '../shared/paginator';
import {
  RequestWithBody,
  RequestWithParams,
  RequestWithParamsAndBody,
  RequestWithQuery,
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
    next: NextFunction,
  ) {
    const query = `INSERT INTO ${tableName} (description, fk_category_id)
                   VALUES ($1, $2)
                RETURNING category_id, description, fk_category_id`;
    try {
      const { description, category } = req.body;
      const { rows }: QueryResult<CategoriesRow> = await db.query(query, [
        description,
        category,
      ]);

      const data = rows[0];

      res.send({
        id: data.category_id,
        description: data.description,
        fk_category: data.fk_category_id,
      });
    } catch (e) {
      next(e);
    }
  }

  static async update(
    req: RequestWithParamsAndBody<
      { id: string },
      { description: string; category?: string }
    >,
    res: Response,
    next: NextFunction,
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
      next(e);
    }
  }

  static async getAll(
    req: RequestWithQuery<{ per_page: string; page: string }>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { per_page: perPage = 10, page = 0 } = req.query;

      const { totalCount, count, categories } = await CategoriesService.getAll({
        page: Number(page),
        perPage: Number(perPage),
      });

      const pagination = paginator({
        totalCount,
        count,
        req,
        route: '/categories',
        page: Number(page),
        perPage: Number(perPage),
      });
      res.send({ ...pagination, data: categories });
    } catch (e) {
      next(e);
    }
  }

  static async getOne(
    req: RequestWithParams<{ id: string }>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { id } = req.params;
      const category = await CategoriesService.getOne({ id: Number(id) });

      res.send(category);
    } catch (e) {
      next(e);
    }
  }

  static async delete(
    req: RequestWithParams<{ id: string }>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { id } = req.params;

      const category = await CategoriesService.delete({ id: Number(id) });
      res.send(category);
    } catch (e) {
      next(e);
    }
  }
}

export default CategoriesController;
