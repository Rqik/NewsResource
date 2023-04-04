import { Request, Response, NextFunction } from 'express';

import { ApiError } from '../exceptions';
import { TokensService } from '../service';
import getAuthorizationToken from '../shared/get-authorization-token';

const adminMiddleware = (req: Request, _: Response, next: NextFunction) => {
  try {
    const token = getAuthorizationToken(req);

    if (!token) {
      throw ApiError.NotFound();
    }

    const decodeData = TokensService.validateAccess(token);

    if (!decodeData || typeof decodeData !== 'object') {
      throw ApiError.NotFound();
    }

    if (!decodeData.isAdmin || !decodeData.isActivated) {
      throw ApiError.NotFound();
    }

    next();
  } catch (e) {
    next(ApiError.NotFound());
  }
};

export default adminMiddleware;
