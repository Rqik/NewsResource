import { Request, Response } from 'express';

class AuthController {
  static async registration(_: Request, res: Response) {
    try {
      res.send('registration');
    } catch (e) {
      res.send('error');
    }
  }

  static async login(_: Request, res: Response) {
    try {
      res.send({ s: 'login' });
    } catch (e) {
      res.send('error');
    }
  }

  static async logout(_: Request, res: Response) {
    try {
      res.send({ s: 'logout' });
    } catch (e) {
      res.send('error');
    }
  }

  static async activate(_: Request, res: Response) {
    try {
      res.send({ s: 'logout' });
    } catch (e) {
      res.send('error');
    }
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
