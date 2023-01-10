import { Response } from 'express';

import { CommentsService, PostsCommentsService } from '../service/index';
import HttpStatuses from '../shared/HttpStatuses';
import { RequestWithParams, RequestWithParamsAndBody } from './types';

class PostsCommentsController {
  static async create(
    req: RequestWithParamsAndBody<
      { id: string },
      { userId: number; body: string }
    >,
    res: Response,
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
      res.status(HttpStatuses.BAD_REQUEST);
      res.send(e);
    }
  }

  static async getCommentsPost(
    req: RequestWithParams<{ id: string }>,
    res: Response,
  ) {
    try {
      const { id } = req.params;
      const comments = await PostsCommentsService.getPostComments({ id });

      res.send(comments);
    } catch (e) {
      res.send(e);
    }
  }

  static async delete(
    req: RequestWithParams<{ id: string; cid: string }>,
    res: Response,
  ) {
    try {
      const { id: nId, cid: cId } = req.params;
      const comment = await PostsCommentsService.delete({
        nId: Number(nId),
        cId: Number(cId),
      });
      res.send(comment);
    } catch (e) {
      res.send(e);
    }
  }
}

export default PostsCommentsController;
