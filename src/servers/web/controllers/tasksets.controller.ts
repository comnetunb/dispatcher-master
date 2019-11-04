import TaskSet, { TaskSetFilter } from '../../../database/models/taskSet';
import Task from '../../../database/models/task';
import logger from '../../shared/log';
import { Request, Response } from 'express';
import * as taskUtils from '../utils/task_utils';
import httpStatusCodes from '../utils/httpStatusCodes';
import { OperationState } from '../../../api/enums';
import { CreateTasksetRequest } from '../../web/client/src/app/api/create-taskset-request';

export async function getTaskSets(req: Request, res: Response): Promise<void | Response> {
  const taskSetFilter: TaskSetFilter = {};

  if (!req.adminMode) {
    taskSetFilter._user = req.user._id;
  }

  if (req.query.state) {
    taskSetFilter.state = req.query.state;
  }

  try {
    let tasksets = await TaskSet.find(taskSetFilter);
    return res.send(tasksets);
  } catch (error) {
    logger.error(error);
    res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).send({ error });
  }
}

export async function createTaskSet(req: Request, res: Response): Promise<void | Response> {
  try {
    let request: CreateTasksetRequest = req.body;
    const taskset = await taskUtils.buildTasks(request, req.user);
    return res.send(taskset);
  } catch (error) {
    logger.error(error);
    res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).send({ error });
  }
}

export async function removeTaskSet(req: Request, res: Response): Promise<void | Response> {
  if (!req.params.id) {
    return res.sendStatus(httpStatusCodes.BAD_REQUEST);
  }
  try {
    const taskset = await TaskSet.findById(req.params.id);

    if (!taskset || (!req.user.admin && taskset._user != req.user._id)) {
      return res.sendStatus(httpStatusCodes.NOT_FOUND);
    }

    const taskFilter = { _taskSet: req.params.id };
    const taskSetFilter = { _id: req.params.id };

    await Task.remove(taskFilter);
    await TaskSet.remove(taskSetFilter);

    res.sendStatus(httpStatusCodes.OK);
  } catch (error) {
    logger.error(error);
    res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).send({ error });
  }
}

export async function cancelTaskSet(req: Request, res: Response): Promise<void | Response> {
  if (!req.params.id) {
    return res.sendStatus(httpStatusCodes.BAD_REQUEST);
  }
  try {
    let taskset = await TaskSet.findById(req.params.id);

    if (!taskset || (!req.user.admin && taskset._user != req.user._id)) {
      return res.sendStatus(httpStatusCodes.NOT_FOUND);
    }

    const taskFilter = { _taskSet: req.params.id, state: OperationState.Pending };
    const taskSetFilter = { _id: req.params.id, state: OperationState.Executing };

    await Task.updateMany(taskFilter, {
      $set: {
        state: OperationState.Canceled,
        endTime: new Date(),
      }
    });

    taskset = await TaskSet.updateOne(taskSetFilter, {
      $set: {
        state: OperationState.Canceled,
        endTime: new Date(),
      }
    });

    res.send(taskset);
  } catch (error) {
    logger.error(error);
    res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).send({ error });
  }
}

export function supportedRunnables(req: Request, res: Response): void | Response {
  return res.send([{
    type: 'java',
    extension: '.jar'
  },
  {
    type: 'python',
    extension: '.py'
  }]);
}

export async function exportTaskSet(req: Request, res: Response): Promise<void | Response> {
  if (!req.params.id) {
    return res.sendStatus(httpStatusCodes.BAD_REQUEST);
  }
  try {
    let taskset = await TaskSet.findById(req.params.id);

    if (!taskset || (!req.user.admin && taskset._user != req.user._id)) {
      return res.sendStatus(httpStatusCodes.NOT_FOUND);
    }

    const zipPath = await taskUtils.exportTaskSet(req.params.id, req.query.format);
    res.sendFile(zipPath);
  } catch (error) {
    logger.error(error);
    res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).send({ error });
  }
}

export async function getTaskSet(req: Request, res: Response): Promise<void | Response> {
  if (!req.params.id) {
    return res.sendStatus(httpStatusCodes.BAD_REQUEST);
  }
  try {
    let taskset = await TaskSet.findById(req.params.id);

    if (!taskset || (!req.user.admin && taskset._user != req.user._id)) {
      return res.sendStatus(httpStatusCodes.NOT_FOUND);
    }

    return res.send(taskset);
  } catch (error) {
    logger.error(error);
    res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).send({ error });
  }
}
