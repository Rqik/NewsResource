import { NextFunction, Request, Response } from 'express';

import { ApiError } from '@/exceptions';
import { HttpStatuses } from '@/shared';

const errorMiddleware = (
  err: Error,
  _: Request,
  res: Response,
  __: NextFunction,
) => {
  if (err instanceof ApiError && err.status === HttpStatuses.NOT_FOUND) {
    return res.status(err.status).send(err.message);
  }

  if (err instanceof ApiError) {
    return res
      .status(err.status)
      .json({ message: err.message, error: err.errors });
  }

  return res
    .status(HttpStatuses.INTERNAL_SERVER)
    .json({ message: 'Unexpected error' });
};

export default errorMiddleware;
