import { NextFunction, Response } from 'express';

import { ApiError } from '../exceptions';
import {
  CommentsService,
  PostsCommentsService,
  TokensService,
} from '../service';
import getAuthorizationToken from '../shared/get-authorization-token';
import paginator from '../shared/paginator';
import {
  RequestWithParams,
  RequestWithParamsAndBody,
  RequestWithParamsAnQuery,
} from './types';

class PostsCommentsController {
  static async create(
    req: RequestWithParamsAndBody<{ id: string }, { body: string }>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { id: postId } = req.params;
      const { body } = req.body;
      const accessToken = getAuthorizationToken(req);
      // TODO:
      const tokenData = TokensService.validateAccess(accessToken);

      if (tokenData === null || typeof tokenData === 'string') {
        throw ApiError.BadRequest('Invalid Authorization token');
      }

      const { id: userId } = tokenData;
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
      const { id: postId, cid: commentId } = req.params;
      const comment = await PostsCommentsService.delete({
        postId: Number(postId),
        commentId: Number(commentId),
      });
      res.send(comment);
    } catch (e) {
      next(e);
    }
  }
}

export default PostsCommentsController;
