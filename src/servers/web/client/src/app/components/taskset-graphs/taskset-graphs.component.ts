import { Component, OnInit, OnDestroy } from '@angular/core';
import { ITaskSet } from '../../../../../../../database/models/taskSet';
import { ActivatedRoute, Router } from '@angular/router';
import { TasksetService } from '../../services/taskset.service';
import { DialogService } from '../../services/dialog.service';
import { getErrorMessage } from '../../classes/utils';
import { TasksetChartService } from '../../services/taskset-chart.service';
import { ChartOptions, ChartData, ChartDataSets } from 'chart.js';
import {
  TasksetChartInfo,
  TasksetChart,
} from '../../classes/taskset-chart-config';
import { PlotInfo } from '../../../../../api/plotInfo';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-taskset-graphs',
  templateUrl: './taskset-graphs.component.html',
  styleUrls: ['./taskset-graphs.component.scss'],
})
export class TasksetGraphsComponent implements OnInit, OnDestroy {
  charts: TasksetChart[] = [];
  finishedTasks: number;
  plotInfo: PlotInfo;
  taskset: ITaskSet;
  loadingTaskset: boolean = false;
  loadingPlotinfo: boolean = false;
  loadingCharts: boolean = false;
  graphInterval: Subscription = null;

  defaultColors: string[] = [
    '#3969b1', // blue
    '#da7c30', // orange
    '#3e9651', // green
    '#cc2529', // red
    '#535154', // gray
    '#6b4c9a', // purple
    '#922428', // darker red
    '#948b3d', // darker yellow
  ];

  standardOptions: ChartOptions = {
    scales: {
      xAxes: [
        {
          type: 'linear',
          display: true,
          scaleLabel: {
            display: true,
          },
        },
      ],
      yAxes: [
        {
          display: true,
          scaleLabel: {
            display: true,
          },
        },
      ],
    },
    elements: {
      line: {
        tension: 0,
        fill: false,
      },
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  getColor(i: number): string {
    if (i < this.defaultColors.length) {
      return this.defaultColors[i];
    }

    return '#' + Math.random().toString(16).slice(2, 8);
  }

  get loading(): boolean {
    return this.loadingTaskset || this.loadingPlotinfo || this.loadingCharts;
  }

  constructor(
    private route: ActivatedRoute,
    private tasksetService: TasksetService,
    private router: Router,
    private dialogService: DialogService,
    private tasksetChartService: TasksetChartService
  ) { }

  ngOnInit() {
    this.finishedTasks = 0;
    const tasksetId = this.route.parent.snapshot.params.tasksetId;
    this.loadingTaskset = true;

    this.tasksetService.get(tasksetId).subscribe(
      (taskset) => {
        this.taskset = taskset;
        this.loadingTaskset = false;
      },
      (err) => {
        console.error(err);
        this.dialogService
          .alert(getErrorMessage(err), 'Could not load the Taskset')
          .subscribe(() => {
            this.router.navigate(['..'], { relativeTo: this.route });
          });
      }
    );

    this.loadingPlotinfo = true;
    this.tasksetChartService.plotInfo(tasksetId).subscribe((plotInfo) => {
      this.plotInfo = plotInfo;
      this.loadingPlotinfo = false;
    });

    this.loadingCharts = true;
    const infos = this.tasksetChartService.get(tasksetId);
    for (const info of infos) {
      this.charts.push({
        info,
        datasets: [{ data: [] }],
      });
    }

    this.graphInterval = interval(2000).subscribe(() => {
      if (!this.taskset) {
        return;
      }

      this.loadingCharts = false;
      const chartInfos = this.charts.map((c) => c.info);
      this.tasksetChartService.set(this.taskset._id, chartInfos);
      const plotDataSub = this.tasksetChartService
        .plotData(this.taskset, chartInfos)
        .subscribe((result) => {
          this.finishedTasks = result.taskCount;
          const graphs = result.charts;
          for (let i = 0; i < graphs.length; i++) {
            const data = graphs[i];

            let j = 0;
            for (const curve in data) {
              if (!data[curve]) {
                continue;
              }

              const previous = this.charts[i].datasets[j];
              let color = this.getColor(j);
              if (previous) {
                color = previous.borderColor as string;
              }

              const avg = {};
              for (const p of data[curve]) {
                if (!avg.hasOwnProperty(p.x)) {
                  avg[p.x] = {
                    xValue: p.x,
                    yValueSum: 0,
                    yCount: 0,
                  };
                }

                avg[p.x].yValueSum += p.y;
                avg[p.x].yCount += 1;
              }

              const final = [];
              for (const x in avg) {
                if (!avg[x]) {
                  continue;
                }

                const xx = avg[x];
                final.push({ x: xx.xValue, y: xx.yValueSum / xx.yCount });
              }

              if (previous) {
                this.charts[i].datasets[j].data = final;
                this.charts[i].datasets[j].label = `${chartInfos[i].curve} ${curve}`;
              } else {
                const dataset: ChartDataSets = {
                  data: final,
                  label: `${chartInfos[i].curve} ${curve}`,
                  showLine: true,
                  borderColor: color, // Add custom color border
                  backgroundColor: color, // Add custom color
                  pointBackgroundColor: color,
                  pointBorderColor: color,
                };
                this.charts[i].datasets.push(dataset);
              }

              j++;
            }
            this.charts[i].datasets.length = j;
          }
          // if (this.graphInterval) this.graphInterval.unsubscribe();
          plotDataSub.unsubscribe();
        });
    });
  }

  ngOnDestroy() {
    if (this.graphInterval) {
      this.graphInterval.unsubscribe();
    }
  }

  addChart() {
    this.charts.push({
      info: {
        options: this.standardOptions,
        xAxis: null,
        yAxis: null,
        curve: null,
        type: 'scatter',
        legend: true,
      },
      datasets: [{ data: [] }],
    });
    this.tasksetChartService.set(
      this.taskset._id,
      this.charts.map((c) => c.info)
    );
  }

  removeChart(chartIdx: number) {
    this.charts.splice(chartIdx, 1);
    this.tasksetChartService.set(
      this.taskset._id,
      this.charts.map((c) => c.info)
    );
  }
}
