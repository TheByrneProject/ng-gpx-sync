import moment, { Moment } from 'moment';
import { Coordinate } from 'ol/coordinate';

export class TrackElement {
  lon: number = 0;
  lat: number = 0;
  ele: number = 0;
  date: Moment = moment();

  static createFromElement(e: Element): TrackElement {
    let p: TrackElement = new TrackElement();
    p.lon = e.getAttribute('lon') as unknown as number;
    p.lat = e.getAttribute('lat') as unknown as number;
    p.ele = e.getElementsByTagName('ele')[0].textContent as unknown as number;
    p.date = moment(e.getElementsByTagName('time')[0].textContent);
    return p;
  }

  static createFromCoordinate(c: Coordinate): TrackElement {
    let p: TrackElement = new TrackElement();
    p.lon = c[0];
    p.lat = c[1];
    return p;
  }
}
