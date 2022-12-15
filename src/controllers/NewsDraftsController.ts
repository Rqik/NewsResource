import { Response } from 'express';

import { NewsDraftService } from '../service';
import { RequestWithParams, RequestWithParamsAndBody } from './types';

class NewsDraftsController {
  static async create(
    req: RequestWithParamsAndBody<
      { id: string },
      { body: string; userId: number }
    >,
    res: Response,
  ) {
    try {
      const { id } = req.params;
      const { body, userId } = req.body;

      const draft = await NewsDraftService.create({
        newsId: Number(id),
        body,
        userId,
      });

      res.send(draft);
    } catch (e) {
      res.send(e);
    }
  }

  static async update(
    req: RequestWithParamsAndBody<
      { id: string; did: string },
      { body: string; userId: number }
    >,
    res: Response,
  ) {
    try {
      const { id, did } = req.params;
      const { body, userId } = req.body;

      const result = await NewsDraftService.update({
        newsId: Number(id),
        draftId: Number(did),
        body,
        userId,
      });

      res.send(result);
    } catch (e) {
      res.send(e);
    }
  }

  static async getAll(req: RequestWithParams<{ id: string }>, res: Response) {
    try {
      const { id } = req.params;

      const result = await NewsDraftService.getDraftsPost({
        newsId: Number(id),
      });

      res.send(result);
    } catch (e) {
      res.send(e);
    }
  }

  static async getOne(
    req: RequestWithParams<{ id: string; did: string }>,
    res: Response,
  ) {
    try {
      const { id, did } = req.params;
      const result = await NewsDraftService.getOne({
        newsId: Number(id),
        draftId: Number(did),
      });

      res.send(result);
    } catch (e) {
      res.send(e);
    }
  }

  static async delete(
    req: RequestWithParams<{ id: string; did: string }>,
    res: Response,
  ) {
    try {
      const { id, did } = req.params;
      const result = await NewsDraftService.delete({
        newsId: Number(id),
        draftId: Number(did),
      });

      res.send(result);
    } catch (e) {
      res.send(e);
    }
  }

  static async publish() {}
}

export default NewsDraftsController;
