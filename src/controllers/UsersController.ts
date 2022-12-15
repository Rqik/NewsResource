import { Request, Response } from 'express';

import { UsersService } from '../service';
import {
  RequestWithBody,
  RequestWithParams,
  RequestWithParamsAndBody,
} from './types';

class UsersController {
  static async create(
    req: RequestWithBody<{
      firstName: string;
      lastName: string;
      avatar: string;
      login: string;
      password: string;
    }>,
    res: Response,
  ) {
    try {
      const { firstName, lastName, avatar, login, password } = req.body;

      const result = await UsersService.create({
        firstName,
        lastName,
        avatar,
        login,
        password,
      });

      res.send(result);
    } catch (e) {
      res.send(e);
    }
  }

  static async update(
    req: RequestWithParamsAndBody<
      { id: string },
      {
        firstName: string;
        lastName: string;
        avatar: string;
        login: string;
        password: string;
      }
    >,
    res: Response,
  ) {
    try {
      const { id } = req.params;

      const result = await UsersService.update({ ...req.body, id });

      res.send(result);
    } catch (e) {
      res.send(e);
    }
  }

  static async partialUpdate(
    req: RequestWithParamsAndBody<
      { id: string },
      {
        firstName?: string;
        lastName?: string;
        avatar?: string;
        login?: string;
        password?: string;
      }
    >,
    res: Response,
  ) {
    const bodyValues = Object.values(req.body);

    try {
      const { id } = req.params;

      const result = await UsersService.partialUpdate({
        ...bodyValues,
        id,
      });

      res.send(result);
    } catch (e) {
      res.send(e);
    }
  }

  static async getAll(req: Request, res: Response) {
    try {
      const result = await UsersService.getAll();

      res.send(result);
    } catch (e) {
      res.send(e);
    }
  }

  static async getOne(req: RequestWithParams<{ id: string }>, res: Response) {
    try {
      const { id } = req.params;

      const result = await UsersService.getOne({ id });

      res.send(result);
    } catch (e) {
      res.send(e);
    }
  }

  static async delete(req: RequestWithParams<{ id: string }>, res: Response) {
    try {
      const { id } = req.params;

      const result = await UsersService.delete({ id });

      res.send(result);
    } catch (e) {
      res.send(e);
    }
  }
}

export default UsersController;
