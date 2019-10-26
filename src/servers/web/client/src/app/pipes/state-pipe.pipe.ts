import { Pipe, PipeTransform } from '@angular/core';
import { OperationState } from '../../../../../../api/enums';

@Pipe({
  name: 'statePipe'
})
export class StatePipePipe implements PipeTransform {

  transform(value: OperationState): string {
    switch (value) {
      case OperationState.Canceled: return 'Canceled';
      case OperationState.Executing: return 'Executing';
      case OperationState.Failed: return 'Failed';
      case OperationState.Finished: return 'Finished';
      case OperationState.Pending: return 'Pending';
      case OperationState.Sent: return 'Sent';
      default: throw 'Not supported';
    }
  }

}
