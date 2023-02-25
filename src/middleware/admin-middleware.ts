import { Request, Response, NextFunction } from 'express';

import { ApiError } from '../exceptions';
import { TokensService } from '../service';

const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (typeof req.headers.authorization === 'undefined') {
      next(ApiError.UnauthorizeError());
    }

    const token = req.headers.authorization?.split(' ')[1] || '';
    if (!token) {
      next(ApiError.UnauthorizeError());
    }

    const decodeData = TokensService.validateAccess(token);

    if (decodeData === null) {
      next(ApiError.UnauthorizeError());
    }

    if (typeof decodeData !== 'string' && !decodeData?.isAdmin) {
      next(ApiError.UnauthorizeError());
    }
    next();
  } catch (e) {
    next(ApiError.UnauthorizeError());
  }
};

export default adminMiddleware;
