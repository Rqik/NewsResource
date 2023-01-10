import { Request, Response } from 'express';

class AuthController {
  static async registration(_: Request, res: Response) {
    try {
      res.send('registration');
    } catch (error) {
      res.send('error');
    }
  }

  static async login(_: Request, res: Response) {
    try {
      res.send({ s: 'login' });
    } catch (error) {
      res.send('error');
    }
  }
}

export default AuthController;
