import Worker from '../../../database/models/worker';
import * as interfaceManager from '../../shared/interface_manager';
import logger from '../../shared/log';
import { Request, Response } from 'express';
import httpStatusCodes from '../utils/httpStatusCodes';
import { WorkerCreateRequest } from '../client/src/app/api/worker-create-request';

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

export async function createWorker(req: Request, res: Response) {
  try {
    const request: WorkerCreateRequest = req.body;
    const workerFilter = { name: request.name };
    const existingWorker = await Worker.findOne(workerFilter);
    if (existingWorker) {
      res.status(httpStatusCodes.BAD_REQUEST)
        .send({ error: 'There already is a worker with this name.' });
      return;
    }

    const { name, description, password } = request;
    const hash = Worker.encryptPassword(password);

    const newWorker = new Worker({
      name,
      description,
      password: hash
    });
    const worker = await newWorker.save();
    res.status(httpStatusCodes.CREATED).send(worker);
  } catch (error) {
    res.status(httpStatusCodes.INTERNAL_SERVER_ERROR)
      .send({ error });
  }
}
