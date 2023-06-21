import { boundClass } from 'autobind-decorator';
import { NextFunction, Response } from 'express';

import { CategoriesService } from '@/services';
import { paginator } from '@/shared';

import {
  RequestWithBody,
  RequestWithParams,
  RequestWithParamsAndBody,
  RequestWithQuery,
} from '../types';
import CategoriesDto, { ICategory } from './categories.dto';

@boundClass
class CategoriesController {
  constructor(private categoriesService: typeof CategoriesService) {}

  async create(
    req: RequestWithBody<ICategory>,
    res: Response,
    next: NextFunction,
  ) {
    const { error, value } = new CategoriesDto(req.body).validate();

    if (error) {
      return next(error);
    }

    const newCategory = await this.categoriesService.create(value);

    return res.send(newCategory);
  }

  async update(
    req: RequestWithParamsAndBody<{ id: string }, ICategory>,
    res: Response,
    next: NextFunction,
  ) {
    const { id } = req.params;
    const { error, value } = new CategoriesDto(req.body).validate();

    if (error) {
      return next(error);
    }

    const categoryUpdated = await this.categoriesService.update({
      id: Number(id),
      ...value,
    });

    return res.send(categoryUpdated);
  }

  async getAll(
    req: RequestWithQuery<{ per_page: string; page: string }>,
    res: Response,
  ) {
    const { per_page: perPage = 10, page = 0 } = req.query;

    const { totalCount, count, categories } =
      await this.categoriesService.getAll({
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
  }

  async getOne(req: RequestWithParams<{ id: string }>, res: Response) {
    const { id } = req.params;
    const category = await this.categoriesService.getOne({ id: Number(id) });

    res.send(category);
  }

  async delete(req: RequestWithParams<{ id: string }>, res: Response) {
    const { id } = req.params;

    const category = await this.categoriesService.delete({ id: Number(id) });
    res.send(category);
  }
}

export default new CategoriesController(CategoriesService);
