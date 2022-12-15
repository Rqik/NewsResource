import { Response } from 'express';

import { CommentsService, NewsCommentsService } from '../service';
import { RequestWithParams, RequestWithParamsAndBody } from './types';

class NewsCommentsController {
  static async create(
    req: RequestWithParamsAndBody<
      { id: string },
      { userId: number; body: string }
    >,
    res: Response,
  ) {
    try {
      const { id: newsId } = req.params;
      const { userId, body } = req.body;
      const comment = await CommentsService.create({
        userId,
        body,
      });
      await NewsCommentsService.create({
        newsId: Number(newsId),
        commentId: comment.id,
      });

      res.send(comment);
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
