import passport from 'passport';
import User, { UserFilter } from '../../../database/models/user';
import { Request, Response } from 'express';
import httpStatusCodes from '../utils/httpStatusCodes';
import { NextFunction } from 'connect';
import { RegisterUserRequest } from '../client/src/app/api/register-user-request';

export function isSignedIn(req: Request, res: Response): void {
  if (req.user) {
    res.send(req.user);
  } else {
    res.sendStatus(httpStatusCodes.UNAUTHORIZED);
  }
}

export function signOut(req: Request, res: Response): void {
  req.logOut();
  res.sendStatus(httpStatusCodes.OK);
}

export async function signIn(req: Request, res: Response, next: NextFunction): Promise<void | Response> {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ email: username.toLowerCase() });
    if (!user) {
      return res.sendStatus(httpStatusCodes.BAD_REQUEST).send({ error: 'User not found.' });
    }

    if (!user.validPassword(password)) {
      return res.sendStatus(httpStatusCodes.UNAUTHORIZED).send({ error: 'Wrong password.' });
    }


    const token = await user.generateAuthToken()
    user.password = undefined;
    res.send({ user, token });
  } catch (error) {
    res.status(httpStatusCodes.INTERNAL_SERVER_ERROR)
      .send({ error });
  }
}

export async function signUp(req: Request, res: Response, next: NextFunction): Promise<void> {
  const userFilter: UserFilter = { email: req.body.email };

  try {
    const existingUser = await User.findOne(userFilter);
    if (existingUser) {
      res.status(httpStatusCodes.BAD_REQUEST)
        .send({ error: 'There already is an account with this e-mail.' });
      return;
    }

    const info: RegisterUserRequest = req.body;
    const { email, name, password } = info;

    const hash = User.encryptPassword(password);

    const newUser = new User({
      email,
      name,
      password: hash
    });

    const user = await newUser.save();
    const token = await user.generateAuthToken();
    res.status(httpStatusCodes.CREATED).send({ user, token });
  } catch (error) {
    res.status(httpStatusCodes.INTERNAL_SERVER_ERROR)
      .send({ error });
  };
}

export async function manageUser(req: Request, res: Response): Promise<void | Response> {
  if (req.user == null) {
    return res.sendStatus(httpStatusCodes.UNAUTHORIZED);
  }

  if (!req.user.admin) {
    return res.sendStatus(httpStatusCodes.FORBIDDEN);
  }

  const userFilter: UserFilter = { _id: req.params.id };
  let allow: boolean;
  if (req.query.allow === 'false') {
    allow = false;
  } else if (req.query.allow === 'true') {
    allow = true;
  } else {
    return res.sendStatus(httpStatusCodes.BAD_REQUEST);
  }

  try {
    const user = await User.findOne(userFilter);
    user.permitted = allow;
    user.pending = false;
    await user.save();
    res.sendStatus(httpStatusCodes.OK);
  } catch (error) {
    res.status(httpStatusCodes.INTERNAL_SERVER_ERROR)
      .send({ error });
  }
}

export async function pendingUsers(req: Request, res: Response): Promise<void | Response> {
  if (req.user == null) {
    return res.status(httpStatusCodes.UNAUTHORIZED).send();
  }

  if (!req.user.admin) {
    return res.status(httpStatusCodes.FORBIDDEN).send();
  }

  const userFilter: UserFilter = { pending: true };

  const users = await User.find(userFilter);
  res.send(users);
}

export async function allowedUsers(req: Request, res: Response): Promise<void | Response> {
  if (req.user == null) {
    return res.status(httpStatusCodes.UNAUTHORIZED).send();
  }

  if (!req.user.admin) {
    return res.status(httpStatusCodes.FORBIDDEN).send();
  }

  const userFilter: UserFilter = { pending: false, permitted: true };

  const users = await User.find(userFilter);
  res.send(users);
}


export async function disallowedUsers(req: Request, res: Response): Promise<void | Response> {
  if (req.user == null) {
    return res.status(httpStatusCodes.UNAUTHORIZED).send();
  }

  if (!req.user.admin) {
    return res.status(httpStatusCodes.FORBIDDEN).send();
  }

  const userFilter: UserFilter = { pending: false, permitted: false };

  const users = await User.find(userFilter);
  res.send(users);
}
