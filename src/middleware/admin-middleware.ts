import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import HttpStatuses from '../shared/HttpStatuses';
import UserDto from '../dtos/UserDto';

const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (typeof req.headers.authorization === 'undefined') {
      res.sendStatus(HttpStatuses.NOT_FOUND);
    }

    const token = req.headers.authorization?.split(' ')[1] || '';
    if (!token) {
      res.sendStatus(HttpStatuses.NOT_FOUND);
    }

    const decodeData = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET as string,
    ) as UserDto;
    // console.log('decodeData.isAdmin', decodeData?.isAdmin);

    if (!decodeData.isAdmin) {
      res.sendStatus(HttpStatuses.NOT_FOUND);
    }
    next();
  } catch (e) {
    res.sendStatus(HttpStatuses.NOT_FOUND);
  }
};

export default adminMiddleware;
