import { Response, NextFunction } from 'express';

import { AuthorsService } from '../../service/index';
import paginator from '../../shared/paginator';
import {
  RequestWithBody,
  RequestWithParams,
  RequestWithParamsAndBody,
  RequestWithQuery,
} from '../types';
import type { IAuthor } from './authors.dto';
import AuthorsDto from './authors.dto';

class AuthorsController {
  static async create(
    req: RequestWithBody<IAuthor>,
    res: Response,
    next: NextFunction,
  ) {
    const { error, value } = new AuthorsDto(req.body).validate();

    if (error) {
      return next(error);
    }

    const result = await AuthorsService.create(value);

    return res.send(result);
  }

  static async update(
    req: RequestWithParamsAndBody<{ id: string }, IAuthor>,
    res: Response,
    next: NextFunction,
  ) {
    const { id } = req.params;
    const { error, value } = new AuthorsDto(req.body).validate();

    if (error) {
      return next(error);
    }

    const result = await AuthorsService.update({ ...value, id });

    return res.send(result);
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
