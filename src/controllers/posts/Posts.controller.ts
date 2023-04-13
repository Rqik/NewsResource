import { NextFunction, Response } from 'express';
import ApiError from '../../exceptions/ApiError';

import { AuthorsService, FileService, PostsService } from '../../service/index';
import paginator from '../../shared/paginator';
import {
  RequestWithBody,
  RequestWithParams,
  RequestWithParamsAndBody,
  RequestWithQuery,
} from '../types';
import type { IPost } from './posts.dto';
import PostsDto from './posts.dto';

class PostsController {
  static async create(
    req: RequestWithBody<IPost>,
    res: Response,
    next: NextFunction,
  ) {
    const main = req.files;
    const { mainImg, otherImgs } = main || {};
    const {
      body: { authorId },
    } = req;

    const { error, value } = new PostsDto(req.body).validate();
    if (error) {
      return next(error);
    }

    const [mainNameImg] = FileService.savePostImage(mainImg) || [];
    const otherNameImgs = FileService.savePostImage(otherImgs) || [];
    const author = await AuthorsService.getByUserId({ id: req.locals.user.id });
    if (author instanceof ApiError) {
      return next(author);
    }
    if (author === null || Number(authorId) !== author.id) {
      return next(ApiError.BadRequest('Not valid author id'));
    }
    const post = await PostsService.create({
      ...value,
      mainImg: mainNameImg,
      otherImgs: otherNameImgs,
    });

    return res.send(post);
  }

  static async update(
    req: RequestWithParamsAndBody<{ id: string }, IPost>,
    res: Response,
    next: NextFunction,
  ) {
    const { error, value } = new PostsDto(req.body).validate();
    if (error) {
      return next(error);
    }
    const { id } = req.params;
    const main = req.files;
    const { mainImg, otherImgs } = main || {};
    const [mainNameImg] = FileService.savePostImage(mainImg) || [];
    const otherNameImgs = FileService.savePostImage(otherImgs) || [];

    const post = await PostsService.update({
      ...value,
      id: Number(id),
      mainImg: mainNameImg,
      otherImgs: otherNameImgs,
    });

    return res.send(post);
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
  ) {
    const { id } = req.params;

    const post = await PostsService.partialUpdate({ ...req.body, id });

    res.send(post);
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
  ) {
    const { per_page: perPage = 10, page = 0 } = req.query;

    const { totalCount, count, posts } = await PostsService.getAll(req.query, {
      page: Number(page),
      perPage: Number(perPage),
    });

    const pagination = paginator({
      totalCount,
      count,
      req,
      route: '/posts',
      page: Number(page),
      perPage: Number(perPage),
    });

    res.send({ ...pagination, data: posts });
  }

  static async getOne(req: RequestWithParams<{ id: string }>, res: Response) {
    const { id } = req.params;
    const post = await PostsService.getOne({ id });

    res.send(post);
  }

  static async delete(req: RequestWithParams<{ id: string }>, res: Response) {
    const { id } = req.params;

    const post = await PostsService.delete({ id });

    res.send(post);
  }
}

export default PostsController;
