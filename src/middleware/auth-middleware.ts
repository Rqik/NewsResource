import { Request, Response, NextFunction } from 'express';

import ApiError from '../exceptions/ApiError';
import TokensService from '../service/TokensService';

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

    const decodeData = TokensService.validateAccess(token);
    if (decodeData === null) {
      next(ApiError.UnauthorizeError());
    }

    req.user = decodeData;
    next();
  } catch (e) {
    next(ApiError.UnauthorizeError());
  }
};

export default authMiddleware;
