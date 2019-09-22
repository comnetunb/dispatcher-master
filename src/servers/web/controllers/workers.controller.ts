import Worker from '../../../database/models/worker';
import * as interfaceManager from '../../shared/interface_manager';
import logger from '../../shared/log';
import { Request, Response } from 'express';
import httpStatusCodes from '../utils/httpStatusCodes';

export function pauseWorker(req: Request, res: Response): void | Response {
  if (!req.isAuthenticated()) {
    return res.sendStatus(httpStatusCodes.UNAUTHORIZED);
  }

  if (!req.user.admin) {
    return res.sendStatus(httpStatusCodes.FORBIDDEN);
  }

  interfaceManager.pauseWorker(req.params.address);
  res.sendStatus(httpStatusCodes.OK);
}

export function resumeWorker(req: Request, res: Response): void | Response {
  if (!req.isAuthenticated()) {
    return res.sendStatus(httpStatusCodes.UNAUTHORIZED);
  }

  if (!req.user.admin) {
    return res.sendStatus(httpStatusCodes.FORBIDDEN);
  }

  interfaceManager.resumeWorker(req.params.address);
  res.sendStatus(httpStatusCodes.OK);
}

export function stopWorker(req: Request, res: Response): void | Response {
  if (!req.isAuthenticated()) {
    return res.sendStatus(httpStatusCodes.UNAUTHORIZED);
  }

  if (!req.user.admin) {
    return res.sendStatus(httpStatusCodes.FORBIDDEN);
  }

  interfaceManager.stopWorker(req.params.address);
  res.sendStatus(httpStatusCodes.OK);
}

export function getAllWorkers(req: Request, res: Response): void | Response {
  if (!req.isAuthenticated()) {
    return res.sendStatus(httpStatusCodes.UNAUTHORIZED);
  }

  if (!req.user.admin) {
    return res.sendStatus(httpStatusCodes.FORBIDDEN);
  }

  Worker
    .find({}, '-_id')
    .then((workers) => {
      res.send(workers);
    }).catch((error) => {
      logger.error(error);
      res.sendStatus(httpStatusCodes.INTERNAL_SERVER_ERROR).send({ error });
    })
}
