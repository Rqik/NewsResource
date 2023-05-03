import { Response, NextFunction } from 'express';

import { ApiError } from '../../exceptions';
import {
  CommentsService,
  PostsCommentsService,
  TokensService,
} from '../../services/index';
import getAuthorizationToken from '../../shared/get-authorization-token';
import paginator from '../../shared/paginator';
import {
  RequestWithParams,
  RequestWithParamsAndBody,
  RequestWithParamsAnQuery,
} from '../types';
import PostsCommentsDto, { IPostsComments } from './posts-comments.dto';

class PostsCommentsController {
  static async create(
    req: RequestWithParamsAndBody<{ id: string }, IPostsComments>,
    res: Response,
    next: NextFunction,
  ) {
    const { id: postId } = req.params;
    const accessToken = getAuthorizationToken(req);

    const { error, value } = new PostsCommentsDto(req.body).validate();
    if (error) {
      return next(error);
    }

    // TODO:
    const tokenData = TokensService.validateAccess(accessToken);

    if (tokenData === null || typeof tokenData === 'string') {
      return next(ApiError.BadRequest('Invalid Authorization token'));
    }
    const { id: userId } = tokenData;
    const comment = await CommentsService.create({
      userId,
      ...value,
    });
    await PostsCommentsService.create({
      postId: Number(postId),
      commentId: comment.id,
    });

    return res.send(comment);
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
