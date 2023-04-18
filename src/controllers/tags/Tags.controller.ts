import { Response, NextFunction } from 'express';

import TagsService from '../../service/tags/Tags.service';
import paginator from '../../shared/paginator';
import {
  RequestWithBody,
  RequestWithParams,
  RequestWithParamsAndBody,
  RequestWithQuery,
} from '../types';
import TagDto from './tags.dto';

class TagsController {
  static async create(
    req: RequestWithBody<{ title: string }>,
    res: Response,
    next: NextFunction,
  ) {
    const { error, value } = new TagDto(req.body).validate();
    if (error) {
      return next(error);
    }
    const tag = await TagsService.create(value);

    return res.send(tag);
  }

  static async update(
    req: RequestWithParamsAndBody<{ id: string }, { title: string }>,
    res: Response,
    next: NextFunction,
  ) {
    const { id } = req.params;
    const { error, value } = new TagDto(req.body).validate();
    if (error) {
      return next(error);
    }
    const tag = await TagsService.update({ ...value, id });

    return res.send(tag);
  }

  static async getAll(
    req: RequestWithQuery<{ per_page: string; page: string }>,
    res: Response,
  ) {
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
  }

  static async getOne(req: RequestWithParams<{ id: string }>, res: Response) {
    const { id } = req.params;
    const tag = await TagsService.getOne({ id });

    res.send(tag);
  }

  static async delete(req: RequestWithParams<{ id: string }>, res: Response) {
    const { id } = req.params;

    const removedTag = await TagsService.delete({ id });

    res.send(removedTag);
  }
}

export default TagsController;
