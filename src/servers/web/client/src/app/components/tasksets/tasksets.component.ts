import { Component, OnInit } from '@angular/core';
import { OperationState } from '../../../../../../../api/enums';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

@Component({
  selector: 'app-tasksets',
  templateUrl: './tasksets.component.html',
  styleUrls: ['./tasksets.component.scss']
})
export class TasksetsComponent implements OnInit {
  private tasksetStateSubject: BehaviorSubject<OperationState>;
  public tasksetState: Observable<OperationState>;

  constructor(
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.tasksetStateSubject = new BehaviorSubject<OperationState>(null);
    this.tasksetState = this.tasksetStateSubject.asObservable();
  }

  all() {
    this.tasksetStateSubject.next(null);
  }

  executing() {
    this.tasksetStateSubject.next(OperationState.Executing);
  }

  finished() {
    this.tasksetStateSubject.next(OperationState.Finished);
  }

  canceled() {
    this.tasksetStateSubject.next(OperationState.Canceled);
  }
}
