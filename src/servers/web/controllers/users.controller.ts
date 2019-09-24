import passport from 'passport';
import User, { UserFilter } from '../../../database/models/user';
import { Request, Response } from 'express';
import httpStatusCodes from '../utils/httpStatusCodes';
import { NextFunction } from 'connect';

export function isSignedIn(req: Request, res: Response): void {
  res.send(req.user);
  // res.send(req.isAuthenticated() ? req.user : null);
}

export function signOut(req: Request, res: Response): void {
  req.logOut();
  res.sendStatus(httpStatusCodes.OK);
}

export function signIn(req: Request, res: Response, next: NextFunction): void {
  passport.authenticate('local', function (err, user, info) {
    if (err) {
      return res.status(httpStatusCodes.UNAUTHORIZED).send(err);
    }
    if (!user) {
      return res.status(httpStatusCodes.UNAUTHORIZED).json(info);
    }

    return req.logIn(user, function (err2) {
      if (err) { return next(err2); }
      return res.json(user);
    });
  })(req, res, next);
}

export async function signUp(req: Request, res: Response): Promise<void> {
  const userFilter: UserFilter = { email: req.body.email };

  try {
    const existingUser = await User.findOne(userFilter);
    if (existingUser) {
      res.status(httpStatusCodes.BAD_REQUEST)
        .send({ reason: 'There already is an account with this e-mail.' });
      return;
    }

    const { email, name, password } = req.body;

    const hash = User.encryptPassword(password);

    const newUser = new User({
      email,
      name,
      password: hash
    });

    await newUser.save();
    res.sendStatus(httpStatusCodes.OK);
  } catch (error) {
    res.status(httpStatusCodes.INTERNAL_SERVER_ERROR)
      .send({ error });
  };
}

export async function manageUser(req: Request, res: Response): Promise<void | Response> {
  if (!req.isAuthenticated()) {
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
  if (!req.isAuthenticated()) {
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
  if (!req.isAuthenticated()) {
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
  if (!req.isAuthenticated()) {
    return res.status(httpStatusCodes.UNAUTHORIZED).send();
  }

  if (!req.user.admin) {
    return res.status(httpStatusCodes.FORBIDDEN).send();
  }

  const userFilter: UserFilter = { pending: false, permitted: false };

  const users = await User.find(userFilter);
  res.send(users);
}
