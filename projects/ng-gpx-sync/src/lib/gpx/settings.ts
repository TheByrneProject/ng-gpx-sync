import { secondsToTime } from '../pipes/s-to-t';

export class Settings {

  metric: boolean = false;
  distanceUnits: string = 'mi';
  shortDistanceUnits: string = 'ft';
  paceUnits: string = 'min / mi';
  eleUnits: string = 'ft';

  setMetric(metric: boolean): void {
    this.metric = metric;
    this.distanceUnits = metric ? 'km' : 'mi';
    this.shortDistanceUnits = metric ? 'm' : 'ft';
    this.paceUnits = metric ? 'min / km' : 'min / mi';
    this.eleUnits = metric ? 'm' : 'ft';
  }

  getDistance(distance: number): number {
    return this.metric ? distance / 1000.0 : distance / 1000.0 * 0.621371;
  }

  getShortDistance(distance: number): number {
    return this.metric ? distance : distance * 3.28084;
  }

  getShortDistanceDisplay(distance: number): string {
    return this.getShortDistance(distance).toFixed(2);
  }

  getElevation(ele: number): number {
    return this.metric ? ele : ele * 3.28084;
  }

  getElevationAsString(ele: number): string {
    return this.getElevation(ele).toFixed(1);
  }

  setElevation(ele: number): number {
    return this.metric ? ele : ele / 3.28084;
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
