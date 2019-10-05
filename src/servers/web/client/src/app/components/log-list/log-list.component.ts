import { Component, OnInit } from '@angular/core';
import { ILog } from '../../../../../../../database/models/log';
import { LogsService } from 'src/app/services/logs.service';
import { SearchService } from 'lacuna-mat-table';

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
    private logsService: LogsService
  ) { }

  ngOnInit() {
    this.dataSource = this.logsService;
  }
}
