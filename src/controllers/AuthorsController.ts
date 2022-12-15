import { Request, Response } from 'express';

import { AuthorsService } from '../service';
import {
  RequestWithBody,
  RequestWithParams,
  RequestWithParamsAndBody,
} from './types';

class AuthorsController {
  static async create(
    req: RequestWithBody<{ description: string; userId: number }>,
    res: Response,
  ) {
    try {
      const { description, userId } = req.body;

      const result = await AuthorsService.create({
        description,
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
      { description: string; userId: number }
    >,
    res: Response,
  ) {
    try {
      const { id } = req.params;
      const result = await AuthorsService.update({ ...req.body, id });

      res.send(result);
    } catch (e) {
      res.send(e);
    }
  }

  static async getAll(req: Request, res: Response) {
    try {
      const result = await AuthorsService.getAll();

      res.send(result);
    } catch (e) {
      res.send(e);
    }
  }

  static async getOne(req: RequestWithParams<{ id: string }>, res: Response) {
    try {
      const { id } = req.params;

      const result = await AuthorsService.getOne({ id });

      res.send(result);
    } catch (e) {
      res.send(e);
    }
  }

  static async delete(req: RequestWithParams<{ id: string }>, res: Response) {
    try {
      const { id } = req.params;

      const result = await AuthorsService.delete({ id });

      res.send(result);
    } catch (e) {
      res.send(e);
    }
  }
}

export default AuthorsController;
