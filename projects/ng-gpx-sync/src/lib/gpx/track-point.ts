import Point from 'ol/geom/Point';
import moment, { Moment } from 'moment';

export class TrackPoint {
  id: number = 0;
  lon: number = 0;
  lat: number = 0;
  point: Point = new Point([]);
  date: Moment = moment();
  t: number = 0;
  ele: number = 0;
  dx: number = 0;
  dt: number = 0;
  v: number = 0;
}
