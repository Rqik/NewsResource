import { boundClass } from 'autobind-decorator';
import { NextFunction, Response } from 'express';

import { TagsService } from '@/services';
import paginator from '@/shared/paginator';

import {
  RequestWithBody,
  RequestWithParams,
  RequestWithParamsAndBody,
  RequestWithQuery,
} from '../types';
import TagDto from './tags.dto';

@boundClass
class TagsController {
  constructor(private tagsService: typeof TagsService) {}

  async create(
    req: RequestWithBody<{ title: string }>,
    res: Response,
    next: NextFunction,
  ) {
    const { error, value } = new TagDto(req.body).validate();
    if (error) {
      return next(error);
    }
    const tag = await this.tagsService.create(value);

    return res.send(tag);
  }

  async update(
    req: RequestWithParamsAndBody<{ id: string }, { title: string }>,
    res: Response,
    next: NextFunction,
  ) {
    const { id } = req.params;
    const { error, value } = new TagDto(req.body).validate();
    if (error) {
      return next(error);
    }
    const tag = await this.tagsService.update({ ...value, id });

    return res.send(tag);
  }

  async getAll(
    req: RequestWithQuery<{ per_page: string; page: string }>,
    res: Response,
  ) {
    const { per_page: perPage = 10, page = 0 } = req.query;

    const { totalCount, tags, count } = await this.tagsService.getAll({
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

  async getOne(req: RequestWithParams<{ id: string }>, res: Response) {
    const { id } = req.params;
    const tag = await this.tagsService.getOne({ id });

    res.send(tag);
  }

  async delete(req: RequestWithParams<{ id: string }>, res: Response) {
    const { id } = req.params;

    const removedTag = await this.tagsService.delete({ id });

    res.send(removedTag);
  }
}

export default new TagsController(TagsService);
