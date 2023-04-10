import { Response, NextFunction } from 'express';

import { ApiError } from '../../exceptions';
import {
  AuthorsService,
  FileService,
  PostsDraftService,
  PostsService,
} from '../../service';
import paginator from '../../shared/paginator';
import {
  RequestWithParams,
  RequestWithParamsAndBody,
  RequestWithParamsAnQuery,
} from '../types';
import PostsDraftsDto, { IPostDrafts } from './posts-drafts.dto';

class PostsDraftsController {
  static async create(
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
    const [mainNameImg] = FileService.savePostImage(mainImg) || [];
    const otherNameImgs = FileService.savePostImage(otherImgs) || [];

    const draft = await PostsDraftService.create({
      ...value,
      postId: Number(id),
      authorId: author.id,
      mainImg: mainNameImg,
      otherImgs: otherNameImgs,
    });

    return res.send(draft);
  }

  static async update(
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

    const author = await AuthorsService.getByUserId({ id: req.locals.user.id });
    const post = await PostsService.getOne({ id });

    if (author === null || post.author.id !== author.id) {
      return next(ApiError.NotFound());
    }
    const [mainNameImg] = FileService.savePostImage(mainImg) || [];
    const otherNameImgs = FileService.savePostImage(otherImgs) || [];

    const result = await PostsDraftService.update({
      ...value,
      postId: Number(id),
      draftId: Number(did),
      authorId: author.id,
      mainImg: mainNameImg,
      otherImgs: otherNameImgs,
    });

    return res.send(result);
  }

  static async getAll(
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
        await PostsDraftService.getDraftsPost(
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

  static async getOne(
    req: RequestWithParams<{ id: string; did: string }>,
    res: Response,
    next: NextFunction,
  ) {
    const { id, did } = req.params;
    const author = await PostsDraftsController.authorValidate(req);

    if (author instanceof ApiError) {
      next(author);
    } else {
      const result = await PostsDraftService.getOne({
        postId: Number(id),
        draftId: Number(did),
        authorId: author.id,
      });

      res.send(result);
    }
  }

  static async delete(
    req: RequestWithParams<{ id: string; did: string }>,
    res: Response,
  ) {
    const { id, did } = req.params;
    await PostsDraftsController.authorValidate(req);
    const result = await PostsDraftService.delete({
      postId: Number(id),
      draftId: Number(did),
    });

    res.send(result);
  }

  static async publish(
    req: RequestWithParams<{ id: string; did: string }>,
    res: Response,
    next: NextFunction,
  ) {
    const { id, did } = req.params;
    const author = await PostsDraftsController.authorValidate(req);
    if (author instanceof ApiError) {
      next(author);
    } else {
      const result = await PostsDraftService.publish({
        postId: Number(id),
        draftId: Number(did),
        authorId: author.id,
      });

      res.send(result);
    }
  }

  private static async authorValidate(req: RequestWithParams<{ id: string }>) {
    const { id } = req.params;

    const author = await AuthorsService.getByUserId({ id: req.locals.user.id });
    const post = await PostsService.getOne({ id });

    if (author === null || post.author.id !== author.id) {
      return ApiError.NotFound();
    }

    return author;
  }
}

export default PostsDraftsController;
