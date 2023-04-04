import { Request, Response, NextFunction } from 'express';

import ApiError from '../exceptions/ApiError';
import TokensService from '../service/TokensService';
import getAuthorizationToken from '../shared/get-authorization-token';

const authMiddleware = (req: Request, _: Response, next: NextFunction) => {
  if (req.method === 'OPTIONS') {
    next();
  }

  try {
    const token = getAuthorizationToken(req);

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
