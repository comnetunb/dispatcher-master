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

  if (authHeader == null) {
    return res.status(HttpStatusCode.UNAUTHORIZED).send({ error: 'Not authorized to access this resource' });
  }

  try {
    const token = authHeader.replace('Bearer ', '');
    const data = jwt.verify(token, TestJWTKEY) as JWTData;
    const user = await User.findOne({ _id: data._id, 'tokens.token': token });
    if (!user) {
      throw new Error();
    }
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(HttpStatusCode.UNAUTHORIZED).send({ error: 'Not authorized to access this resource' });
  }
}
