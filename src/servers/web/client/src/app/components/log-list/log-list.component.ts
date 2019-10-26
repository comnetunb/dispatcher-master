import { Component, OnInit } from '@angular/core';
import { ILog } from '../../../../../../../database/models/log';
import { LogsService } from '../../services/logs.service';
import { SearchService } from 'lacuna-mat-table';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-log-list',
  templateUrl: './log-list.component.html',
  styleUrls: ['./log-list.component.scss']
})
export class LogListComponent implements OnInit {
  columnsToDisplay$: string[] = ['date', 'level', 'message'];
  dataSource: SearchService<ILog>;
  customTitle: string = "Logs";

  constructor(
    private logsService: LogsService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    const tasksetId = this.route.snapshot.params['tasksetId'];

    if (tasksetId == null) {
      this.dataSource = this.logsService;
    } else {
      this.dataSource = this.logsService.sourceFromTaskset(tasksetId);
    }
  }
}
