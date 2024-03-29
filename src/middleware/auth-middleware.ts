import { Request, Response, NextFunction } from 'express';

import ApiError from '../exceptions/ApiError';
import TokensService from '../service/TokensService';
import getAuthorizationToken from '../shared/get-authorization-token';

const authMiddleware = (req: Request, _: Response, next: NextFunction) => {
  if (req.method === 'OPTIONS') {
    return next();
  }

  try {
    const token = getAuthorizationToken(req);

    if (!token) {
      return next(ApiError.UnauthorizeError());
    }

    const decodeData = TokensService.validateAccess(token);
    if (decodeData === null) {
      return next(ApiError.UnauthorizeError());
    }

    req.locals.user = decodeData;

    return next();
  } catch (e) {
    return next(ApiError.UnauthorizeError());
  }
};

export default authMiddleware;
