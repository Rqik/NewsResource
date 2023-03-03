// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as express from 'express';

declare global {
  declare namespace Express {
    interface Request {
      user?: string | JwtPayload | UserDto;
    }
  }
}
