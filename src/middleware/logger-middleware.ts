import { NextFunction, Request, Response } from 'express';

const loggerMiddleware = (
  err: Error,
  _: Request,
  __: Response,
  next: NextFunction,
) => {
  console.error(err);
  next(err);
};

export default loggerMiddleware;
