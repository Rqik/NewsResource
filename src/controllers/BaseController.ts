/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import { Request, Response } from 'express';

class BaseController {
  static async create(req: Request, res: Response) {}

  static async update(req: Request, res: Response) {}

  static async get(req: Request, res: Response) {}

  static async delete(req: Request, res: Response) {}
}

export default BaseController;
