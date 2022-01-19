import { TrackPoint } from '../gpx/track-point';

export class TrackPointEvent {

  p: TrackPoint;
  source: string;

  constructor(p: TrackPoint = undefined, source: string = '') {
    this.p = p;
    this.source = source;
  }
}
