import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'stot', pure: true})
export class SecondsToTime implements PipeTransform {

  transform(value: number, format: string = 'hhmmss'): string {
    return secondsToTime(value, format);
  }
}

export function secondsToTime(value: number, format: string = 'hhmmss'): string {
  let h = Math.floor(value / 3600.0);
  let hr = value % 3600;
  const m = Math.floor(hr / 60.0);
  const s = hr % 60;
  if (format === 'hhmmss') {
    return h + ':' + (m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s);
  } else {
    return m + ':' + (s < 10 ? '0' + s : s);
  }
};
