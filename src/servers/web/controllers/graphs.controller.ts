import Task from '../../../database/models/task';
import TaskSet from '../../../database/models/taskSet';
import logger from '../../shared/log';
import { Request, Response } from 'express';
import httpStatusCodes from '../utils/httpStatusCodes';
import { PlotInfo } from '../api/plotInfo';
import { OperationState } from '../../../database/enums';

export function plotInfo(req: Request, res: Response): void | Response {
  const taskFilter = {
    _taskSet: req.params.taskSetId,
  };

  Task
    .findOne(taskFilter)
    .populate('_taskSet')
    .then((task) => {
      const info: PlotInfo = {
        axes: [],
        curves: [],
        graphs: [],
        argumentTemplate: undefined,
      };

      if (!task) {
        return res.send(info);
      }

      info.argumentTemplate = task._taskSet.argumentTemplate;
      info.axes = Object.getOwnPropertyNames(JSON.parse(task.result));

      for (let i = 0; i < task.indexes.length; i += 1) {
        const option = {
          key: `Argument ${i}`,
          value: i
        };

        info.curves.push(option);
      }

      info.graphs = task._taskSet.graphs;

      return res.send(info);
    })
    .catch((error) => {
      logger.error(error);
      return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).send({ error });
    });
}

export function plotData(req: Request, res: Response): void | Response {
  const graphs = req.body.body;
  const taskFilter = {
    _taskSet: req.params.taskSetId,
    state: OperationState.Finished,
  };

  Task
    .find(taskFilter)
    .then((tasks) => {
      const graphsCurves = [];

      for (let i = 0; i < graphs.length; i += 1) {
        if (graphs[i].curve !== undefined && graphs[i].xAxis && graphs[i].xAxis) {
          const curves = {};

          for (let task in tasks) { // eslint-disable-line
            const curveIdx = tasks[task].indexes[graphs[i].curve].toString();

            if (!curves.hasOwnProperty(curveIdx)) {
              curves[curveIdx] = {};
            }

            const result = JSON.parse(tasks[task].result);

            const xAxisIdx = result[graphs[i].xAxis].toString();

            if (!curves[curveIdx].hasOwnProperty(xAxisIdx)) {
              curves[curveIdx][xAxisIdx] = [];
            }

            curves[curveIdx][xAxisIdx].push(result[graphs[i].yAxis]);
          }

          graphsCurves.push(curves);
        } else {
          graphsCurves.push(undefined);
        }
      }
      TaskSet.findOne({ _id: req.params.taskSetId }).then(a => {
        a.graphs = graphs;
        a.save();
      });
      res.send(graphsCurves);
    })
    .catch((error) => {
      logger.error(error);
      return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).send({ error });
    });
}
