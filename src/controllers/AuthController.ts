import { NextFunction, Request, Response } from 'express';
import { ApiError } from '../exceptions/index';

import UsersService from '../service/UsersService';
import { RequestWithBody, RequestWithParams } from './types';

class AuthController {
  private static maxAge = 30 * 24 * 60 * 60;

  static async login(
    req: RequestWithBody<{ login: string; password: string }>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { login, password } = req.body;
      const userData = await UsersService.login({ login, password });
      if (userData instanceof ApiError) {
        next(userData);
      } else {
        res.cookie('refreshToken', userData.refreshToken, {
          maxAge: AuthController.maxAge,
          httpOnly: true,
        });
        res.json(userData);
      }
    } catch (e) {
      next(e);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.cookies;

      const token = await UsersService.logout(refreshToken);
      res.clearCookie('refreshToken');

      res.json(token);
    } catch (e) {
      next(e);
    }
  }

  static async activate(
    req: RequestWithParams<{ link: string }>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { link } = req.params;

      await UsersService.activate(link);

      res.redirect(process.env.CLIENT_URL || 'https://ya.ru/');
    } catch (e) {
      next(e);
    }
  }

  static async refresh(req: Request, res: Response, next: NextFunction) {
    try {
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
    } catch (e) {
      next(e);
    }
  }
}

export default AuthController;
