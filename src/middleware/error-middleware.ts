import { Request, Response, NextFunction } from 'express';

import { ApiError } from '../exceptions/index';
import HttpStatuses from '../shared/HttpStatuses';

const errorMiddleware = (
  err: Error,
  _: Request,
  res: Response,
  __: NextFunction,
) => {
  if (err instanceof ApiError && err.status === HttpStatuses.NOT_FOUND) {
    res.status(err.status).send(err.message);
  }

  if (err instanceof ApiError) {
    res.status(err.status).json({ message: err.message, error: err.errors });
  }

  res
    .status(HttpStatuses.INTERNAL_SERVER)
    .json({ message: 'Unexpected error' });
};

export default errorMiddleware;
