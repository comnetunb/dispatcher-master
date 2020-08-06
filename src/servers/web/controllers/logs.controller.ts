import Log from '../../../database/models/log';
import logger from '../../shared/log';
import { Request, Response } from 'express';
import httpStatusCodes from '../utils/httpStatusCodes';

export async function getAllLogs(req: Request, res: Response): Promise<void | Response> {
  if (req.query.tasksetId == null && !req.user.admin) {
    return res.sendStatus(httpStatusCodes.UNAUTHORIZED);
  }

  try {
    let logs = await Log.getAllLogs(req.query.tasksetId as string);
    if (!logs) {
      throw String('Failed to get logs');
    }

    return res.send(logs.reverse());
  } catch (error) {
    logger.error(error);
    res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).send({ error });
  }
}

export async function getAllLogsStartingFromDate(req: Request, res: Response): Promise<void | Response> {
  if (req.query.tasksetId == null && !req.user.admin) {
    return res.sendStatus(httpStatusCodes.UNAUTHORIZED);
  }

  try {
    let logs = await Log.getAllStartingFromDate(new Date(req.query.lastDate as string),
      req.query.tasksetId as string);
    if (!logs) {
      throw String('Failed to get logs');
    }

    return res.send(logs.reverse());
  } catch (error) {
    logger.error(error);
    res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).send({ error });
  }
}
