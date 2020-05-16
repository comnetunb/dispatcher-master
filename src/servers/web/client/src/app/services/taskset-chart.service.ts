import { Injectable } from "@angular/core";
import {
  TasksetChartInfo,
  TasksetChartData,
} from "../classes/taskset-chart-config";
import { PlotInfo } from "../../../../api/plotInfo";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { TasksService } from "./tasks.service";
import { ITaskSet } from "../../../../../../database/models/taskSet";

const apiRoute = "/api/graphs";

@Injectable({
  providedIn: "root",
})
export class TasksetChartService {
  constructor(private http: HttpClient, private tasksService: TasksService) {}

  private key(tasksetId: string): string {
    return `taskset-chart-${tasksetId}`;
  }

  get(tasksetId: string): TasksetChartInfo[] {
    const chartString = localStorage.getItem(this.key(tasksetId));
    if (!chartString) {
      localStorage.setItem(this.key(tasksetId), "[]");
      return [];
    }
    const charts = JSON.parse(chartString) as TasksetChartInfo[];
    return charts;
  }

  set(tasksetId: string, charts: TasksetChartInfo[]): void {
    localStorage.setItem(this.key(tasksetId), JSON.stringify(charts));
  }

  append(tasksetId: string, chart: TasksetChartInfo): void {
    const chartString = localStorage.getItem(this.key(tasksetId));
    let charts: TasksetChartInfo[] = [];
    if (chartString) {
      charts = JSON.parse(chartString) as TasksetChartInfo[];
    }
    charts.push(chart);
    localStorage.setItem(this.key(tasksetId), JSON.stringify(charts));
  }

  plotInfo(tasksetId: string): Observable<PlotInfo> {
    return this.http.get<PlotInfo>(`${apiRoute}/${tasksetId}/info`);
  }

  plotData(
    taskset: ITaskSet,
    charts: TasksetChartInfo[]
  ): Observable<TasksetChartData[]> {
    return this.tasksService.getFromTaskset(taskset._id).pipe(
      map((tasks) => {
        const chartsCurves: TasksetChartData[] = [];

        for (const chart of charts) {
          if (chart.curve && chart.xAxis && chart.yAxis) {
            const curves: TasksetChartData = {};
            const curve: string = chart.curve;
            const xAxis = chart.xAxis;
            const yAxis = chart.yAxis;

            for (const task of tasks) {
              // tslint:disable-next-line: triple-equals
              const curveIdx = taskset.inputLabels.findIndex((i) => i == curve);
              const curveLabel = task.arguments[curveIdx];
              if (!curves.hasOwnProperty(curveLabel)) {
                curves[curveLabel] = [];
              }

              const result = JSON.parse(task.result);
              const xAxisResult: number = result[xAxis];
              const yAxisResult: number = result[yAxis];

              if (xAxisResult && yAxisResult) {
                curves[curveLabel].push({
                  x: xAxisResult,
                  y: yAxisResult,
                });
              }
            }

            chartsCurves.push(curves);
          } else {
            chartsCurves.push(null);
          }
        }

        return chartsCurves;
      })
    );
  }
}
