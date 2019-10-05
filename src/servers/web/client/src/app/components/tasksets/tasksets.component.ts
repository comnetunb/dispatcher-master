import { Component, OnInit } from '@angular/core';
import { OperationState } from '../../../../../../../api/enums';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-tasksets',
  templateUrl: './tasksets.component.html',
  styleUrls: ['./tasksets.component.scss']
})
export class TasksetsComponent implements OnInit {
  tasksetState: OperationState;
  customTitle: string;

  constructor(
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.tasksetState = this.route.snapshot.data['tasksetState'];
    this.customTitle = this.getTableTitle(this.tasksetState);
  }

  getTableTitle(state: OperationState) {
    switch (state) {
      case OperationState.Executing:
        return 'TaskSets being executed';
      case OperationState.Finished:
        return 'Finished TaskSets';
      case OperationState.Canceled:
        return 'TaskSets that were canceled';
      default:
        return 'TaskSets';
    }
  }
}
