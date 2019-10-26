import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ITaskSet } from '../../../../../../../database/models/taskSet';
import { TasksetService } from 'src/app/services/taskset.service';

@Component({
  selector: 'app-taskset-details',
  templateUrl: './taskset-details.component.html',
  styleUrls: ['./taskset-details.component.scss']
})
export class TasksetDetailsComponent implements OnInit {

  taskset: ITaskSet;
  loading: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private tasksetService: TasksetService
  ) { }

  ngOnInit() {
    let tasksetId = this.route.snapshot.params['tasksetId'];

    this.tasksetService.get(tasksetId).subscribe(taskset => {
      this.taskset = taskset;
    });
  }

}
