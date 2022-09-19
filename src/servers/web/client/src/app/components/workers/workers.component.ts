import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription, interval } from 'rxjs';
import { WorkerService } from '../../services/worker.service';
import { IWorker } from '../../../../../../../database/models/worker';
import { ActivatedRoute } from '@angular/router';
import { SettingsService } from 'src/app/services/settings.service';

@Component({
  selector: 'app-workers',
  templateUrl: './workers.component.html',
  styleUrls: ['./workers.component.scss'],
})
export class WorkersComponent implements OnInit, OnDestroy {
  private $toUnsubscribe: Subscription[] = [];

  workers: IWorker[] = [];
  loading = false;

  constructor(
    private workerService: WorkerService,
    public route: ActivatedRoute
  ) {}

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
    for (const s of this.$toUnsubscribe) {
      s.unsubscribe();
    }
  }
}
