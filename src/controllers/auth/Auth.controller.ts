import { NextFunction, Request, Response } from 'express';

import { ApiError } from '../../exceptions/index';
import UsersService from '../../service/UsersService';
import { RequestWithBody, RequestWithParams } from '../types';
import AuthDto, { IAuth } from './auth.dto';

class AuthController {
  private static maxAge = 30 * 24 * 60 * 60;

  static async login(
    req: RequestWithBody<IAuth>,
    res: Response,
    next: NextFunction,
  ) {
    const { error, value } = new AuthDto(req.body).validate();

    if (error) {
      return next(ApiError.ValidationFailed([error]));
    }

    const userData = await UsersService.login(value);
    if (userData instanceof ApiError) {
      return next(userData);
    }

    res.cookie('refreshToken', userData.refreshToken, {
      maxAge: AuthController.maxAge,
      httpOnly: true,
    });

    return res.json(userData);
  }

  static async logout(req: Request, res: Response) {
    const { refreshToken } = req.cookies;

    const token = await UsersService.logout(refreshToken);
    res.clearCookie('refreshToken');

    res.json(token);
  }

  static async activate(
    req: RequestWithParams<{ link: string }>,
    res: Response,
  ) {
    const { link } = req.params;

    await UsersService.activate(link);

    res.redirect(process.env.CLIENT_URL || 'https://ya.ru/');
  }

  static async refresh(req: Request, res: Response, next: NextFunction) {
    const { refreshToken } = req.cookies;

    const userData = await UsersService.refresh(refreshToken);
    if (userData instanceof ApiError) {
      next(userData);
    } else {
      res.cookie('refreshToken', userData.refreshToken, {
        maxAge: AuthController.maxAge,
        httpOnly: true,
      });
      res.json(userData);
    }
  }
}

export default AuthController;
