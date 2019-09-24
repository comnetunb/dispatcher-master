import TaskSet from '../../../database/models/taskSet';
import Task from '../../../database/models/task';
import logger from '../../shared/log';
import { Request, Response } from 'express';
import * as taskUtils from '../utils/task_utils';
import httpStatusCodes from '../utils/httpStatusCodes';
import { OperationState } from '../../../api/enums';

export function getAllTaskSets(req: Request, res: Response): void | Response {
  if (!req.isAuthenticated()) {
    return res.sendStatus(httpStatusCodes.UNAUTHORIZED);
  }

  const taskSetFilter = { _user: req.user._id };

  TaskSet
    .find(taskSetFilter)
    .then((taskSet) => {
      res.send(taskSet);
    })
    .catch((error) => {
      logger.error(error);
      res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).send({ error });
    });
}

export function createTaskSet(req: Request, res: Response): void | Response {
  if (!req.isAuthenticated()) {
    return res.sendStatus(httpStatusCodes.UNAUTHORIZED);
  }

  try {
    taskUtils.buildTasks(req.body, req.user);
    return res.sendStatus(httpStatusCodes.OK);
  } catch (error) {
    logger.error(error);
    res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).send({ error });
  }
}

export async function removeTaskSet(req: Request, res: Response): Promise<void | Response> {
  if (!req.isAuthenticated()) {
    return res.sendStatus(httpStatusCodes.UNAUTHORIZED);
  }

  try {
    const taskFilter = { _taskSet: req.body.id };
    const taskSetFilter = { _id: req.body.id };

    await Task.remove(taskFilter);
    await TaskSet.remove(taskSetFilter);

    res.sendStatus(httpStatusCodes.OK);
  } catch (error) {
    logger.error(error);
    res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).send({ error });
  }
}

export async function cancelTaskSet(req: Request, res: Response): Promise<void | Response> {
  if (!req.isAuthenticated()) {
    return res.sendStatus(httpStatusCodes.UNAUTHORIZED);
  }

  try {
    const taskFilter = { _taskSet: req.body.id, state: OperationState.Pending };
    const taskSetFilter = { _id: req.body.id, state: OperationState.Executing };


    await Task.update(taskFilter, {
      $set: {
        state: OperationState.Canceled,
        endTime: new Date(),
      }
    }, { multi: true });

    await TaskSet.update(taskSetFilter, {
      $set: {
        state: OperationState.Canceled,
        endTime: new Date(),
      }
    }, { multi: true });

    res.sendStatus(httpStatusCodes.OK);
  } catch (error) {
    logger.error(error);
    res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).send({ error });
  }
}

export function supportedRunnables(req: Request, res: Response): void | Response {
  if (!req.isAuthenticated()) {
    return res.sendStatus(httpStatusCodes.UNAUTHORIZED);
  }

  return res.send([{
    type: 'java',
    extension: '.jar'
  },
  {
    type: 'python',
    extension: '.py'
  }]);
}

export async function exportTaskSet(req: Request, res: Response): Promise<void> {
  const zipPath = await taskUtils.exportTaskSet(req.query.taskSetId, req.query.format);
  res.sendFile(zipPath);
}

export async function getTaskSet(req: Request, res: Response): Promise<void | Response> {
  const taskSetFilter = { _id: req.params.id };

  try {
    const taskSet = await TaskSet.findOne(taskSetFilter);
    if (req.query.includeTasks === 'true') {
      const tasks = await Task.find({ _taskSet: req.params.id });
      const completeTaskSet = taskSet.toObject();
      completeTaskSet.tasks = tasks;
      res.send(completeTaskSet);
    } else {
      res.send(taskSet);
    }
  } catch (error) {
    logger.error(error);
    res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).send({ error });
  }
}
