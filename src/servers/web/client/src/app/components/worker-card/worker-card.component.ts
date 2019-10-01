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
    console.log(this.worker);
    if (this.worker.alias) {
      return `${this.worker.alias} (${this.worker.address})`;
    } else {
      return `${this.worker.address}`;
    }
  }

}
