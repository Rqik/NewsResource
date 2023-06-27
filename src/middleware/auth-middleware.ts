import { NextFunction, Request, Response } from 'express';

import { ApiError } from '@/exceptions';
import { TokensService } from '@/services';
import { getAuthorizationToken } from '@/shared';

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (req.method === 'OPTIONS') {
    return next();
  }

  try {
    const accessToken = getAuthorizationToken(req);

    if (!accessToken) {
      return next(ApiError.UnauthorizeError());
    }

    const decodeData = TokensService.validateAccess(accessToken);
    if (decodeData === null) {
      return next(ApiError.UnauthorizeError());
    }

    res.locals.user = decodeData;

    return next();
  } catch (e) {
    return next(ApiError.UnauthorizeError());
  }
};

export default authMiddleware;
