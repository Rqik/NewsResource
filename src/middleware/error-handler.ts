import { NextFunction, Request, Response } from 'express';

type Controller<T = Request> = (
  req: T,
  res: Response,
  next: NextFunction,
) => Promise<unknown>;

const errorHandler =
  (controller: Controller<any>): Controller =>
  async (req, res, next) => {
    try {
      await controller(req, res, next);
    } catch (error) {
      // Обработка ошибки здесь
      next(error);
    }
  };

export default errorHandler;
