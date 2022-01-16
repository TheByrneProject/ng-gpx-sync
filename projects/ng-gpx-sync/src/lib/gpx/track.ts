
import Point from 'ol/geom/Point';
import { TrackPoint } from './track-point';
import { Moment } from 'moment';
import moment from 'moment';
import { AnalysisProps } from './analysis-props';
import { secondsToTime } from '../pipes/s-to-t';

export class Track {

  fileName: string = 'untitled.gpx';
  name: string = 'untitled';
  eleGain: number = 0;
  eleLoss: number = 0;
  duration: number = 0;
  durationDisplay: string = '00:00';
  distance: number = 0;
  track: TrackPoint[] = [];

  EARTH_RADIUS_IN_METERS = 6371000;
  toRad: (value: number) => number = (value: number) => value * Math.PI / 180;

  // Analysis
  slowPoints: TrackPoint[] = [];

  analyze(props: AnalysisProps): void {
    for (let p of this.track) {
      if (p.v > props.slowLimit) {
        this.slowPoints.push(p);
      }
    }

    this.slowPoints.sort((a: TrackPoint, b: TrackPoint) => {
      return b.v - a.v;
    });
  }

  parseGpx(gpx: Document): void {
    this.track = [];

    try {
      this.name = gpx.getElementsByTagName('trk')[0].getElementsByTagName('name')[0].textContent as string;
    } catch (error) {}

    let trkSeg = gpx.getElementsByTagName('trkseg');
    let child = trkSeg[0].children[0];
    let lon: number = child.getAttribute('lon') as unknown as number;
    let lat: number = child.getAttribute('lat') as unknown as number;
    let nextLon: number;
    let nextLat: number;
    let ele: number;
    let nextEle: number;
    let eleDiff: number;
    let distance: number;
    let time: Moment;
    let nextTime: Moment;

    this.eleGain = 0;
    this.eleLoss = 0;
    this.distance = 0;

    let p1: TrackPoint = new TrackPoint();

    for (let i = 1; i < trkSeg[0].children.length; i++) {
      let trkPt = trkSeg[0].children.item(i - 1);
      let nextPt = trkSeg[0].children.item(i);
      if (!trkPt || !nextPt) {
        break;
      }

      lon = trkPt.getAttribute('lon') as unknown as number;
      lat = trkPt.getAttribute('lat') as unknown as number;
      ele = trkPt.getElementsByTagName('ele')[0].textContent as unknown as number;
      time = moment(trkPt.getElementsByTagName('time')[0].textContent);
      nextLon = nextPt.getAttribute('lon') as unknown as number;
      nextLat = nextPt.getAttribute('lat') as unknown as number;
      nextEle = nextPt.getElementsByTagName('ele')[0].textContent as unknown as number;
      nextTime = moment(nextPt.getElementsByTagName('time')[0].textContent);

      eleDiff = nextEle - ele;
      if (eleDiff > 0) {
        this.eleGain += eleDiff;
      } else if (eleDiff < 0) {
        this.eleLoss += eleDiff;
      }
      distance = this.calculateDistance(lon, lat, nextLon, nextLat);
      this.distance += distance;

      if (i === 1) {
        p1 = {
          id: 0,
          lon: lon,
          lat: lat,
          ele: ele,
          date: time,
          t: 0,
          dx: 0,
          dt: 0,
          v: 0,
          point: new Point([lon, lat])
        };
        this.track.push(p1);
      }
      this.track.push({
        id: i,
        lon: nextLon,
        lat: nextLat,
        ele: nextEle,
        date: nextTime,
        t: nextTime.diff(p1.date, 's'),
        dx: distance,
        dt: nextTime.diff(time, 's'),
        v: (nextTime.diff(time, 's') / 60.0) * (1.0 / distance) * (1.0 / 0.000621371),
        point: new Point([nextLon, nextLat])
      });
    }

    const p2: TrackPoint = this.track[this.track.length - 1];
    const dt: number = p2.date.diff(p1.date, 's');
    this.duration = dt;
    this.durationDisplay = secondsToTime(dt, dt > 3600 ? 'hhmmss' : 'mmss');
    console.log(`Track: distance=${this.distance}, gain=${this.eleGain}, loss=${this.eleLoss}, v=${(dt / 60.0) * (1.0 / this.distance) * (1.0 / 0.000621371)}`)
  }

  writeGpx(): Document {
    let gpxFile: Document = document.implementation.createDocument(null, null, null);

    let gpx: Element = gpxFile.createElement('gpx');
    gpx.setAttribute('xmlns', 'http://www.topografix.com/GPX/1/1');
    gpx.setAttribute('xmlns:gpxx', 'http://www.garmin.com/xmlschemas/GpxExtensions/v3');
    gpx.setAttribute('creator', 'TheByrneProject');
    gpx.setAttribute('version', '1.1');

    let trk: Element = gpxFile.createElement('trk');

    let trkseg: Element = gpxFile.createElement('trkseg');

    for (let p of this.track) {
      let trkpt: Element = gpxFile.createElement('trkpt');
      let ele: Element = gpxFile.createElement('ele');
      let time: Element = gpxFile.createElement('time');

      trkpt.setAttribute('lat', p.lat.toString());
      trkpt.setAttribute('lon', p.lon.toString());
      ele.textContent = p.ele.toString();
      time.textContent = p.date.format('YYYY-MM-DD[T]kk:mm:ss[Z]')

      trkpt.appendChild(ele);
      trkpt.appendChild(time);
      trkseg.appendChild(trkpt);
    }

    trk.appendChild(trkseg);

    gpx.appendChild(trk);
    gpxFile.appendChild(gpx);
    return gpxFile;
  }

  calculateDistance(lon1: number, lat1: number, lon2: number, lat2: number): number {
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);

    const startLat = this.toRad(lat1);
    const endLat = this.toRad(lat2);

    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(startLat) * Math.cos(endLat);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return this.EARTH_RADIUS_IN_METERS * c;
  };
}
