import { Component, OnInit } from '@angular/core';
import { LogsService } from '../../services/logs.service';
import { SearchService } from 'lacuna-mat-table';
import { ActivatedRoute } from '@angular/router';
import { IWorker } from '../../../../../../../database/models/worker';
import { WorkerService } from '../../services/worker.service';

@Component({
  selector: 'app-worker-list',
  templateUrl: './worker-list.component.html',
  styleUrls: ['./worker-list.component.scss']
})
export class WorkerListComponent implements OnInit {
  columnsToDisplay$: string[] = ['name'];
  dataSource: SearchService<IWorker>;
  customTitle: string = "Workers";

  constructor(
    private workerService: WorkerService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.dataSource = this.workerService;
  }
}
