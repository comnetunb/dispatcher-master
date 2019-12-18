import { Component, OnInit } from '@angular/core';
import { LogsService } from '../../services/logs.service';
import { SearchService } from 'lacuna-mat-table';
import { ActivatedRoute } from '@angular/router';
import { IWorker } from '../../../../../../../database/models/worker';
import { WorkerService } from '../../services/worker.service';
import { DialogService } from '../../services/dialog.service';

@Component({
  selector: 'app-worker-list',
  templateUrl: './worker-list.component.html',
  styleUrls: ['./worker-list.component.scss']
})
export class WorkerListComponent implements OnInit {
  columnsToDisplay$: string[] = ['name', 'status', 'tasks', 'config'];
  dataSource: SearchService<IWorker>;
  customTitle: string = "Workers";

  constructor(
    private workerService: WorkerService,
    private dialogService: DialogService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.dataSource = this.workerService;
  }

  downloadConfigFile(row: IWorker) {
    let sub = this.dialogService.configFile(row._id).subscribe(() => { sub.unsubscribe(); });
  }
}
