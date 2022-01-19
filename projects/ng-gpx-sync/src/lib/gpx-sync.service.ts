import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Clipboard } from '@angular/cdk/clipboard';

import { BehaviorSubject, Subject } from 'rxjs';

import { Track } from './gpx/track';
import { AnalysisProps } from './gpx/analysis-props';
import { TrackPoint } from './gpx/track-point';
import { Undo } from './event/undo';
import { Settings } from './gpx/settings';
import { GpxEvent } from './event/gpx-event';
import { TrackElement } from './gpx/track-element';
import { ActionEvent } from './event/action-event';
import { TrackPointEvent } from './event/track-point-event';

@Injectable()
export class GpxSyncService {

  action$: BehaviorSubject<ActionEvent> = new BehaviorSubject<ActionEvent>(undefined);

  track$: BehaviorSubject<Track> = new BehaviorSubject<Track>(new Track());
  selectedPoint$: BehaviorSubject<TrackPointEvent> = new BehaviorSubject<TrackPointEvent>(new TrackPointEvent());

  analysisProps$: BehaviorSubject<AnalysisProps> = new BehaviorSubject<AnalysisProps>(new AnalysisProps());
  settings$: BehaviorSubject<Settings> = new BehaviorSubject<Settings>(new Settings());

  clickPoint$: Subject<TrackElement> = new Subject<TrackElement>();

  metric: boolean = true;

  trackId: number = 1;
  undo$: BehaviorSubject<Undo> = new BehaviorSubject<Undo>(new Undo());

  constructor(private snackBar: MatSnackBar,
              private clipboard: Clipboard) {
    let localSettings: Settings = JSON.parse(localStorage.getItem('com.thebyrneproject.ng-gpx-sync.settings'));
    if (localSettings) {
      let settings: Settings = new Settings();
      settings = Object.assign(settings, localSettings);
      this.settings$.next(settings);
    }
  }

  setClickPoint(p: TrackElement): void {
    this.clipboard.copy(JSON.stringify(p));
    this.clickPoint$.next(p);
  }

  setMetric(metric: boolean): void {
    let settings: Settings = this.settings$.getValue();
    settings.setMetric(metric);
    localStorage.setItem('com.thebyrneproject.ng-gpx-sync.settings', JSON.stringify(settings));
    this.settings$.next(settings);
  }

  setTrack(track: Track): void {
    if (!track.id) {
      let undo: Undo = this.undo$.getValue();
      undo.history = [Track.from(JSON.parse(JSON.stringify(track)) as Track), ...undo.history.slice(undo.index)];
      undo.index = 0;
      this.undo$.next(undo);
      console.info('setTrack: undo.index=' + undo.index + ', id=' + track.id);
    } else {
      track.id = this.trackId++;
    }

    this.track$.next(track);
  }

  setAnalysisProps(analysisProps: AnalysisProps): void {
    this.analysisProps$.next(analysisProps);
    let track: Track = this.track$.getValue();
    track.analyze(this.analysisProps$.getValue());
    this.track$.next(track);
  }

  undo(): void {
    let undo: Undo = this.undo$.getValue();
    if (undo.index < undo.history.length - 1) {
      undo.index++;
      console.log('undo: undo.index' + undo.index + ', id=' + undo.history[undo.index].id);
      this.track$.next(undo.history[undo.index]);
      this.selectedPoint$.next(undefined);
      this.undo$.next(undo);
    }
  }

  redo(): void {
    let undo: Undo = this.undo$.getValue();
    if (undo.index > 0) {
      undo.index--;
      this.track$.next(undo.history[undo.index]);
      this.selectedPoint$.next(undefined);
      this.undo$.next(undo);
    }
  }

  openGpx(file: File): void {
    let track: Track = new Track();
    track.fileName = file.name;
    let reader: FileReader = new FileReader();

    reader.onload = () => {
      this.parseGpx(reader.result as string, file.name);
    };

    reader.readAsText(file);
  }

  parseGpx(fileText: string, fileName: string = 'untitled.gpx'): void {
    let parser: DOMParser = new DOMParser();

    let track: Track = new Track();
    track.fileName = fileName;
    track.parseGpx(parser.parseFromString(fileText, "text/xml"));
    track.analyze(this.analysisProps$.getValue());

    if (track.droppedPoints > 0) {
      this.openSnackBar('Points were dropped due to duplicate lat/lon in succession.');
    }

    this.setTrack(track);
  }

  openSnackBar(msg: string): void {
    this.snackBar.open(msg, 'Dismiss', {
      horizontalPosition: 'end',
      verticalPosition: 'top',
      duration: 5000
    })
  }

  /**
   * Shift time starting from the point after p.
   *
   * @param p
   * @param dt Either positive or negative.
   */
  shiftTime(p1: TrackPoint, dt: number): void {
    let track: Track = this.track$.getValue();
    track.shiftTime(p1, dt);
    this.setTrack(track);
  }

  compress(newDuration: number): boolean {
    let track: Track = this.track$.getValue();
    const result: boolean = track.compress(newDuration);
    this.setTrack(track);
    return result;
  }

  updatePoint(point: TrackPoint): GpxEvent {
    let track: Track = this.track$.getValue();
    const result: GpxEvent = track.updatePoint(point);
    if (result.success) {
      this.setTrack(track);
      this.openSnackBar(result.message);
    } else {
      this.openSnackBar(result.message);
    }
    return result;
  }
}
