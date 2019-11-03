import { ChartData, ChartOptions, ChartType, Point, ChartDataSets } from 'chart.js';

export interface TasksetChartInfo {
  xAxis: string;
  yAxis: string;
  curve: string;
  options: ChartOptions;
  type: ChartType;
  legend: boolean;
}

export interface TasksetChart {
  info: TasksetChartInfo;
  datasets: ChartDataSets[];
}

export interface TasksetChartData {
  [curve: string]: Point[];
}
