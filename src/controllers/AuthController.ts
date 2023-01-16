import { NextFunction, Request, Response } from 'express';

import UsersService from '../service/UsersService';
import { RequestWithBody, RequestWithParams } from './types';

class AuthController {
  static async login(
    req: RequestWithBody<{ login: string; password: string }>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { login, password } = req.body;
      const userDate = await UsersService.login({ login, password });

      res.cookie('refreshToken', userDate.refreshToken, {
        maxAge: 30 * 24 * 60 * 60,
        httpOnly: true,
      });
      res.json(userDate);
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
      return res.redirect('https://ya.ru/' || '');
    } catch (e) {
      next(e);
    }
    return '';
  }

  static async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      console.log('refreshToken');
      const { refreshtoken, Authorization } = req.cookies;
      console.log(Object.keys(req.cookies), 'Authorization', Authorization);

      const userDate = await UsersService.refresh(refreshtoken);
      console.log(userDate);

      // res.cookie('refreshToken', userDate.refreshToken, {
      //   maxAge: 30 * 24 * 60 * 60,
      //   httpOnly: true,
      // });
      // res.json(userDate);
    } catch (e) {
      next(e);
    }
  }
}

export default AuthController;
