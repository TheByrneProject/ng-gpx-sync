import { secondsToTime } from '../pipes/s-to-t';

export class Settings {

  metric: boolean = false;
  distanceUnits: string = 'mi';
  paceUnits: string = 'min / mi';

  setMetric(metric: boolean): void {
    this.metric = metric;
    this.distanceUnits = metric ? 'km' : 'mi';
    this.paceUnits = metric ? 'min / km' : 'min / mi';
  }

  getDistance(distance: number): number {
    return this.metric ? distance / 1000.0 : distance / 1000.0 * 0.621371;
  }

  getElevation(ele: number): number {
    return this.metric ? ele : ele * 3.28084;
  }

  getPace(pace: number): number {
    return this.metric ? pace : pace / 0.621371;
  }

  // 10 min / mi     *  60 = s / mi
  getPaceDisplay(pace: number): string {
    if (pace) {
      const p: number = this.getPace(pace);
      const m = Math.floor(p);
      const s = Math.floor((p % 1) * 60.0);
      return m + ':' + (s < 10 ? '0' + s : s);
    } else {
      return '0:00';
    }
  }

  setPace(pace: number): number {
    return this.metric ? pace : pace * 0.621371;
  }
}
