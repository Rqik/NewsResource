import { NextFunction, Response } from 'express';
import { JwtPayload } from 'jsonwebtoken';

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
import UserDto, { IUser } from './users.dto';

class UsersController {
  private static maxAge = 30 * 24 * 60 * 60;

  static async create(
    req: RequestWithBody<IUser>,
    res: Response,
    next: NextFunction,
  ) {
    const { error, value } = new UserDto(req.body).validate();
    if (error) {
      return next(error);
    }
    const { firstName, lastName, login, password, email } = value;
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
      return next(userData);
    }
    res.cookie('refreshToken', userData.refreshToken, {
      maxAge: UsersController.maxAge,
      httpOnly: true,
    });

    return res.send({ result: userData });
  }

  static async update(
    req: RequestWithParamsAndBody<{ id: string }, IUser>,
    res: Response,
    next: NextFunction,
  ) {
    const { id } = req.params;
    const { error, value } = new UserDto(req.body).validate();
    if (error) {
      return next(error);
    }
    const result = await UsersService.update({ ...value, id });

    return res.send(result);
  }

  static async partialUpdate(
    req: RequestWithParamsAndBody<{ login: string }, Partial<IUser>>,
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
    console.log(' console.log(totalCount, users, count) ');

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
    next: NextFunction,
  ) {
    const { login } = req.params;
    const result = await UsersService.getOne({ login });
    if (result === null) {
      next(ApiError.BadRequest(`User ${login} not found`));
    } else {
      res.send(result);
    }
  }

  static async getCurrentAuth(
    req: RequestWithParams<{ login: string }>,
    res: Response,
    next: NextFunction,
  ) {
    const accessToken = getAuthorizationToken(req);
    const tokenData = TokensService.validateAccess(accessToken);

    if (tokenData === null || typeof tokenData === 'string') {
      next(ApiError.BadRequest('Invalid Authorization token'));
    }

    const { id } = tokenData as JwtPayload;
    const result = await UsersService.getById({ id });

    if (result === null) {
      next(ApiError.BadRequest(`User ${id} not found`));
    } else {
      res.send(result);
    }
  }

  static async delete(req: RequestWithParams<{ id: string }>, res: Response) {
    const { id } = req.params;

    const result = await UsersService.delete({ id });

    res.send(result);
  }
}
export default UsersController;
