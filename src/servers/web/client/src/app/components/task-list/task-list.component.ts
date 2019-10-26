import { Component, OnInit, Input } from '@angular/core';
import { SearchService } from 'lacuna-mat-table';
import { ActivatedRoute } from '@angular/router';
import { TasksService } from 'src/app/services/tasks.service';
import { ITask } from '../../../../../../../database/models/task';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss']
})
export class TaskListComponent implements OnInit {
  columnsToDisplay$: string[] = ['precedence', 'commandLine', 'startTime',
    'endTime', 'errorCount', 'state'];
  dataSource: SearchService<ITask>;
  customTitle: string = "Tasks";

  @Input() tasksetId: string;

  constructor(
    private tasksService: TasksService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    if (this.tasksetId == null) {
      throw 'No taskset defined';
    } else {
      this.dataSource = this.tasksService.dataSource(this.tasksetId);
    }
  }
}
