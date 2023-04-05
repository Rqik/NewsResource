import { Response } from 'express';

import { ApiError } from '../../exceptions/index';
import {
  AuthorsService,
  FileService,
  PostsDraftService,
  PostsService,
} from '../../service/index';
import paginator from '../../shared/paginator';
import {
  RequestWithParams,
  RequestWithParamsAndBody,
  RequestWithParamsAnQuery,
} from '../types';

class PostsDraftsController {
  static async create(
    req: RequestWithParamsAndBody<
      { id: string },
      {
        body: string;
        title: string;
        categoryId: number;
      }
    >,
    res: Response,
  ) {
    const { id } = req.params;
    const main = req.files;
    const { mainImg, otherImgs } = main || {};

    const author = await PostsDraftsController.authorValidate(req);
    const [mainNameImg] = FileService.savePostImage(mainImg) || [];
    const otherNameImgs = FileService.savePostImage(otherImgs) || [];

    const draft = await PostsDraftService.create({
      ...req.body,
      postId: Number(id),
      authorId: author.id,
      mainImg: mainNameImg,
      otherImgs: otherNameImgs,
    });

    res.send(draft);
  }

  static async update(
    req: RequestWithParamsAndBody<
      { id: string; did: string },
      { body: string; title: string; categoryId: number }
    >,
    res: Response,
  ) {
    const { id, did } = req.params;
    const main = req.files;
    const { mainImg, otherImgs } = main || {};

    const author = await AuthorsService.getByUserId({ id: req.user.id });
    const post = await PostsService.getOne({ id });

    if (author === null || post.author.id !== author.id) {
      throw ApiError.NotFound();
    }

    const [mainNameImg] = FileService.savePostImage(mainImg) || [];
    const otherNameImgs = FileService.savePostImage(otherImgs) || [];

    const result = await PostsDraftService.update({
      ...req.body,
      postId: Number(id),
      draftId: Number(did),
      authorId: author.id,
      mainImg: mainNameImg,
      otherImgs: otherNameImgs,
    });

    res.send(result);
  }

  static async getAll(
    req: RequestWithParamsAnQuery<
      { id: string },
      { per_page: string; page: string }
    >,
    res: Response,
  ) {
    const { per_page: perPage = 10, page = 0 } = req.query;
    const { id } = req.params;
    const author = await PostsDraftsController.authorValidate(req);
    const { totalCount, count, drafts } = await PostsDraftService.getDraftsPost(
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

  static async getOne(
    req: RequestWithParams<{ id: string; did: string }>,
    res: Response,
  ) {
    const { id, did } = req.params;
    const author = await PostsDraftsController.authorValidate(req);
    const result = await PostsDraftService.getOne({
      postId: Number(id),
      draftId: Number(did),
      authorId: author.id,
    });

    res.send(result);
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
  ) {
    const { id, did } = req.params;
    const author = await PostsDraftsController.authorValidate(req);
    const result = await PostsDraftService.publish({
      postId: Number(id),
      draftId: Number(did),
      authorId: author.id,
    });

    res.send(result);
  }

  private static async authorValidate(req: RequestWithParams<{ id: string }>) {
    const { id } = req.params;

    const author = await AuthorsService.getByUserId({ id: req.user.id });
    const post = await PostsService.getOne({ id });

    if (author === null || post.author.id !== author.id) {
      throw ApiError.NotFound();
    }

    return author;
  }
}

export default PostsDraftsController;
