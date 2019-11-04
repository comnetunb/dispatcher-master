import TaskSet, { TaskSetFilter } from '../../../database/models/taskSet';
import Task from '../../../database/models/task';
import logger from '../../shared/log';
import { Request, Response } from 'express';
import * as taskUtils from '../utils/task_utils';
import httpStatusCodes from '../utils/httpStatusCodes';
import { OperationState } from '../../../api/enums';
import { CreateTasksetRequest } from '../../web/client/src/app/api/create-taskset-request';

export async function getTasks(req: Request, res: Response): Promise<void | Response> {
  if (!req.params.tasksetId) {
    return res.sendStatus(httpStatusCodes.BAD_REQUEST);
  }
  try {
    const taskset = await TaskSet.findById(req.params.tasksetId);

    if (!taskset || (!req.user.admin && taskset._user != req.user._id)) {
      return res.sendStatus(httpStatusCodes.NOT_FOUND);
    }

    const taskSetFilter = { _taskSet: req.params.tasksetId };
    const tasks = await Task.find(taskSetFilter);
    return res.send(tasks);
  } catch (error) {
    logger.error(error);
    return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).send({ error });
  }
}
