import { NextFunction, Response } from 'express';

import { PostsService } from '../service/index';
import paginator from '../shared/paginator';
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
      next();
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
      created_at?: string;
      created_at__lt?: string;
      created_at__gt?: string;
      category?: string;
      title?: string;
      body?: string;
      categories__in?: string;
      categories__all?: string;
      tag?: string;
      tags__in?: string;
      tags__all?: string;
      page?: string;
      per_page?: string;
    }>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { per_page: perPage = 10, page = 0 } = req.query;

      const { totalCount, count, posts } = await PostsService.getAll(
        req.query,
        {
          page: Number(page),
          perPage: Number(perPage),
        },
      );

      const pagination = paginator({
        totalCount,
        count,
        req,
        route: '/posts',
        page: Number(page),
        perPage: Number(perPage),
      });

      res.send({ ...pagination, data: posts });
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
