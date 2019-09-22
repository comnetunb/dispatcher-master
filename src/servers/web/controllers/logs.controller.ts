import Log from '../../../database/models/log';
import * as logger from '../../shared/log';
import { Request, Response } from 'express';
import httpStatusCodes from '../utils/httpStatusCodes';

export function getAllLogs(req: Request, res: Response): void {
  Log
    .getAllLogs(req.query.taskSetId)
    .then((logs) => {
      if (!logs) {
        throw String('Failed to get logs');
      }

      res.send(logs.reverse());
    })
    .catch((error) => {
      logger.error(error);
      res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).send({ error });
    });
}

export function getAllLogsStartingFromDate(req: Request, res: Response): void {
  Log
    .getAllStartingFromDate(req.query.lastDate, req.query.taskSetId)
    .then((logs) => {
      if (!logs) {
        throw String('Failed to get logs');
      }

      res.send(logs.reverse());
    })
    .catch((error) => {
      logger.error(error);
      res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).send({ error });
    });
}
