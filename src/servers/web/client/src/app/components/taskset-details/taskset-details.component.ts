import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { ITaskSet } from '../../../../../../../database/models/taskSet';
import { TasksetService } from 'src/app/services/taskset.service';
import { DialogService } from 'src/app/services/dialog.service';
import { getErrorMessage } from 'src/app/classes/utils';
import { LacunaMaterialTableComponent } from 'lacuna-mat-table';
import { ITask } from '../../../../../../../database/models/task';
import { TaskListComponent } from '../task-list/task-list.component';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-taskset-details',
  templateUrl: './taskset-details.component.html',
  styleUrls: ['./taskset-details.component.scss'],
})
export class TasksetDetailsComponent implements OnInit, OnDestroy {
  $toUnsubscribe: Subscription[] = [];
  taskset: ITaskSet;
  tasksetId: string;
  loading: boolean = false;

  constructor(
    public route: ActivatedRoute,
    private tasksetService: TasksetService,
    private router: Router,
    private dialogService: DialogService
  ) {}

  ngOnDestroy() {
    for (let sub of this.$toUnsubscribe) {
      sub.unsubscribe();
    }
  }

  ngOnInit() {
    this.tasksetId = this.route.snapshot.params['tasksetId'];
    this.loadTaskset();

    this.$toUnsubscribe.push(
      this.router.events
        .pipe(
          filter(
            (event) =>
              event instanceof NavigationEnd &&
              event.url.endsWith(this.tasksetId)
          )
        )
        .subscribe(() => {
          this.refresh();
        })
    );
  }

  @ViewChild(TaskListComponent, { static: false }) taskList: TaskListComponent;

  loadTaskset() {
    this.loading = true;
    this.tasksetService.get(this.tasksetId).subscribe(
      (taskset) => {
        this.taskset = taskset;
        this.loading = false;
      },
      (err) => {
        console.error(err);
        this.dialogService
          .alert(getErrorMessage(err), 'Could not load the Taskset')
          .subscribe(() => {
            this.router.navigate(['..'], { relativeTo: this.route });
          });
      }
    );
  }

  cancel() {
    this.dialogService
      .confirm(
        'Are you sure you want to delete this task set? This action is irreversible!',
        'Delete task set?'
      )
      .subscribe((confirm) => {
        if (!confirm) return;
        this.loading = true;
        this.tasksetService.cancel(this.taskset._id).subscribe(
          (ts) => {
            this.taskset = ts;
            this.loading = false;
          },
          (err) => {
            console.error(err);
            this.dialogService.alert(
              getErrorMessage(err),
              'Could not cancel the Taskset'
            );
          }
        );
      });
  }

  delete() {
    this.dialogService
      .confirm(
        'Are you sure you want to delete this task set? This action is irreversible!',
        'Delete task set?'
      )
      .subscribe((confirm) => {
        if (!confirm) return;
        this.loading = true;
        this.tasksetService.delete(this.taskset._id).subscribe(
          () => {
            this.loading = false;
            this.router.navigate(['..'], { relativeTo: this.route });
          },
          (err) => {
            console.error(err);
            this.dialogService.alert(
              getErrorMessage(err),
              'Could not delete the Taskset'
            );
          }
        );
      });
  }

  restart() {
    this.dialogService
      .confirm(
        'Are you sure you want to restart this task set? This action is irreversible!',
        'Restart task set?'
      )
      .subscribe((confirm) => {
        if (!confirm) return;
        this.loading = true;
        this.tasksetService.restart(this.taskset._id).subscribe(
          () => {
            this.loading = false;
            this.loadTaskset();
            this.taskList.refresh();
          },
          (err) => {
            console.error(err);
            this.dialogService.alert(
              getErrorMessage(err),
              'Could not restart the Taskset'
            );
          }
        );
      });
  }

  refresh() {
    this.loadTaskset();
    this.taskList.refresh();
  }

  clone() {
    this.router.navigate(['..', 'create'], {
      queryParams: {
        tasksetId: this.taskset._id,
      },
      relativeTo: this.route,
    });
  }

  graphs() {
    this.router.navigate(['graphs'], { relativeTo: this.route });
  }

  edit() {
    this.router.navigate(['edit'], { relativeTo: this.route });
  }

  export() {
    this.loading = true;
    this.tasksetService.export(this.taskset._id).subscribe(
      (data) => {
        var file = new File([data], `${this.taskset.name}.zip`, {
          type: 'application/zip',
        });
        saveAs(file);
        this.loading = false;
      },
      (err) => {
        console.error(err);
        this.dialogService
          .alert(getErrorMessage(err), 'Could not export the Taskset')
          .subscribe(() => {
            this.router.navigate(['..'], { relativeTo: this.route });
          });
      }
    );
  }
}
