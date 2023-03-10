import { NextFunction, Response } from 'express';

import { AuthorsService } from '../service';
import paginator from '../shared/paginator';
import {
  RequestWithBody,
  RequestWithParams,
  RequestWithParamsAndBody,
  RequestWithQuery,
} from './types';

class AuthorsController {
  static async create(
    req: RequestWithBody<{ description: string; userId: number }>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { description, userId } = req.body;

      const result = await AuthorsService.create({
        description,
        userId,
      });

      res.send(result);
    } catch (e) {
      next(e);
    }
  }

  static async update(
    req: RequestWithParamsAndBody<
      { id: string },
      { description: string; userId: number }
    >,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { id } = req.params;
      const result = await AuthorsService.update({ ...req.body, id });

      res.send(result);
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

      console.log('sd');
      const { totalCount, count, authors } = await AuthorsService.getAll({
        page: Number(page),
        perPage: Number(perPage),
      });

      const pagination = paginator({
        totalCount,
        count,
        req,
        route: '/authors',
        page: Number(page),
        perPage: Number(perPage),
      });

      res.send({ ...pagination, data: authors });
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

      const result = await AuthorsService.getOne({ id });

      res.send(result);
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

      const result = await AuthorsService.delete({ id });

      res.send(result);
    } catch (e) {
      next(e);
    }
  }
}

export default AuthorsController;
