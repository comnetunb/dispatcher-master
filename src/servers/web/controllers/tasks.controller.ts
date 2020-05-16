import TaskSet, { TaskSetFilter } from "../../../database/models/taskSet";
import Task from "../../../database/models/task";
import logger from "../../shared/log";
import { Request, Response } from "express";
import * as taskUtils from "../utils/task_utils";
import httpStatusCodes from "../utils/httpStatusCodes";
import { OperationState } from "../../../api/enums";
import { CreateTasksetRequest } from "../api/create-taskset-request";
import { ReturnCode } from "dispatcher-protocol";

export async function getTasks(
  req: Request,
  res: Response
): Promise<void | Response> {
  if (!req.params.tasksetId) {
    return res.sendStatus(httpStatusCodes.BAD_REQUEST);
  }

  try {
    const taskset = await TaskSet.findById(req.params.tasksetId);
    const filterSuccessful = req.query.filterSuccessful === "true";

    if (!taskset || (!req.user.admin && taskset._user != req.user._id)) {
      return res.sendStatus(httpStatusCodes.NOT_FOUND);
    }

    const taskSetFilter: any = { _taskSet: req.params.tasksetId };

    if (filterSuccessful) {
      taskSetFilter.status = ReturnCode.Success;
    }

    const tasks = await Task.find(taskSetFilter);
    return res.send(tasks);
  } catch (error) {
    logger.error(error);
    return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).send({ error });
  }
}

export async function discardTask(
  req: Request,
  res: Response
): Promise<void | Response> {
  if (!req.params.taskId) {
    return res.sendStatus(httpStatusCodes.BAD_REQUEST);
  }

  try {
    let task = await Task.findById(req.params.taskId).populate("_taskSet");

    if (!task || (!req.user.admin && task._taskSet._user != req.user._id)) {
      return res.sendStatus(httpStatusCodes.NOT_FOUND);
    }

    task.state = OperationState.Canceled;
    task.result = null;
    task = await task.save();
    return res.send(task);
  } catch (error) {
    logger.error(error);
    return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).send({ error });
  }
}
