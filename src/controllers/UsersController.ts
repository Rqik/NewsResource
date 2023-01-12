import { NextFunction, Request, Response } from 'express';

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
    next: NextFunction,
  ) {
    try {
      const { firstName, lastName, avatar, login, password, email } = req.body;

      const userDate = await UsersService.registration({
        password,
        login,
        avatar,
        lastName,
        firstName,
        email,
      });

      res.cookie('refreshToken', userDate.refreshToken, {
        maxAge: 30 * 24 * 60 * 60,
        httpOnly: true,
      });
      res.send({ result: userDate });
    } catch (e) {
      next(e);
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
    next: NextFunction,
  ) {
    try {
      const { id } = req.params;

      const result = await UsersService.update({ ...req.body, id });

      res.send(result);
    } catch (e) {
      next(e);
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
    next: NextFunction,
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
      next(e);
    }
  }

  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await UsersService.getAll();

      res.send(result);
    } catch (e) {
      next(e);
    }
  }

  static async getOne(
    req: RequestWithParams<{ login: string }>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { login } = req.params;
      const result = await UsersService.getOne({ login });

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

      const result = await UsersService.delete({ id });

      res.send(result);
    } catch (e) {
      next(e);
    }
  }
}

export default UsersController;
