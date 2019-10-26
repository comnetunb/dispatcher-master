import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
    private tasksetService: TasksetService,
    private router: Router
  ) { }

  ngOnInit() {
    let tasksetId = this.route.snapshot.params['tasksetId'];
    this.loading = true;
    this.tasksetService.get(tasksetId).subscribe(taskset => {
      this.taskset = taskset;
      this.loading = false;
    });
  }

  delete() {
    this.loading = true;
    this.tasksetService.delete(this.taskset._id).subscribe(() => {
      this.loading = false;
      this.router.navigate(['..'], { relativeTo: this.route });
    });
  }

  clone() {
    this.router.navigate(['..', 'create'], {
      queryParams: {
        tasksetId: this.taskset._id,
      },
      relativeTo: this.route
    });
  }

  cancel() {
    this.loading = true;
    this.tasksetService.cancel(this.taskset._id).subscribe(ts => {
      this.taskset = ts;
      this.loading = false;
    });
  }

  export() {
    this.tasksetService.export(this.taskset._id).subscribe(data => {
      var blob = new Blob([data], { type: 'application/zip' });
      var url = window.URL.createObjectURL(blob);
      saveAs(blob, `${this.taskset.name}.zip`);
      window.open(url);
    }, err => {
      console.error(err);
    });
  }

}
