import { Pipe, PipeTransform } from '@angular/core';
import { WorkerStatus } from '../../../../../../database/models/worker';

@Pipe({
  name: 'workerStatus'
})
export class WorkerStatusPipe implements PipeTransform {


  transform(value: WorkerStatus): string {
    if (value.online) {
      return `Online (${value.remoteAddress})`;
    }

    return 'Offline';
  }

}
