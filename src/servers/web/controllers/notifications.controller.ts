import Notification from '../../../database/models/notification';
import * as logger from '../../shared/log';
import { Request, Response } from 'express';
import httpStatusCodes from '../utils/httpStatusCodes';

export function getUnreadFromUser(req: Request, res: Response): void | Response {
  if (!req.user || !req.user._id) {
    return res.sendStatus(httpStatusCodes.UNAUTHORIZED);
  }

  Notification
    .getUnread(req.user._id)
    .then((notifications) => {
      res.send(notifications.reverse());
    })
    .catch((error) => {
      logger.error(error);
      res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).send({ error });
    });
}

export function readNotification(req: Request, res: Response): void | Response {
  if (!req.user || !req.user._id) {
    return res.sendStatus(httpStatusCodes.UNAUTHORIZED);
  }

  Notification
    .read(req.user._id, req.params.id)
    .then((notification) => {
      res.send(notification);
    })
    .catch((error) => {
      logger.error(error);
      res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).send({ error });
    });
}

export function getAllFromUser(req: Request, res: Response): void | Response {
  if (!req.user || !req.user._id) {
    return res.sendStatus(httpStatusCodes.UNAUTHORIZED);
  }

  Notification
    .getAllFromUser(req.user._id)
    .then((notifications) => {
      res.send(notifications.reverse());
    })
    .catch((error) => {
      logger.error(error);
      res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).send({ error });
    });
}
