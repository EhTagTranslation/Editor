import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'mark',
  pure: true,
})
export class MarkPipe implements PipeTransform {

  transform(value: any, arg: string): any {
    if (!arg) {
      return value;
    }
    value = value.toString();
    const r = arg.replace(/([\*\.\(\[\\\?\+\|\{])/g, '\\$1');
    return value.replace(new RegExp('(' + r + ')', 'g'), '<mark>$1</mark>');
  }

}
