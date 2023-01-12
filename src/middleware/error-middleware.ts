import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../exceptions';
import HttpStatuses from '../shared/HttpStatuses';

const errorMiddleware = ({
  err,
  req,
  res,
  next,
}: {
  err: Error;
  req: Request;
  res: Response;
  next: NextFunction;
}) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  console.log('arguments');
  console.log(err, req, res, next);

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
