import { NextFunction, Response } from 'express';

import { ApiError } from '../../exceptions/index';
import { FileService, TokensService, UsersService } from '../../service/index';
import getAuthorizationToken from '../../shared/get-authorization-token';
import paginator from '../../shared/paginator';
import {
  RequestWithBody,
  RequestWithParams,
  RequestWithParamsAndBody,
  RequestWithQuery,
} from '../types';

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
    const { id } = req.params;

    const result = await UsersService.update({ ...req.body, id });

    res.send(result);
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

    const { login } = req.params;

    const result = await UsersService.partialUpdate({
      ...bodyValues,
      login,
    });

    res.send(result);
  }

  static async getAll(
    req: RequestWithQuery<{ per_page: string; page: string }>,
    res: Response,
  ) {
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
  }

  static async getOne(
    req: RequestWithParams<{ login: string }>,
    res: Response,
  ) {
    const { login } = req.params;
    const result = await UsersService.getOne({ login });
    if (result === null) {
      throw ApiError.BadRequest(`User ${login} not found`);
    }
    res.send(result);
  }

  static async getCurrentAuth(
    req: RequestWithParams<{ login: string }>,
    res: Response,
  ) {
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
  }

  static async delete(req: RequestWithParams<{ id: string }>, res: Response) {
    const { id } = req.params;

    const result = await UsersService.delete({ id });

    res.send(result);
  }
}

export default UsersController;
