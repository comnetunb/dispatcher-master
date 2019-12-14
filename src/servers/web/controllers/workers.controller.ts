import Worker from '../../../database/models/worker';
import * as interfaceManager from '../../shared/interface_manager';
import logger from '../../shared/log';
import { Request, Response } from 'express';
import httpStatusCodes from '../utils/httpStatusCodes';

export function pauseWorker(req: Request, res: Response): void | Response {
  if (!req.user.admin) {
    return res.sendStatus(httpStatusCodes.FORBIDDEN);
  }

  interfaceManager.pauseWorker(req.params.address);
  res.sendStatus(httpStatusCodes.OK);
}

export function resumeWorker(req: Request, res: Response): void | Response {
  if (!req.user.admin) {
    return res.sendStatus(httpStatusCodes.FORBIDDEN);
  }

  interfaceManager.resumeWorker(req.params.address);
  res.sendStatus(httpStatusCodes.OK);
}

export function stopWorker(req: Request, res: Response): void | Response {
  if (!req.user.admin) {
    return res.sendStatus(httpStatusCodes.FORBIDDEN);
  }

  interfaceManager.stopWorker(req.params.address);
  res.sendStatus(httpStatusCodes.OK);
}

export async function getOnlineWorkers(req: Request, res: Response): Promise<void | Response> {
  try {
    let workers = await Worker.find({ 'status.online': true }, '-_id');
    return res.send(workers);
  } catch (error) {
    logger.error(error);
    res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).send({ error });
  }
}

export async function getAllWorkers(req: Request, res: Response): Promise<void | Response> {
  try {
    let workers = await Worker.find();
    return res.send(workers);
  } catch (error) {
    logger.error(error);
    res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).send({ error });
  }
}
