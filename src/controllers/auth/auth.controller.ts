import { boundClass } from 'autobind-decorator';
import { NextFunction, Request, Response } from 'express';
import ms from 'ms';

import config from '@/config';
import { ApiError } from '@/exceptions';
import { UsersService } from '@/services';

import { RequestWithBody, RequestWithParams } from '../types';
import AuthDto, { IAuth } from './auth.dto';

@boundClass
class AuthController {
  constructor(private usersService: typeof UsersService) {}

  async login(req: RequestWithBody<IAuth>, res: Response, next: NextFunction) {
    const { error, value } = new AuthDto(req.body).validate();

    if (error) {
      return next(ApiError.ValidationFailed([error]));
    }

    const userData = await this.usersService.login(value);
    if (userData instanceof ApiError) {
      return next(userData);
    }

    res.cookie('refreshToken', userData.refreshToken, {
      maxAge: ms(config.jwtRefreshExpireIn as string),
      httpOnly: true,
    });

    return res.json(userData);
  }

  async logout(req: Request, res: Response) {
    const { refreshToken } = req.cookies;

    const token = await this.usersService.logout(refreshToken);
    res.clearCookie('refreshToken');

    res.json(token);
  }

  async activate(req: RequestWithParams<{ link: string }>, res: Response) {
    const { link } = req.params;

    await this.usersService.activate(link);

    res.redirect(config.clientUrl || 'https://ya.ru/');
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    const { refreshToken } = req.cookies;

    const userData = await this.usersService.refresh(refreshToken);
    if (userData instanceof ApiError) {
      next(userData);
    } else {
      res.cookie('refreshToken', userData.refreshToken, {
        maxAge: ms(config.jwtRefreshExpireIn as string),
        httpOnly: true,
      });
      res.json(userData);
    }
  }
}

export default new AuthController(UsersService);
