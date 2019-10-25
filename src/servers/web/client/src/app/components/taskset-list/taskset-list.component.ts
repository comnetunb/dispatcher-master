import { Component, OnInit, Input } from '@angular/core';
import { ITaskSet } from '../../../../../../../database/models/taskSet';
import { SearchService } from 'lacuna-mat-table';
import { TasksetService } from '../../services/taskset.service';
import { OperationState } from '../../../../../../../api/enums';

@Component({
  selector: 'app-taskset-list',
  templateUrl: './taskset-list.component.html',
  styleUrls: ['./taskset-list.component.scss']
})
export class TasksetListComponent implements OnInit {

  columnsToDisplay$: string[] = ['name', 'startTime', 'endTime', 'remainingTasksCount'];
  dataSource: SearchService<ITaskSet>;

  @Input() customTitle: string;
  @Input() tasksetState: OperationState;

  constructor(
    private tasksetService: TasksetService
  ) { }

  ngOnInit() {
    this.dataSource = this.tasksetService.dataSource(this.tasksetState);
  }
}
