import { Request } from 'express';

type RequestWithBody<T> = Request<unknown, unknown, T>;
type RequestWithParams<T> = Request<T>;
type RequestWithParamsAndBody<T, B> = Request<T, unknown, B>;
type RequestWithQuery<T> = Request<unknown, unknown, unknown, T>;

export type {
  RequestWithBody,
  RequestWithParams,
  RequestWithParamsAndBody,
  RequestWithQuery,
};
