import { Component, OnInit, Input } from '@angular/core';
import { IWorker } from '../../../../../../../database/models/worker';

@Component({
  selector: 'app-worker-card',
  templateUrl: './worker-card.component.html',
  styleUrls: ['./worker-card.component.scss']
})
export class WorkerCardComponent implements OnInit {

  @Input() worker: IWorker;

  constructor() { }

  ngOnInit() {
  }

  public get name() {
    if (this.worker.name) {
      return `${this.worker.name} (${this.worker.status.remoteAddress})`;
    } else {
      return `${this.worker.status.remoteAddress}`;
    }
  }

}
