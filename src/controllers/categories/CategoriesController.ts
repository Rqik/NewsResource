import { NextFunction, Response } from 'express';

import CategoriesService from '../../service/CategoriesService';
import paginator from '../../shared/paginator';
import {
  RequestWithBody,
  RequestWithParams,
  RequestWithParamsAndBody,
  RequestWithQuery,
} from '../types';
import CategoriesDto, { ICategory } from './categories.dto';

class CategoriesController {
  static async create(
    req: RequestWithBody<ICategory>,
    res: Response,
    next: NextFunction,
  ) {
    const { error, value } = new CategoriesDto(req.body).validate();

    if (error) {
      return next(error);
    }

    const newCategory = await CategoriesService.create(value);

    return res.send(newCategory);
  }

  static async update(
    req: RequestWithParamsAndBody<{ id: string }, ICategory>,
    res: Response,
    next: NextFunction,
  ) {
    const { id } = req.params;
    const { error, value } = new CategoriesDto(req.body).validate();

    if (error) {
      return next(error);
    }

    const categoryUpdated = await CategoriesService.update({
      id: Number(id),
      ...value,
    });

    return res.send(categoryUpdated);
  }

  static async getAll(
    req: RequestWithQuery<{ per_page: string; page: string }>,
    res: Response,
  ) {
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
  }

  static async getOne(req: RequestWithParams<{ id: string }>, res: Response) {
    const { id } = req.params;
    const category = await CategoriesService.getOne({ id: Number(id) });

    res.send(category);
  }

  static async delete(req: RequestWithParams<{ id: string }>, res: Response) {
    const { id } = req.params;

    const category = await CategoriesService.delete({ id: Number(id) });
    res.send(category);
  }
}

export default CategoriesController;
