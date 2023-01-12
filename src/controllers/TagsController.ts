import { NextFunction, Request, Response } from 'express';

import TagsService from '../service/TagsService';
import {
  RequestWithBody,
  RequestWithParams,
  RequestWithParamsAndBody,
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
      console.log(tag);

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

  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const tags = await TagsService.getAll();

      res.send(tags);
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
