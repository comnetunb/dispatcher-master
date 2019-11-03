import { Component, OnInit, OnDestroy } from '@angular/core';
import { ITaskSet } from '../../../../../../../database/models/taskSet';
import { ActivatedRoute, Router } from '@angular/router';
import { TasksetService } from '../../services/taskset.service';
import { DialogService } from '../../services/dialog.service';
import { getErrorMessage } from '../../classes/utils';
import { TasksetChartService } from '../../services/taskset-chart.service';
import { ChartOptions, ChartData, ChartDataSets } from 'chart.js';
import { TasksetChartInfo, TasksetChart } from '../../classes/taskset-chart-config';
import { PlotInfo } from '../../../../../api/plotInfo';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-taskset-graphs',
  templateUrl: './taskset-graphs.component.html',
  styleUrls: ['./taskset-graphs.component.scss']
})
export class TasksetGraphsComponent implements OnInit, OnDestroy {
  charts: TasksetChart[] = [];
  plotInfo: PlotInfo;
  taskset: ITaskSet;
  loadingTaskset: boolean = false;
  loadingPlotinfo: boolean = false;
  loadingCharts: boolean = false;
  graphInterval: Subscription = null;

  get loading(): boolean {
    return this.loadingTaskset || this.loadingPlotinfo || this.loadingCharts;
  }

  standardOptions: ChartOptions = {
    scales: {
      xAxes: [{
        type: 'linear',
        display: true,
        scaleLabel: {
          display: true,
        },
      }],
      yAxes: [{
        display: true,
        scaleLabel: {
          display: true,
        }
      }],
    },
    elements: {
      line: {
        tension: 0,
        fill: false,
      }
    }
  };

  constructor(
    private route: ActivatedRoute,
    private tasksetService: TasksetService,
    private router: Router,
    private dialogService: DialogService,
    private tasksetChartService: TasksetChartService
  ) { }

  ngOnInit() {
    let tasksetId = this.route.parent.snapshot.params['tasksetId'];
    this.loadingTaskset = true;
    this.tasksetService.get(tasksetId).subscribe(taskset => {
      this.taskset = taskset;
      this.loadingTaskset = false;
    }, err => {
      console.error(err);
      this.dialogService.alert(getErrorMessage(err), 'Could not load the Taskset').subscribe(() => {
        this.router.navigate(['..'], { relativeTo: this.route });
      });
    });

    this.loadingPlotinfo = true;
    this.tasksetChartService.plotInfo(tasksetId).subscribe(plotInfo => {
      this.plotInfo = plotInfo;
      this.loadingPlotinfo = false;
    });

    this.loadingCharts = true;
    let infos = this.tasksetChartService.get(tasksetId);
    for (let info of infos) {
      this.charts.push({
        info,
        datasets: [],
      });
    }
    this.graphInterval = interval(2000).subscribe(() => {
      this.loadingCharts = false;
      let infos = this.charts.map(c => c.info);
      this.tasksetChartService.set(this.taskset._id, infos);
      this.tasksetChartService.plotData(tasksetId, infos).subscribe(graphs => {
        for (let i = 0; i < graphs.length; i++) {
          let data = graphs[i];
          let chartDataSets: ChartDataSets[] = [];

          let j = 0;
          for (let curve in data) {
            let previous = this.charts[i].datasets[j];
            let color = "#" + Math.random().toString(16).slice(2, 8);
            if (previous) {
              color = previous.borderColor as string;
            }

            let avg = {};
            for (let p of data[curve]) {
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

            let final = [];
            for (let x in avg) {
              let xx = avg[x];
              final.push({ x: xx.xValue, y: (xx.yValueSum / xx.yCount) });
            }
            if (previous) {
              this.charts[i].datasets[j].data = final;
              this.charts[i].datasets[j].label = `${infos[i].curve} ${curve}`;
            } else {
              let color = "#" + Math.random().toString(16).slice(2, 8);
              let dataset: ChartDataSets = {
                data: final,
                label: `${infos[i].curve} ${curve}`,
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
      });
    });
  }

  ngOnDestroy() {
    if (this.graphInterval) this.graphInterval.unsubscribe();
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
      datasets: [],
    });
    this.tasksetChartService.set(this.taskset._id, this.charts.map(c => c.info));
  }

  removeChart(chartIdx: number) {
    this.charts.splice(chartIdx, 1);
    this.tasksetChartService.set(this.taskset._id, this.charts.map(c => c.info));
  }
}
