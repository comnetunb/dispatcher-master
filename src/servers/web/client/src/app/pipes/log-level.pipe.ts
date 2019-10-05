import { Pipe, PipeTransform } from '@angular/core';
import { LogLevel } from '../../../../../../api/enums';

@Pipe({
  name: 'logLevel'
})
export class LogLevelPipe implements PipeTransform {

  transform(value: LogLevel): string {
    switch (value) {
      case LogLevel.Debug:
        return 'Debug';
      case LogLevel.Error:
        return 'Error';
      case LogLevel.Warn:
        return 'Warning';
      case LogLevel.Fatal:
        return 'Fatal';
      case LogLevel.Info:
        return 'Info';
      case LogLevel.Trace:
        return 'Trace';
      default:
        throw 'Unsupported LogLevel in LogLevelPipe';
    }
  }
}
