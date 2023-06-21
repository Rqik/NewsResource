import { NextFunction, Request, Response } from 'express';

import { ApiError } from '@/exceptions';
import { TokensService } from '@/services';
import { getAuthorizationToken } from '@/shared';

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
