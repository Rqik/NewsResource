import { NextFunction, Response } from 'express';

import TagsService from '../service/TagsService';
import paginator from '../shared/paginator';
import {
  RequestWithBody,
  RequestWithParams,
  RequestWithParamsAndBody,
  RequestWithQuery,
} from './types';

class TagsController {
  static async create(
    req: RequestWithBody<{ title: string }>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { title } = req.body;
      const tag = await TagsService.create({ title });

      res.send(tag);
    } catch (e) {
      next(e);
    }
  }

  static async update(
    req: RequestWithParamsAndBody<{ id: string }, { title: string }>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { id } = req.params;
      const { title } = req.body;
      const tag = await TagsService.update({ title, id });

      res.send(tag);
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

      const { totalCount, tags, count } = await TagsService.getAll({
        page: Number(page),
        perPage: Number(perPage),
      });

      const pagination = paginator({
        totalCount,
        count,
        req,
        route: '/tags',
        page: Number(page),
        perPage: Number(perPage),
      });
      res.send({ ...pagination, data: tags });
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
      const tag = await TagsService.getOne({ id });

      res.send(tag);
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

      const removedTag = await TagsService.delete({ id });

      res.send(removedTag);
    } catch (e) {
      next(e);
    }
  }
}

export default TagsController;
