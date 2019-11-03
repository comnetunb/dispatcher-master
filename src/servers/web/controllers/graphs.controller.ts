import Task from '../../../database/models/task';
import TaskSet, { ITaskSet } from '../../../database/models/taskSet';
import logger from '../../shared/log';
import { Request, Response } from 'express';
import httpStatusCodes from '../utils/httpStatusCodes';
import { PlotInfo } from '../api/plotInfo';
import { OperationState } from '../../../api/enums';
import { TasksetChartInfo, TasksetChartData } from '../client/src/app/classes/taskset-chart-config';

export function plotInfo(req: Request, res: Response): void | Response {
  const taskFilter = {
    _taskSet: req.params.taskSetId,
    state: OperationState.Finished,
  };

  Task
    .findOne(taskFilter)
    .populate('_taskSet')
    .then((task) => {
      const info: PlotInfo = {
        axes: [],
        curves: [],
        argumentTemplate: undefined,
      };

      if (!task) {
        return res.send(info);
      }

      let taskset: ITaskSet = task._taskSet;
      info.argumentTemplate = task._taskSet.argumentTemplate;
      info.axes = Object.getOwnPropertyNames(JSON.parse(task.result));

      for (let i = 0; i < taskset.inputs.length; i += 1) {
        info.curves.push(taskset.inputs[i].label);
      }

      return res.send(info);
    })
    .catch((error) => {
      logger.error(error);
      return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).send({ error });
    });
}

export function plotData(req: Request, res: Response): void | Response {
  const graphs: TasksetChartInfo[] = req.body;
  const taskFilter = {
    _taskSet: req.params.taskSetId,
    state: OperationState.Finished,
  };

  Task
    .find(taskFilter)
    .then((tasks) => {
      const graphsCurves: TasksetChartData[] = [];

      for (let i = 0; i < graphs.length; i += 1) {
        if (graphs[i].curve && graphs[i].xAxis && graphs[i].yAxis) {
          const curves: TasksetChartData = {};
          const curve: string = graphs[i].curve;
          const xAxis = graphs[i].xAxis;
          const yAxis = graphs[i].yAxis;

          for (let task of tasks) { // eslint-disable-line
            const curveIdx = task.inputLabels.findIndex(i => i == curve);
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
      res.send(graphsCurves);
    })
    .catch((error) => {
      logger.error(error);
      return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).send({ error });
    });
}
