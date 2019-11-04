import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { SearchService, LacunaMaterialTableComponent } from 'lacuna-mat-table';
import { ActivatedRoute } from '@angular/router';
import { TasksService } from 'src/app/services/tasks.service';
import { ITask } from '../../../../../../../database/models/task';
import { OperationState } from '../../../../../../../api/enums';
import { DialogService } from '../../services/dialog.service';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss']
})
export class TaskListComponent implements OnInit {
  columnsToDisplay$: string[] = ['precedence', 'commandLine', 'startTime',
    'endTime', 'errorCount', 'state', 'actions'];
  dataSource: SearchService<ITask>;
  customTitle: string = "Tasks";

  PendingState = OperationState.Pending;
  FinishedState = OperationState.Finished;

  @ViewChild(LacunaMaterialTableComponent, { static: false }) lacTable: LacunaMaterialTableComponent<ITask>;

  @Input() tasksetId: string;

  constructor(
    private tasksService: TasksService,
    private route: ActivatedRoute,
    private dialogService: DialogService
  ) { }

  ngOnInit() {
    if (this.tasksetId == null) {
      throw 'No taskset defined';
    } else {
      this.dataSource = this.tasksService.dataSource(this.tasksetId);
    }
  }

  discard(task: ITask) {
    this.dialogService.confirm(
      'Are you sure you want to discard the results of this task? This change is irreversible!',
      'Discard task?')
      .subscribe(confirm => {
        if (!confirm) return;

        this.tasksService.discard(task._id).subscribe(() => {
          this.lacTable.refresh();
        }, err => {
          this.dialogService.alert(err, 'Could not discard task');
        });
      });
  }

  cancel(task: ITask) {
    this.dialogService.confirm(
      'Are you sure you want to cancel the results of this task? This change is irreversible!',
      'Discard task?')
      .subscribe(confirm => {
        if (!confirm) return;

        this.tasksService.cancel(task._id).subscribe(() => {
          this.lacTable.refresh();
        }, err => {
          this.dialogService.alert(err, 'Could not cancel task');
        });
      });
  }
}
