import { Pipe, PipeTransform } from '@angular/core';
import { TaskSetPriority } from '../../../../../../api/enums';

@Pipe({
  name: 'priority'
})
export class PriorityPipe implements PipeTransform {


  transform(value: TaskSetPriority): string {
    switch (value) {
      case TaskSetPriority.Minimum: return 'Minimum';
      case TaskSetPriority.Low: return 'Low';
      case TaskSetPriority.Normal: return 'Normal';
      case TaskSetPriority.High: return 'High';
      case TaskSetPriority.Urgent: return 'Urgent';
      default: throw 'Not supported';
    }
  }

}
