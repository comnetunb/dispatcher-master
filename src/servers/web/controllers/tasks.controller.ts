import TaskSet, { TaskSetFilter } from '../../../database/models/taskSet';
import Task from '../../../database/models/task';
import logger from '../../shared/log';
import { Request, Response } from 'express';
import * as taskUtils from '../utils/task_utils';
import httpStatusCodes from '../utils/httpStatusCodes';
import { OperationState } from '../../../api/enums';
import { CreateTasksetRequest } from '../../web/client/src/app/api/create-taskset-request';

export function getTasks(req: Request, res: Response): void | Response {
  const taskSetFilter = { _taskSet: req.params.tasksetId };

  Task
    .find(taskSetFilter)
    .then((tasks) => {
      res.send(tasks);
    })
    .catch((error) => {
      logger.error(error);
      res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).send({ error });
    });
}
