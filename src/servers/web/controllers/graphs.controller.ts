import Task from '../../../database/models/task';
import TaskSet, { ITaskSet } from '../../../database/models/taskSet';
import logger from '../../shared/log';
import { Request, Response } from 'express';
import httpStatusCodes from '../utils/httpStatusCodes';
import { PlotInfo } from '../api/plotInfo';
import { OperationState } from '../../../api/enums';
import { TasksetChartInfo, TasksetChartData } from '../client/src/app/classes/taskset-chart-config';

export async function plotInfo(req: Request, res: Response): Promise<void | Response> {
  if (!req.params.tasksetId) {
    return res.sendStatus(httpStatusCodes.BAD_REQUEST);
  }
  try {
    const taskset = await TaskSet.findById(req.params.tasksetId);
    if (!taskset || (!req.user.admin && taskset._user != req.user._id)) {
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

    if (!task) {
      return res.status(httpStatusCodes.NOT_FOUND).send({ error: 'No finished task' });
    }

    info.argumentTemplate = task._taskSet.argumentTemplate;
    info.axes = Object.getOwnPropertyNames(JSON.parse(task.result));

    for (let i = 0; i < taskset.inputs.length; i += 1) {
      info.curves.push(taskset.inputs[i].label);
    }

    return res.send(info);
  } catch (error) {
    logger.error(error);
    return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).send({ error });
  }
}

export async function plotData(req: Request, res: Response): Promise<void | Response> {
  if (!req.params.tasksetId) {
    return res.sendStatus(httpStatusCodes.BAD_REQUEST);
  }
  try {
    const taskset = await TaskSet.findById(req.params.tasksetId);
    if (!taskset || (!req.user.admin && taskset._user != req.user._id)) {
      return res.sendStatus(httpStatusCodes.NOT_FOUND);
    }

    const graphs: TasksetChartInfo[] = req.body;
    const taskFilter = {
      _taskSet: req.params.tasksetId,
      state: OperationState.Finished,
    };

    let tasks = await Task.find(taskFilter);

    const graphsCurves: TasksetChartData[] = [];

    for (let i = 0; i < graphs.length; i += 1) {
      if (graphs[i].curve && graphs[i].xAxis && graphs[i].yAxis) {
        const curves: TasksetChartData = {};
        const curve: string = graphs[i].curve;
        const xAxis = graphs[i].xAxis;
        const yAxis = graphs[i].yAxis;

        for (let task of tasks) { // eslint-disable-line
          const curveIdx = taskset.inputLabels.findIndex(i => i == curve);
          const curveLabel = task.arguments[curveIdx];
          if (!curves.hasOwnProperty(curveLabel)) {
            curves[curveLabel] = [];
          }

          const result = JSON.parse(task.result);
          const xAxisResult: number = result[xAxis];
          const yAxisResult: number = result[yAxis];
          if (xAxisResult == null || yAxisResult == null) continue;
          curves[curveLabel].push({
            x: xAxisResult,
            y: yAxisResult,
          });
        }

        graphsCurves.push(curves);
      } else {
        graphsCurves.push(null);
      }
    }
    return res.send(graphsCurves);
  } catch (error) {
    logger.error(error);
    return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).send({ error });
  }
}
