import { boundClass } from 'autobind-decorator';
import { NextFunction, Response } from 'express';

import { AuthorsService } from '@/services';
import paginator from '@/shared/paginator';

import {
  RequestWithBody,
  RequestWithParams,
  RequestWithParamsAndBody,
  RequestWithQuery,
} from '../types';
import type { IAuthor } from './authors.dto';
import AuthorsDto from './authors.dto';

@boundClass
class AuthorsController {
  constructor(private authorsService: typeof AuthorsService) {}

  async create(
    req: RequestWithBody<IAuthor>,
    res: Response,
    next: NextFunction,
  ) {
    const { error, value } = new AuthorsDto(req.body).validate();

    if (error) {
      return next(error);
    }

    const result = await this.authorsService.create(value);

    return res.send(result);
  }

  async update(
    req: RequestWithParamsAndBody<{ id: string }, IAuthor>,
    res: Response,
    next: NextFunction,
  ) {
    const { id } = req.params;
    const { error, value } = new AuthorsDto(req.body).validate();

    if (error) {
      return next(error);
    }

    const result = await this.authorsService.update({ ...value, id });

    return res.send(result);
  }

  async getAll(
    req: RequestWithQuery<{ per_page: string; page: string }>,
    res: Response,
  ) {
    const { per_page: perPage = 10, page = 0 } = req.query;

    const { totalCount, count, authors } = await this.authorsService.getAll({
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

  async getOne(req: RequestWithParams<{ id: string }>, res: Response) {
    const { id } = req.params;

    const result = await this.authorsService.getOne({ id });

    res.send(result);
  }

  async delete(req: RequestWithParams<{ id: string }>, res: Response) {
    const { id } = req.params;

    const result = await this.authorsService.delete({ id });

    res.send(result);
  }
}

export default new AuthorsController(AuthorsService);
