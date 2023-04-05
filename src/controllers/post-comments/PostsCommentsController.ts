import { Response, NextFunction } from 'express';

import { ApiError } from '../../exceptions/index';
import {
  CommentsService,
  PostsCommentsService,
  TokensService,
} from '../../service/index';
import getAuthorizationToken from '../../shared/get-authorization-token';
import paginator from '../../shared/paginator';
import {
  RequestWithParams,
  RequestWithParamsAndBody,
  RequestWithParamsAnQuery,
} from '../types';

class PostsCommentsController {
  static async create(
    req: RequestWithParamsAndBody<{ id: string }, { body: string }>,
    res: Response,
    next: NextFunction,
  ) {
    const { id: postId } = req.params;
    const { body } = req.body;
    const accessToken = getAuthorizationToken(req);
    // TODO:
    const tokenData = TokensService.validateAccess(accessToken);

    if (tokenData === null || typeof tokenData === 'string') {
      next(ApiError.BadRequest('Invalid Authorization token'));
    } else {
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
    }
  }

  static async getCommentsPost(
    req: RequestWithParamsAnQuery<
      { id: string },
      { per_page: string; page: string }
    >,
    res: Response,
  ) {
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
  }

  static async delete(
    req: RequestWithParams<{ id: string; cid: string }>,
    res: Response,
  ) {
    const { id: postId, cid: commentId } = req.params;
    const comment = await PostsCommentsService.delete({
      postId: Number(postId),
      commentId: Number(commentId),
    });
    res.send(comment);
  }
}

export default PostsCommentsController;
