import { boundClass } from 'autobind-decorator';
import { NextFunction, Response } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import ms from 'ms';

import config from '@/config';
import { ApiError } from '@/exceptions';
import { FileService, TokensService, UsersService } from '@/services';
import getAuthorizationToken from '@/shared/get-authorization-token';
import paginator from '@/shared/paginator';

import {
  RequestWithBody,
  RequestWithParams,
  RequestWithParamsAndBody,
  RequestWithQuery,
} from '../types';
import UserDto, { IUser } from './users.dto';

@boundClass
class UsersController {
  constructor(
    private fileService: typeof FileService,
    private tokensService: typeof TokensService,
    private usersService: typeof UsersService,
  ) {}

  async create(req: RequestWithBody<IUser>, res: Response, next: NextFunction) {
    const { error, value } = new UserDto(req.body).validate();
    if (error) {
      return next(error);
    }
    const { firstName, lastName, login, password, email } = value;
    const ava = req.files;

    const file = ava?.avatar;
    const avatar = this.fileService.saveAvatar(file);

    const userData = await this.usersService.registration({
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
      maxAge: ms(config.jwtRefreshExpireIn as string),
      httpOnly: true,
    });

    return res.send({ result: userData });
  }

  async update(
    req: RequestWithParamsAndBody<{ id: string }, IUser>,
    res: Response,
    next: NextFunction,
  ) {
    const { id } = req.params;
    const { error, value } = new UserDto(req.body).validate();
    if (error) {
      return next(error);
    }
    const result = await this.usersService.update({ ...value, id });

    return res.send(result);
  }

  async partialUpdate(
    req: RequestWithParamsAndBody<{ login: string }, Partial<IUser>>,
    res: Response,
  ) {
    const bodyValues = Object.values(req.body);

    const { login } = req.params;

    const result = await this.usersService.partialUpdate({
      ...bodyValues,
      login,
    });

    res.send(result);
  }

  async getAll(
    req: RequestWithQuery<{ per_page: string; page: string }>,
    res: Response,
  ) {
    const { per_page: perPage = 20, page = 0 } = req.query;

    const { totalCount, users, count } = await this.usersService.getAll({
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

  async getOne(
    req: RequestWithParams<{ login: string }>,
    res: Response,
    next: NextFunction,
  ) {
    const { login } = req.params;
    const result = await this.usersService.getOne({ login });
    if (result === null) {
      next(ApiError.BadRequest(`User ${login} not found`));
    } else {
      res.send(result);
    }
  }

  async getCurrentAuth(
    req: RequestWithParams<{ login: string }>,
    res: Response,
    next: NextFunction,
  ) {
    const accessToken = getAuthorizationToken(req);
    const tokenData = this.tokensService.validateAccess(accessToken);

    if (tokenData === null || typeof tokenData === 'string') {
      next(ApiError.BadRequest('Invalid Authorization token'));
    }

    const { id } = tokenData as JwtPayload;
    const result = await this.usersService.getById({ id });

    if (result === null) {
      next(ApiError.BadRequest(`User ${id} not found`));
    } else {
      res.send(result);
    }
  }

  async delete(req: RequestWithParams<{ id: string }>, res: Response) {
    const { id } = req.params;

    const result = await this.usersService.delete({ id });

    res.send(result);
  }
}
export default new UsersController(FileService, TokensService, UsersService);
