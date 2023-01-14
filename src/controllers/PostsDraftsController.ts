import { NextFunction, Response } from 'express';

import { PostsDraftService } from '../service/index';
import paginator from '../shared/paginator';
import {
  RequestWithParams,
  RequestWithParamsAndBody,
  RequestWithParamsAnQuery,
} from './types';

class PostsDraftsController {
  static async create(
    req: RequestWithParamsAndBody<
      { id: string },
      { body: string; userId: number }
    >,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { id } = req.params;
      const { body, userId } = req.body;

      const draft = await PostsDraftService.create({
        postId: Number(id),
        body,
        userId,
      });

      res.send(draft);
    } catch (e) {
      next(e);
    }
  }

  static async update(
    req: RequestWithParamsAndBody<
      { id: string; did: string },
      { body: string; userId: number }
    >,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { id, did } = req.params;
      const { body, userId } = req.body;

      const result = await PostsDraftService.update({
        postId: Number(id),
        draftId: Number(did),
        body,
        userId,
      });

      res.send(result);
    } catch (e) {
      next(e);
    }
  }

  static async getAll(
    req: RequestWithParamsAnQuery<
      { id: string },
      { per_page: string; page: string }
    >,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { per_page: perPage = 10, page = 0 } = req.query;
      const { id } = req.params;

      const { totalCount, count, drafts } =
        await PostsDraftService.getDraftsPost(
          {
            postId: Number(id),
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
    } catch (e) {
      next(e);
    }
  }

  static async getOne(
    req: RequestWithParams<{ id: string; did: string }>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { id, did } = req.params;
      const result = await PostsDraftService.getOne({
        postId: Number(id),
        draftId: Number(did),
      });

      res.send(result);
    } catch (e) {
      next(e);
    }
  }

  static async delete(
    req: RequestWithParams<{ id: string; did: string }>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { id, did } = req.params;
      const result = await PostsDraftService.delete({
        postId: Number(id),
        draftId: Number(did),
      });

      res.send(result);
    } catch (e) {
      next(e);
    }
  }

  static async publish() {}
}

export default PostsDraftsController;
