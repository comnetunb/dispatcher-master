import { Pipe, PipeTransform } from '@angular/core';
import { Result } from '../../../../../../api/enums';

@Pipe({
  name: 'resultPipe'
})
export class ResultPipePipe implements PipeTransform {

  transform(value: Result): string {
    switch (value) {
      case Result.Error: return 'Error';
      case Result.Neutral: return 'Neutral';
      case Result.Warning: return 'Warning';
      case Result.Success: return 'Success';
      default: throw 'Not supported';
    }
  }

}
