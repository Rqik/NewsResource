import { NextFunction, Request, Response } from 'express';

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
    next: NextFunction,
  ) {
    try {
      const { description, userId } = req.body;

      const result = await AuthorsService.create({
        description,
        userId,
      });

      res.send(result);
    } catch (e) {
      next(e);
    }
  }

  static async update(
    req: RequestWithParamsAndBody<
      { id: string },
      { description: string; userId: number }
    >,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { id } = req.params;
      const result = await AuthorsService.update({ ...req.body, id });

      res.send(result);
    } catch (e) {
      next(e);
    }
  }

  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthorsService.getAll();

      res.send(result);
    } catch (e) {
      next(e);
    }
  }

  static async getOne(
    req: RequestWithParams<{ id: string }>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { id } = req.params;

      const result = await AuthorsService.getOne({ id });

      res.send(result);
    } catch (e) {
      next(e);
    }
  }

  static async delete(
    req: RequestWithParams<{ id: string }>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { id } = req.params;

      const result = await AuthorsService.delete({ id });

      res.send(result);
    } catch (e) {
      next(e);
    }
  }
}

export default AuthorsController;
