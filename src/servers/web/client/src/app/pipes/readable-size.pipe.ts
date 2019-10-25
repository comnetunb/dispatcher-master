import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'readableSize'
})
export class ReadableSizePipe implements PipeTransform {

  KB: number = 1024;
  MB: number = this.KB * 1024;
  GB: number = this.MB * 1024;
  TB: number = this.GB * 1024;
  PB: number = this.TB * 1024;

  transform(value: number): any {
    if (value >= this.PB) {
      let qty = (value / this.PB).toFixed(2);
      return `${qty} PB`
    } else if (value >= this.TB) {
      let qty = (value / this.TB).toFixed(2);
      return `${qty} TB`
    } else if (value >= this.GB) {
      let qty = (value / this.GB).toFixed(2);
      return `${qty} GB`
    } else if (value >= this.MB) {
      let qty = (value / this.MB).toFixed(2);
      return `${qty} MB`
    } else if (value >= this.KB) {
      let qty = (value / this.KB).toFixed(2);
      return `${qty} KB`
    } else {
      return `${value} B`;
    }
  }
}
