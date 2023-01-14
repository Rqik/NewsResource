import { NextFunction, Response } from 'express';

import { CommentsService, PostsCommentsService } from '../service/index';
import paginator from '../shared/paginator';
import {
  RequestWithParams,
  RequestWithParamsAndBody,
  RequestWithParamsAnQuery,
} from './types';

class PostsCommentsController {
  static async create(
    req: RequestWithParamsAndBody<
      { id: string },
      { userId: number; body: string }
    >,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { id: postId } = req.params;
      const { userId, body } = req.body;
      const comment = await CommentsService.create({
        userId,
        body,
      });
      await PostsCommentsService.create({
        postId: Number(postId),
        commentId: comment.id,
      });

      res.send(comment);
    } catch (e) {
      next(e);
    }
  }

  static async getCommentsPost(
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
      const { totalCount, count, comments } =
        await PostsCommentsService.getPostComments(
          { id },
          {
            page: Number(page),
            perPage: Number(perPage),
          },
        );
      const pagination = paginator({
        totalCount,
        count,
        req,
        route: `/posts/${id}/comments`,
        page: Number(page),
        perPage: Number(perPage),
      });

      res.send({ ...pagination, comments });
    } catch (e) {
      next(e);
    }
  }

  static async delete(
    req: RequestWithParams<{ id: string; cid: string }>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { id: nId, cid: cId } = req.params;
      const comment = await PostsCommentsService.delete({
        nId: Number(nId),
        cId: Number(cId),
      });
      res.send(comment);
    } catch (e) {
      next(e);
    }
  }
}

export default PostsCommentsController;
