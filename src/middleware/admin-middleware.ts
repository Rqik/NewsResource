import { Request, Response, NextFunction } from 'express';

import { ApiError } from '../exceptions';
import { TokensService } from '../services/index';
import getAuthorizationToken from '../shared/get-authorization-token';

const adminMiddleware = (req: Request, _: Response, next: NextFunction) => {
  try {
    const token = getAuthorizationToken(req);

    if (!token) {
      return next(ApiError.NotFound());
    }
    console.log('token', token);

    const decodeData = TokensService.validateAccess(token);

    if (!decodeData || typeof decodeData !== 'object') {
      return next(ApiError.NotFound());
    }

    if (!decodeData?.isAdmin || !decodeData.isActivated) {
      return next(ApiError.NotFound());
    }

    return next();
  } catch (e) {
    return next(ApiError.NotFound());
  }
};

export default adminMiddleware;
