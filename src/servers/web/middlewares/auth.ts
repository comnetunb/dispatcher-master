import * as jwt from 'jsonwebtoken';
import User from '../../../database/models/user';
import { Request, Response, NextFunction } from 'express';
import HttpStatusCode from '../utils/httpStatusCodes';

export interface JWTData {
  _id: string;
}

export const TestJWTKEY = "abcde";

export async function auth(req: any, res: Response, next: NextFunction) {
  if (req.path == '/users/sign_in' || req.path == '/users/sign_up') return next();
  const authHeader = req.header('Authorization');
  const adminModeHeader = req.header('AdminMode');

  if (authHeader == null) {
    return res.status(HttpStatusCode.UNAUTHORIZED).send({ error: 'Not authorized to access this resource' });
  }

  try {
    const token = authHeader.replace('Bearer ', '');
    const data = jwt.verify(token, TestJWTKEY) as JWTData;
    const user = await User.findOne({ _id: data._id, 'tokens.token': token });
    if (!user) {
      return res.status(HttpStatusCode.UNAUTHORIZED).send({ error: 'User not found' });
    }
    if (adminModeHeader && !user.admin) {
      return res.status(HttpStatusCode.FORBIDDEN).send({ error: 'Can not use admin mode if it is not admin' });
    } else if (adminModeHeader) {
      req.adminMode = true;
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(HttpStatusCode.UNAUTHORIZED).send({ error: 'Not authorized to access this resource' });
  }
}
