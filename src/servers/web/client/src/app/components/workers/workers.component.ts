import { Component, OnInit } from '@angular/core';
import { Subscription, interval } from 'rxjs';
import { WorkerService } from '../../services/worker.service';
import { IWorker } from '../../../../../../../database/models/worker';

@Component({
  selector: 'app-workers',
  templateUrl: './workers.component.html',
  styleUrls: ['./workers.component.scss']
})
export class WorkersComponent implements OnInit {
  private $toUnsubscribe: Subscription[] = [];

  workers: IWorker[] = [];
  loading: boolean = false;

  constructor(
    private workerService: WorkerService
  ) { }

  ngOnInit() {
    this.loading = true;
    this.workerService.listOnline().subscribe((workers) => {
      this.workers = workers;
      this.loading = false;
    });

    this.$toUnsubscribe.push(
      interval(3000).subscribe(() => {
        this.workerService.listOnline().subscribe((workers) => {
          this.workers = workers;
        });
      })
    );
  }

  ngOnDestroy() {
    for (let s in this.$toUnsubscribe) {
      this.$toUnsubscribe[s].unsubscribe();
    }
  }
}
