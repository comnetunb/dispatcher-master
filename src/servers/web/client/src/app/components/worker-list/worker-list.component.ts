import { Component, OnInit } from '@angular/core';
import { SearchService } from 'lacuna-mat-table';
import { ActivatedRoute } from '@angular/router';
import { IWorker } from '../../../../../../../database/models/worker';
import { WorkerService } from '../../services/worker.service';
import { DialogService } from '../../services/dialog.service';
import { SettingsService } from 'src/app/services/settings.service';

@Component({
  selector: 'app-worker-list',
  templateUrl: './worker-list.component.html',
  styleUrls: ['./worker-list.component.scss'],
})
export class WorkerListComponent implements OnInit {
  columnsToDisplay$: string[] = ['name', 'status', 'tasks', 'config'];
  dataSource: SearchService<IWorker>;
  workerApiPort: number;
  customTitle = 'Workers';

  constructor(
    private workerService: WorkerService,
    private dialogService: DialogService,
    private settingsService: SettingsService
  ) {}

  ngOnInit() {
    this.dataSource = this.workerService;

    this.settingsService.getServer().subscribe((config) => {
      this.workerApiPort = config.workerApiPort;
    });
  }

  downloadConfigFile(row: IWorker) {
    const sub = this.dialogService
      .configFile(row._id, this.workerApiPort)
      .subscribe(() => {
        sub.unsubscribe();
      });
  }
}
