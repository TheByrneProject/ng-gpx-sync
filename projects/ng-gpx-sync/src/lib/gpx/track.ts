
import Point from 'ol/geom/Point';
import { TrackPoint } from './track-point';
import { AnalysisProps } from './analysis-props';
import { secondsToTime } from '../pipes/s-to-t';
import { calcDistance, calcPace } from './calc';
import { TrackElement } from './track-element';
import { GpxEvent } from '../event/gpx-event';

export class Track {

  track: TrackPoint[] = [];

  id: number = 0;
  fileName: string = 'untitled.gpx';
  name: string = 'untitled';
  eleGain: number = 0;
  eleLoss: number = 0;
  duration: number = 0;
  durationDisplay: string = '00:00';
  distance: number = 0;
  v: number = 0;

  timeFormat: string = 'mm:ss';

  slowPoints: TrackPoint[] = [];

  droppedPoints: number = 0;

  static from(old: Track): Track {
    let track: Track = new Track();
    track = Object.assign(track, old);
    for (let i = 0; i < old.track.length; i++) {
      track.track[i] = Object.assign(new TrackPoint(), old.track[i]);
      track.track[i].point = Object.assign(new Point([0, 0]), old.track[i].point);
    }
    return track;
  }

  analyze(props: AnalysisProps): void {
    this.slowPoints = [];

    for (let p of this.track) {
      if (p.v > props.slowThreshold) {
        this.slowPoints.push(p);
      }
    }

    this.slowPoints.sort((a: TrackPoint, b: TrackPoint) => {
      return b.v - a.v;
    });
  }

  parseGpx(gpx: Document): void {
    this.droppedPoints = 0;
    this.track = [];

    try {
      this.name = gpx.getElementsByTagName('trk')[0].getElementsByTagName('name')[0].textContent as string;
    } catch (error) {}

    let trkSeg = gpx.getElementsByTagName('trkseg');
    let e1: TrackElement;
    let e2: TrackElement;

    let startPoint: TrackPoint = new TrackPoint();

    for (let i = 0; i < trkSeg[0].children.length - 2; i++) {
      let trkPt = trkSeg[0].children.item(i);
      let nextPt = trkSeg[0].children.item(i + 1);
      if (!trkPt || !nextPt) {
        break;
      }

      e1 = TrackElement.createFromElement(trkPt);
      e2 = TrackElement.createFromElement(nextPt);

      while (e1.lon === e2.lon && e1.lat === e2.lat && i < trkSeg[0].children.length - 1) {
        this.droppedPoints++;
        i++;
        e2 = TrackElement.createFromElement(trkSeg[0].children.item(i + 1));
      }
      if (e1.lon === e2.lon && e1.lat === e2.lat) {
        this.droppedPoints++;
        break;
      }

      this.track.push(TrackPoint.createFromTrackElement(e1, i));
      if (i === 0) {
        startPoint = this.track[0];
      }
    }

    // Last Point
    e1 = TrackElement.createFromElement(trkSeg[0].children.item(trkSeg[0].children.length - 1));
    this.track.push(TrackPoint.createFromTrackElement(e1, trkSeg[0].children.length - 1));

    this.calcTrack();
  }

  /**
   * With the date, lat, lon and ele set, do the basic calculations per track point.
   */
  calcTrack(): void {
    let p0: TrackPoint = this.track[0];
    let p1: TrackPoint;
    let p2: TrackPoint;
    let dx: number;
    let dt: number;
    let de: number;

    this.eleGain = 0;
    this.eleLoss = 0;
    this.distance = 0;

    for (let i = 0; i < this.track.length - 2; i++) {
      p1 = this.track[i];
      p2 = this.track[i + 1];

      de = p2.ele - p1.ele;
      if (de > 0) {
        this.eleGain += de;
      } else if (de < 0) {
        this.eleLoss += de;
      }
      dx = calcDistance(p1.lon, p1.lat, p2.lon, p2.lat);
      this.distance += dx;
      dt = p2.date.diff(p1.date, 's');

      p1.t = i === 0 ? 0 : p1.date.diff(p0.date, 's');
      p1.dx = dx;
      p1.dt = dt;
      p1.v = calcPace(dt, dx);
    }

    // The last point of the track has a zero delta for time and distance.
    this.track[this.track.length - 1].t = this.track[this.track.length - 1].date.diff(p0.date, 's')

    this.setDuration(this.track[this.track.length - 1].date.diff(p0.date, 's'));
  }

  writeGpx(): Document {
    let gpxFile: Document = document.implementation.createDocument(null, null, null);

    let gpx: Element = gpxFile.createElement('gpx');
    gpx.setAttribute('xmlns', 'http://www.topografix.com/GPX/1/1');
    gpx.setAttribute('xmlns:gpxx', 'http://www.garmin.com/xmlschemas/GpxExtensions/v3');
    gpx.setAttribute('creator', 'thebyrneproject.com');
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

  setDuration(duration: number): void {
    this.duration = duration;
    this.timeFormat = this.duration > 3600 ? 'hhmmss' : 'mmss';
    this.durationDisplay = secondsToTime(this.duration, this.timeFormat);
    this.v = (this.duration / 60.0) * (1.0 / this.distance) * 1000.0;
  }

  getPrevious(p: TrackPoint): TrackPoint {
    const i: number = this.track.findIndex((e: TrackPoint) => e.id === p.id);
    return i === 0 ? undefined : this.track[i - 1];
  }

  getNext(p: TrackPoint): TrackPoint {
    const i: number = this.track.findIndex((e: TrackPoint) => e.id === p.id);
    return i === this.track.length - 1 ? undefined : this.track[i + 1];
  }

  /**
   * Shift time starting from the point after p.
   *
   * @param p
   * @param dt Either positive or negative.
   */
  shiftTime(p1: TrackPoint, dt: number): void {
    let process: boolean = false;

    this.setDuration(this.duration += dt);

    for (let i = 0; i < this.track.length; i++) {
      if (process) {
        this.track[i].t += dt;
        this.track[i].date = this.track[i].date.add(dt, 's');
      } else if (p1.id === this.track[i].id) {
        process = true;
        this.track[i].dt += dt;
        this.track[i].v = calcPace(this.track[i].dt, this.track[i].dx);
      }
    }
  }

  compress(newDuration: number): boolean {
    if (this.duration < newDuration) {
      return false;
    }

    let p: TrackPoint;

    while (newDuration < this.duration) {
      p = undefined;
      for (let i = 0; i < this.track.length - 1; i++) {
        if (this.track[i].dt === 1) {
          continue;
        }
        if (!p) {
          p = this.track[i];
        } else if (p.v < this.track[i].v) {
          p = this.track[i];
        }
      }
      this.shiftTime(p, -1);
    }

    return true;
  }

  updatePoint(u: TrackPoint): GpxEvent {
    try {
      let p: TrackPoint = this.track.find((o: TrackPoint) => o.id === u.id);
      p.lat = u.lat;
      p.lon = u.lon;
      p.ele = u.ele;
      p.point = new Point([u.lon, u.lat]);
      this.calcTrack();
    } catch (error) {
      return GpxEvent.createEvent('Update Point failed', false, error);
    }

    return GpxEvent.createEvent(`Updated point id=${u.id} at time=${u.t}`);
  }
}
