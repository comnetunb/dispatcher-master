import passport from 'passport';
import User, { UserFilter } from '../../../database/models/user';
import { Request, Response } from 'express';
import httpStatusCodes from '../utils/httpStatusCodes';
import { NextFunction } from 'connect';
import { RegisterUserRequest } from '../client/src/app/api/register-user-request';
import { EditUserRequest } from '../client/src/app/api/edit-user-request';

export function isSignedIn(req: Request, res: Response): void {
  if (req.user) {
    const user = req.user;
    user.tokens = undefined;
    user.password = undefined;
    res.send(user);
  } else {
    res.sendStatus(httpStatusCodes.UNAUTHORIZED);
  }
}

export function signOut(req: Request, res: Response): void {
  const user = req.user;
  user.tokens = [];
  user.save();
  res.sendStatus(httpStatusCodes.OK);
}

export async function signIn(req: Request, res: Response, next: NextFunction): Promise<void | Response> {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ email: username.toLowerCase() });
    if (!user) {
      return res.status(httpStatusCodes.BAD_REQUEST).send({ error: 'User not found.' });
    }

    if (!user.validPassword(password)) {
      return res.status(httpStatusCodes.UNAUTHORIZED).send({ error: 'Wrong password.' });
    }


    const token = await user.generateAuthToken();
    user.password = undefined;
    user.tokens = undefined;
    return res.send({ user, token });
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

    const count = await User.count({});
    const hash = User.encryptPassword(password);
    let admin = false;
    let permitted = false;
    let pending = true;

    if (count == 0) {
      admin = true;
      permitted = true;
      pending = false;
    }

    const newUser = new User({
      email,
      name,
      password: hash,
      admin,
      permitted,
      pending,
    });

    const user = await newUser.save();
    const token = await user.generateAuthToken();
    user.password = undefined;
    user.tokens = undefined;
    res.status(httpStatusCodes.CREATED).send({ user, token });
  } catch (error) {
    res.status(httpStatusCodes.INTERNAL_SERVER_ERROR)
      .send({ error });
  };
}

export async function getUser(req: Request, res: Response): Promise<void | Response> {
  const userId = req.params.id;

  if (!req.user.admin && req.user.id != userId) {
    return res.sendStatus(httpStatusCodes.FORBIDDEN);
  }

  let user = await User.findById(userId);
  return res.send(user);
}

export async function editUser(req: Request, res: Response): Promise<void | Response> {
  const userId = req.params.id;

  if (!req.user.admin && req.user.id != userId) {
    return res.sendStatus(httpStatusCodes.FORBIDDEN);
  }

  let user = await User.findById(userId);
  const body: EditUserRequest = req.body;
  const { email, name, password, newPassword } = body;

  if (req.user.id == userId) {
    const matches = user.validPassword(password);
    if (!matches) {
      return res.sendStatus(httpStatusCodes.FORBIDDEN);
    }
  }

  user.email = email;
  user.name = name;

  if (newPassword) {
    user.password = User.encryptPassword(newPassword);
  }

  user = await user.save();
  return res.send(user);
}

export async function manageUser(req: Request, res: Response): Promise<void | Response> {
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
  if (!req.user.admin) {
    return res.status(httpStatusCodes.FORBIDDEN).send();
  }

  const userFilter: UserFilter = { pending: true };

  const users = await User.find(userFilter);
  res.send(users);
}

export async function allowedUsers(req: Request, res: Response): Promise<void | Response> {
  if (!req.user.admin) {
    return res.status(httpStatusCodes.FORBIDDEN).send();
  }

  const userFilter: UserFilter = { pending: false, permitted: true };

  const users = await User.find(userFilter);
  res.send(users);
}

export async function disallowedUsers(req: Request, res: Response): Promise<void | Response> {
  if (!req.user.admin) {
    return res.status(httpStatusCodes.FORBIDDEN).send();
  }

  const userFilter: UserFilter = { pending: false, permitted: false };

  const users = await User.find(userFilter);
  res.send(users);
}

export async function adminUser(req: Request, res: Response): Promise<void | Response> {
  if (!req.user.admin) {
    return res.sendStatus(httpStatusCodes.FORBIDDEN);
  }

  const userFilter: UserFilter = { _id: req.params.id };
  let admin: boolean;
  if (req.query.admin === 'false') {
    admin = false;
  } else if (req.query.admin === 'true') {
    admin = true;
  } else {
    return res.sendStatus(httpStatusCodes.BAD_REQUEST);
  }

  try {
    const user = await User.findOne(userFilter);
    user.admin = admin;
    await user.save();
    res.sendStatus(httpStatusCodes.OK);
  } catch (error) {
    res.status(httpStatusCodes.INTERNAL_SERVER_ERROR)
      .send({ error });
  }
}
