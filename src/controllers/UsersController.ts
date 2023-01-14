import { NextFunction, Response } from 'express';
import { ApiError } from '../exceptions/index';

import { UsersService } from '../service';
import paginator from '../shared/paginator';
import {
  RequestWithBody,
  RequestWithParams,
  RequestWithParamsAndBody,
  RequestWithQuery,
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

  static async getAll(
    req: RequestWithQuery<{ per_page: string; page: string }>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { per_page: perPage = 20, page = 0 } = req.query;

      const { totalCount, users, count } = await UsersService.getAll({
        page: Number(page),
        perPage: Number(perPage),
      });
      const pagination = paginator({
        totalCount,
        count,
        req,
        route: '/users',
        page: Number(page),
        perPage: Number(perPage),
      });
      res.send({ ...pagination, data: users });
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
      if (result === null) {
        throw ApiError.BadRequest(`User ${login} not found`);
      }
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
