import { Request } from 'express';

type RequestWithBody<T> = Request<unknown, unknown, T>;
type RequestWithParams<T> = Request<T>;
type RequestWithParamsAndBody<T, B> = Request<T, unknown, B>;
type RequestWithQuery<T> = Request<unknown, unknown, unknown, T>;

// eslint-disable-next-line @typescript-eslint/ban-types
type PropsWithId<T = {}> = { id: string } & T;

type SnakeToCamelCase<S extends string> = S extends `${infer T}_${infer U}`
  ? `${T}${Capitalize<SnakeToCamelCase<U>>}`
  : S;

type SnakeToCamelCaseNested<T extends object> = {
  [K in keyof T as SnakeToCamelCase<K & string>]: T[K];
};
export type {
  SnakeToCamelCaseNested,
  PropsWithId,
  RequestWithBody,
  RequestWithParams,
  RequestWithParamsAndBody,
  RequestWithQuery,
};
