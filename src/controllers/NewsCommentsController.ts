import { Response } from 'express';

import CommentsService from '../service/CommentsService';
import NewsCommentsService from '../service/NewsCommentsService';
import { RequestWithParams, RequestWithParamsAndBody } from './types';

class NewsCommentsController {
  static async create(
    req: RequestWithParamsAndBody<
      { id: string },
      { title: string; userId: number; body: string }
    >,
    res: Response,
  ) {
    try {
      const { id: newsId } = req.params;
      const { title, userId, body } = req.body;
      const { comment_id: commentId } = await CommentsService.create({
        title,
        userId,
        body,
      });
      const pivot = await NewsCommentsService.create({
        newsId,
        commentId,
      });

      res.send(pivot);
    } catch (e) {
      res.send(e);
    }
  }

  static async getCommentsPost(
    req: RequestWithParams<{ id: string }>,
    res: Response,
  ) {
    try {
      const { id } = req.params;
      const comments = await NewsCommentsService.getCommentsPost({ id });

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
      const comment = await NewsCommentsService.delete({
        nId: Number(nId),
        cId: Number(cId),
      });
      res.send(comment);
    } catch (e) {
      res.send(e);
    }
  }
}

export default NewsCommentsController;
