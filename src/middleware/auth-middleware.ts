import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import ApiError from '../exceptions/ApiError';
import UserDto from '../dtos/UserDto';

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (req.method === 'OPTIONS') {
    next();
  }

  try {
    if (typeof req.headers.authorization === 'undefined') {
      throw ApiError.UnauthorizeError();
    }

    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
      throw ApiError.UnauthorizeError();
    }

    const decodeData = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET as string,
    ) as UserDto;

    req.user = decodeData;
    next();
  } catch (e) {
    next(e);
  }
};

export default authMiddleware;
