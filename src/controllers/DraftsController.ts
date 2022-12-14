import { Request, Response } from 'express';

import { DraftService } from '../service';
import {
  RequestWithBody,
  RequestWithParams,
  RequestWithParamsAndBody,
} from './types';

class DraftsController {
  static async create(
    req: RequestWithBody<{ body: string; userId: number }>,
    res: Response,
  ) {
    try {
      const { body, userId } = req.body;
      const result = await DraftService.create({
        body,
        userId,
      });

      res.send(result);
    } catch (e) {
      res.send(e);
    }
  }

  static async update(
    req: RequestWithParamsAndBody<
      { id: string },
      { body: string; userId: number }
    >,
    res: Response,
  ) {
    try {
      const { id } = req.params;
      const { body, userId } = req.body;
      const result = await DraftService.update({ body, userId, id });

      res.send(result);
    } catch (e) {
      res.send(e);
    }
  }

  static async getAll(req: Request, res: Response) {
    try {
      const result = await DraftService.getAll();
      res.send(result);
    } catch (e) {
      res.send(e);
    }
  }

  static async getOne(req: RequestWithParams<{ id: string }>, res: Response) {
    try {
      const { id } = req.params;
      const result = await DraftService.getOne({ id });

      res.send(result);
    } catch (e) {
      res.send(e);
    }
  }

  static async delete(req: RequestWithParams<{ id: string }>, res: Response) {
    try {
      const { id } = req.params;
      const result = await DraftService.delete({ id });

      res.send(result);
    } catch (e) {
      res.send(e);
    }
  }

  static async publish() {}
}

export default new DraftsController();
