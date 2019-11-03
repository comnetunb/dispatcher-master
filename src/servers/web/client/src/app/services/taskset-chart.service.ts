import { Injectable } from '@angular/core';
import { TasksetChartInfo, TasksetChartData } from '../classes/taskset-chart-config';
import { PlotInfo } from '../../../../api/plotInfo';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const apiRoute = '/api/graphs'

@Injectable({
  providedIn: 'root'
})
export class TasksetChartService {

  constructor(
    private http: HttpClient
  ) { }

  private key(tasksetId: string): string {
    return `taskset-chart-${tasksetId}`;
  }

  get(tasksetId: string): TasksetChartInfo[] {
    let chartString = localStorage.getItem(this.key(tasksetId));
    if (!chartString) {
      localStorage.setItem(this.key(tasksetId), '[]');
      return [];
    }
    let charts = JSON.parse(chartString) as TasksetChartInfo[];
    return charts;
  }

  set(tasksetId: string, charts: TasksetChartInfo[]): void {
    localStorage.setItem(this.key(tasksetId), JSON.stringify(charts));
  }

  append(tasksetId: string, chart: TasksetChartInfo): void {
    let chartString = localStorage.getItem(this.key(tasksetId));
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

  plotData(tasksetId: string, charts: TasksetChartInfo[]): Observable<TasksetChartData[]> {
    return this.http.post<TasksetChartData[]>(`${apiRoute}/${tasksetId}/data`, charts);
  }
}
