import { Response } from 'express';

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
  ) {
    const { description, userId } = req.body;

    const result = await AuthorsService.create({
      description,
      userId,
    });

    res.send(result);
  }

  static async update(
    req: RequestWithParamsAndBody<
      { id: string },
      { description: string; userId: number }
    >,
    res: Response,
  ) {
    const { id } = req.params;
    const result = await AuthorsService.update({ ...req.body, id });

    res.send(result);
  }

  static async getAll(
    req: RequestWithQuery<{ per_page: string; page: string }>,
    res: Response,
  ) {
    const { per_page: perPage = 10, page = 0 } = req.query;

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
  }

  static async getOne(req: RequestWithParams<{ id: string }>, res: Response) {
    const { id } = req.params;

    const result = await AuthorsService.getOne({ id });

    res.send(result);
  }

  static async delete(req: RequestWithParams<{ id: string }>, res: Response) {
    const { id } = req.params;

    const result = await AuthorsService.delete({ id });

    res.send(result);
  }
}

export default AuthorsController;
