import { NextFunction, Response } from 'express';
import { v4 } from 'uuid';
import path from 'path';

import { ApiError } from '../exceptions/index';
import { FileService, TokensService, UsersService } from '../service';
import getAuthorizationToken from '../shared/get-authorization-token';
import paginator from '../shared/paginator';
import {
  RequestWithBody,
  RequestWithParams,
  RequestWithParamsAndBody,
  RequestWithQuery,
} from './types';

class UsersController {
  private static maxAge = 30 * 24 * 60 * 60;

  static async create(
    req: RequestWithBody<{
      firstName: string;
      lastName: string;
      login: string;
      password: string;
      email: string;
    }>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { firstName, lastName, login, password, email } = req.body;
      const ava = req.files;

      const file = ava?.avatar;
      const avatar = FileService.saveAvatar(file);

      const userData = await UsersService.registration({
        password,
        login,
        avatar,
        lastName,
        firstName,
        email,
      });

      if (userData instanceof ApiError) {
        next(userData);
      } else {
        res.cookie('refreshToken', userData.refreshToken, {
          maxAge: UsersController.maxAge,
          httpOnly: true,
        });
        res.send({ result: userData });
      }
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

  static async getCurrentAuth(
    req: RequestWithParams<{ login: string }>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const accessToken = getAuthorizationToken(req);
      const tokenData = TokensService.validateAccess(accessToken);

      if (tokenData === null || typeof tokenData === 'string') {
        throw ApiError.BadRequest('Invalid Authorization token');
      }

      const { id } = tokenData;
      const result = await UsersService.getById({ id });

      if (result === null) {
        throw ApiError.BadRequest(`User ${id} not found`);
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
