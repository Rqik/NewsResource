import { NextFunction, Response } from 'express';

import { PostsService } from '../service/index';
import HttpStatuses from '../shared/HttpStatuses';
import {
  RequestWithBody,
  RequestWithParams,
  RequestWithParamsAndBody,
  RequestWithQuery,
} from './types';

class PostsController {
  static async create(
    req: RequestWithBody<{
      title: string;
      authorId: number;
      categoryId: number;
      body: string;
      mainImg: string;
      otherImgs: string[];
      tags: number[];
    }>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const post = await PostsService.create(req.body);

      res.send(post);
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      console.log(e.message);
      res.send({
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        ...e,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        message: e.message,
      });
      res.status(HttpStatuses.BAD_REQUEST);
    }
  }

  static async update(
    req: RequestWithParamsAndBody<
      { id: string },
      {
        title: string;
        authorId: number;
        categoryId: number;
        body: string;
        mainImg: string;
        otherImgs: string[];
      }
    >,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { id } = req.params;

      const post = await PostsService.update({ ...req.body, id: Number(id) });

      res.send(post);
    } catch (e) {
      next(e);
    }
  }

  static async partialUpdate(
    req: RequestWithParamsAndBody<
      { id: string },
      {
        title: string;
        authorId: number;
        categoryId: number;
        body: string;
        mainImg: string;
        otherImgs: string[];
      }
    >,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { id } = req.params;

      const post = await PostsService.partialUpdate({ ...req.body, id });

      res.send(post);
    } catch (e) {
      next(e);
    }
  }

  static async getAll(
    req: RequestWithQuery<{
      created_at: string;
      created_at__lt: string;
      created_at__gt: string;
    }>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const filter = new Map(Object.entries(req.query));
      const entries = Object.entries(req.query);
      const posts = await PostsService.getAll(req.query);

      console.log(req.query);
      // console.log('------------/');
      // console.log(entries);

      res.send({
        count: posts.length,
        data: posts,
      });
    } catch (e) {
      console.log(e);

      res.send(e);
    }
  }

  static async getOne(
    req: RequestWithParams<{ id: string }>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { id } = req.params;
      const post = await PostsService.getOne({ id });

      res.send(post);
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

      const post = await PostsService.delete({ id });

      res.send(post);
    } catch (e) {
      next(e);
    }
  }
}

export default PostsController;
