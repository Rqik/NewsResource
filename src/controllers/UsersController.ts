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
      email: string;
    }>,
    res: Response,
  ) {
    try {
      const { firstName, lastName, avatar, login, password, email } = req.body;

      const result = await UsersService.create({
        password,
        login,
        avatar,
        lastName,
        firstName,
        email,
      });
      res.send({ result });
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
        email: string;
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
      { login: string },
      {
        firstName?: string;
        lastName?: string;
        avatar?: string;
        password?: string;
      }
    >,
    res: Response,
  ) {
    const bodyValues = Object.values(req.body);

    try {
      const { login } = req.params;

      const result = await UsersService.partialUpdate({
        ...bodyValues,
        login,
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

  static async getOne(
    req: RequestWithParams<{ login: string }>,
    res: Response,
  ) {
    try {
      const { login } = req.params;
      const result = await UsersService.getOne({ login });

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
