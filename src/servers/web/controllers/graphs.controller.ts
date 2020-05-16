import Task from "../../../database/models/task";
import TaskSet from "../../../database/models/taskSet";
import logger from "../../shared/log";
import { Request, Response } from "express";
import httpStatusCodes from "../utils/httpStatusCodes";
import { PlotInfo } from "../api/plotInfo";
import { OperationState } from "../../../api/enums";

export async function plotInfo(
  req: Request,
  res: Response
): Promise<void | Response> {
  if (!req.params.tasksetId) {
    return res.sendStatus(httpStatusCodes.BAD_REQUEST);
  }
  try {
    const taskset = await TaskSet.findById(req.params.tasksetId);
    if (!taskset || (!req.user.admin && taskset._user != req.user._id)) {
      console.log(taskset);
      return res.sendStatus(httpStatusCodes.NOT_FOUND);
    }

    const taskFilter = {
      _taskSet: req.params.tasksetId,
      state: OperationState.Finished,
    };

    let task = await Task.findOne(taskFilter);
    const info: PlotInfo = {
      axes: [],
      curves: [],
      argumentTemplate: undefined,
    };

    info.argumentTemplate = taskset.argumentTemplate;
    info.axes = [];
    if (task) {
      info.axes = Object.getOwnPropertyNames(JSON.parse(task.result));
    }

    for (let i = 0; i < taskset.inputs.length; i += 1) {
      info.curves.push(taskset.inputs[i].label);
    }

    return res.send(info);
  } catch (error) {
    logger.error(error);
    return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).send({ error });
  }
}
