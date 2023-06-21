import { boundClass } from 'autobind-decorator';
import { NextFunction, Response } from 'express';

import { ApiError } from '@/exceptions';
import {
  CommentsService,
  PostsCommentsService,
  TokensService,
} from '@/services';
import getAuthorizationToken from '@/shared/get-authorization-token';
import paginator from '@/shared/paginator';

import {
  RequestWithParams,
  RequestWithParamsAndBody,
  RequestWithParamsAnQuery,
} from '../types';
import PostsCommentsDto, { IPostsComments } from './posts-comments.dto';

@boundClass
class PostsCommentsController {
  constructor(
    private postsCommentsService: typeof PostsCommentsService,
    private commentsService: typeof CommentsService,
    private tokensService: typeof TokensService,
  ) {}

  async create(
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
    const tokenData = this.tokensService.validateAccess(accessToken);

    if (tokenData === null || typeof tokenData === 'string') {
      return next(ApiError.BadRequest('Invalid Authorization token'));
    }
    const { id: userId } = tokenData;
    const comment = await this.commentsService.create({
      userId,
      ...value,
    });
    await this.postsCommentsService.create({
      postId: Number(postId),
      commentId: comment.id,
    });

    return res.send(comment);
  }

  async getCommentsPost(
    req: RequestWithParamsAnQuery<
      { id: string },
      { per_page: string; page: string }
    >,
    res: Response,
  ) {
    const { per_page: perPage = 10, page = 0 } = req.query;

    const { id } = req.params;
    const { totalCount, count, comments } =
      await this.postsCommentsService.getPostComments(
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

  async delete(
    req: RequestWithParams<{ id: string; cid: string }>,
    res: Response,
  ) {
    const { id: postId, cid: commentId } = req.params;
    const comment = await this.postsCommentsService.delete({
      postId: Number(postId),
      commentId: Number(commentId),
    });
    res.send(comment);
  }
}

export default new PostsCommentsController(
  PostsCommentsService,
  CommentsService,
  TokensService,
);
