import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { ITaskSet } from '../../../../../../../database/models/taskSet';
import { SearchService } from 'lacuna-mat-table';
import { TasksetService } from '../../services/taskset.service';
import { OperationState } from '../../../../../../../api/enums';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-taskset-list',
  templateUrl: './taskset-list.component.html',
  styleUrls: ['./taskset-list.component.scss']
})
export class TasksetListComponent implements OnInit, OnDestroy {
  private $toUnsubscribe: Subscription[] = [];
  columnsToDisplay$: string[] = ['name', 'startTime', 'endTime', 'finishedTasks'];
  dataSource: SearchService<ITaskSet>;

  @Input() customTitle: string;
  @Input() tasksetState: Observable<OperationState>;

  constructor(
    private tasksetService: TasksetService
  ) { }

  ngOnInit() {
    this.tasksetState.subscribe(s => {
      this.dataSource = this.tasksetService.dataSource(s);

      switch (s) {
        case OperationState.Executing:
          this.customTitle = 'Running Tasksets';
          break;
        case OperationState.Finished:
          this.customTitle = 'Finished Tasksets';
          break;
        case OperationState.Canceled:
          this.customTitle = 'Canceled Tasksets';
          break;
        default:
          this.customTitle = 'All Tasksets';
      }
    })
  }

  ngOnDestroy() {
    for (let s of this.$toUnsubscribe) {
      s.unsubscribe();
    }
  }
}
