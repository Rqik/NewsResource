import { boundClass } from 'autobind-decorator';
import { NextFunction, Response } from 'express';

import ApiError from '@/exceptions/ApiError';
import { AuthorsService, FileService, PostsService } from '@/services';
import paginator from '@/shared/paginator';

import {
  RequestWithBody,
  RequestWithParams,
  RequestWithParamsAndBody,
  RequestWithQuery,
} from '../types';
import type { IPost } from './posts.dto';
import PostsDto from './posts.dto';

@boundClass
class PostsController {
  constructor(
    private postsService: typeof PostsService,
    private authorsService: typeof AuthorsService,
    private fileService: typeof FileService,
  ) {}

  async create(req: RequestWithBody<IPost>, res: Response, next: NextFunction) {
    const main = req.files;
    const { mainImg, otherImgs } = main || {};
    const {
      body: { authorId },
    } = req;

    const { error, value } = new PostsDto(req.body).validate();
    if (error) {
      return next(error);
    }

    const [mainNameImg] = this.fileService.savePostImage(mainImg) || [];
    const otherNameImgs = this.fileService.savePostImage(otherImgs) || [];
    const author = await this.authorsService.getByUserId({
      id: req.locals.user.id,
    });
    if (author instanceof ApiError) {
      return next(author);
    }
    if (author === null || Number(authorId) !== author.id) {
      return next(ApiError.BadRequest('Not valid author id'));
    }
    const post = await this.postsService.create({
      ...value,
      mainImg: mainNameImg,
      otherImgs: otherNameImgs,
    });

    return res.send(post);
  }

  async update(
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
    const [mainNameImg] = this.fileService.savePostImage(mainImg) || [];
    const otherNameImgs = this.fileService.savePostImage(otherImgs) || [];

    const post = await this.postsService.update({
      ...value,
      id: Number(id),
      mainImg: mainNameImg,
      otherImgs: otherNameImgs,
    });

    return res.send(post);
  }

  async partialUpdate(
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

    const post = await this.postsService.partialUpdate({ ...req.body, id });

    res.send(post);
  }

  async getAll(
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

    const { totalCount, count, posts } = await this.postsService.getAll(
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
  }

  async getOne(req: RequestWithParams<{ id: string }>, res: Response) {
    const { id } = req.params;
    const post = await this.postsService.getOne({ id });

    res.send(post);
  }

  async delete(req: RequestWithParams<{ id: string }>, res: Response) {
    const { id } = req.params;

    const post = await this.postsService.delete({ id });

    res.send(post);
  }
}

export default new PostsController(PostsService, AuthorsService);
