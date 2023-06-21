import { boundClass } from 'autobind-decorator';
import { NextFunction, Response } from 'express';

import { ApiError } from '@/exceptions';
import {
  AuthorsService,
  FileService,
  PostsDraftsService,
  PostsService,
} from '@/services';
import paginator from '@/shared/paginator';

import {
  RequestWithParams,
  RequestWithParamsAndBody,
  RequestWithParamsAnQuery,
} from '../types';
import PostsDraftsDto, { IPostDrafts } from './posts-drafts.dto';

@boundClass
class PostsDraftsController {
  constructor(
    private authorsService: typeof AuthorsService,
    private fileService: typeof FileService,
    private postsDraftsService: typeof PostsDraftsService,
    private postsService: typeof PostsService,
  ) {}

  async create(
    req: RequestWithParamsAndBody<{ id: string }, IPostDrafts>,
    res: Response,
    next: NextFunction,
  ) {
    const { id } = req.params;
    const main = req.files;
    const { mainImg, otherImgs } = main || {};
    const { error, value } = new PostsDraftsDto(req.body).validate();
    if (error) {
      return next(error);
    }
    const author = await PostsDraftsController.authorValidate(req);
    if (author instanceof ApiError) {
      return next(ApiError.NotFound());
    }
    const [mainNameImg] = this.fileService.savePostImage(mainImg) || [];
    const otherNameImgs = this.fileService.savePostImage(otherImgs) || [];

    const draft = await this.postsDraftsService.create({
      ...value,
      postId: Number(id),
      authorId: author.id,
      mainImg: mainNameImg,
      otherImgs: otherNameImgs,
    });

    return res.send(draft);
  }

  async update(
    req: RequestWithParamsAndBody<{ id: string; did: string }, IPostDrafts>,
    res: Response,
    next: NextFunction,
  ) {
    const { id, did } = req.params;
    const { error, value } = new PostsDraftsDto(req.body).validate();
    if (error) {
      return next(error);
    }
    const main = req.files;
    const { mainImg, otherImgs } = main || {};

    const author = await this.authorsService.getByUserId({
      id: req.locals.user.id,
    });
    const post = await this.postsService.getOne({ id });

    if (author instanceof ApiError) {
      return next(author);
    }

    if (author === null || post.author.id !== author.id) {
      return next(ApiError.NotFound());
    }
    const [mainNameImg] = this.fileService.savePostImage(mainImg) || [];
    const otherNameImgs = this.fileService.savePostImage(otherImgs) || [];

    const result = await this.postsDraftsService.update({
      ...value,
      postId: Number(id),
      draftId: Number(did),
      authorId: author.id,
      mainImg: mainNameImg,
      otherImgs: otherNameImgs,
    });

    return res.send(result);
  }

  async getAll(
    req: RequestWithParamsAnQuery<
      { id: string },
      { per_page: string; page: string }
    >,
    res: Response,
    next: NextFunction,
  ) {
    const { per_page: perPage = 10, page = 0 } = req.query;
    const { id } = req.params;
    const author = await PostsDraftsController.authorValidate(req);
    if (author instanceof ApiError) {
      next(author);
    } else {
      const { totalCount, count, drafts } =
        await this.postsDraftsService.getDraftsPost(
          {
            postId: Number(id),
            authorId: author.id,
          },
          {
            page: Number(page),
            perPage: Number(perPage),
          },
        );
      const pagination = paginator({
        totalCount,
        count,
        req,
        route: `/posts/${id}/drafts`,
        page: Number(page),
        perPage: Number(perPage),
      });
      res.send({ ...pagination, drafts });
    }
  }

  async getOne(
    req: RequestWithParams<{ id: string; did: string }>,
    res: Response,
    next: NextFunction,
  ) {
    const { id, did } = req.params;
    const author = await PostsDraftsController.authorValidate(req);

    if (author instanceof ApiError) {
      next(author);
    } else {
      const result = await this.postsDraftsService.getOne({
        postId: Number(id),
        draftId: Number(did),
        authorId: author.id,
      });

      res.send(result);
    }
  }

  async delete(
    req: RequestWithParams<{ id: string; did: string }>,
    res: Response,
  ) {
    const { id, did } = req.params;
    await PostsDraftsController.authorValidate(req);
    const result = await this.postsDraftsService.delete({
      postId: Number(id),
      draftId: Number(did),
    });

    res.send(result);
  }

  async publish(
    req: RequestWithParams<{ id: string; did: string }>,
    res: Response,
    next: NextFunction,
  ) {
    const { id, did } = req.params;
    const author = await PostsDraftsController.authorValidate(req);
    if (author instanceof ApiError) {
      next(author);
    } else {
      const result = await this.postsDraftsService.publish({
        postId: Number(id),
        draftId: Number(did),
      });

      res.send(result);
    }
  }

  private async authorValidate(req: RequestWithParams<{ id: string }>) {
    const { id } = req.params;

    if (req.locals.user.id !== id) {
      return ApiError.NotFound();
    }

    const author = await this.authorsService.getByUserId({
      id: req.locals.user.id,
    });

    if (author instanceof ApiError) {
      return author;
    }

    if (author === null) {
      return ApiError.NotFound();
    }

    return author;
  }
}

export default PostsDraftsController;
