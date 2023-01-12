import { NextFunction, Request, Response } from 'express';
import UsersService from '../service/UsersService';
import { RequestWithParams } from './types';

class AuthController {
  static async registration(_: Request, res: Response, next: NextFunction) {
    try {
      res.send('registration');
    } catch (e) {
      next(e);
    }
  }

  static async login(_: Request, res: Response, next: NextFunction) {
    try {
      res.send({ s: 'login' });
    } catch (e) {
      next(e);
    }
  }

  static async logout(_: Request, res: Response) {
    try {
      res.send({ s: 'logout' });
    } catch (e) {
      res.send('error');
    }
  }

  static async activate(
    req: RequestWithParams<{ link: string }>,
    res: Response,
  ) {
    try {
      const { link } = req.params;

      await UsersService.activate(link);
      return res.redirect('https://ya.ru/' || '');
    } catch (e) {
      res.send('error');
    }
    return '';
  }

  static async refresh(_: Request, res: Response) {
    try {
      res.send({ s: 'logout' });
    } catch (e) {
      res.send('error');
    }
  }
}

export default AuthController;
