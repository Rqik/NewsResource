import * as express from 'express';

declare global {
  declare namespace Express {
    interface Request {
      user?: string | JwtPayload | UserDto;
    }
  }
}
