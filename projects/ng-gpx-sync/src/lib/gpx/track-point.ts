import Point from 'ol/geom/Point';
import { TrackElement } from './track-element';

export class TrackPoint extends TrackElement {
  id: number = 0;
  point: Point = new Point([]);
  t: number = 0;
  dx: number = 0;
  dt: number = 0;
  v: number = 0;

  static createFromTrackElement(e: TrackElement, i: number): TrackPoint {
    let p: TrackPoint = new TrackPoint();

    p.id = i;
    p.lon = e.lon;
    p.lat = e.lat;
    p.ele = e.ele;
    p.date = e.date;
    p.point = new Point([p.lon, p.lat]);
    return p;
  }
}
