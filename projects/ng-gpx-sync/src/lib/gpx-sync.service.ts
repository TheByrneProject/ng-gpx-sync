import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

import { BehaviorSubject, Subject } from 'rxjs';

import { Track } from './gpx/track';
import { AnalysisProps } from './gpx/analysis-props';
import { TrackPoint } from './gpx/track-point';
import { Undo } from './events/undo';
import { Settings } from './gpx/settings';

@Injectable()
export class GpxSyncService {

  track$: BehaviorSubject<Track> = new BehaviorSubject<Track>(new Track());
  selectedPoint$: BehaviorSubject<TrackPoint | undefined> = new BehaviorSubject<TrackPoint | undefined>(undefined);

  analysisProps$: BehaviorSubject<AnalysisProps> = new BehaviorSubject<AnalysisProps>(new AnalysisProps());
  settings$: BehaviorSubject<Settings> = new BehaviorSubject<Settings>(new Settings());

  clickPoint$: Subject<number[]> = new Subject<number[]>();

  metric: boolean = true;

  trackId: number = 1;
  undo$: BehaviorSubject<Undo> = new BehaviorSubject<Undo>(new Undo());

  constructor(private snackBar: MatSnackBar) {
    let localSettings: Settings = JSON.parse(localStorage.getItem('com.thebyrneproject.ng-gpx-sync.settings'));
    if (localSettings) {
      let settings: Settings = new Settings();
      settings = Object.assign(settings, localSettings);
      this.settings$.next(settings);
    }
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
      undo.history = [track, ...undo.history.slice(undo.index)];
      undo.index = 0;
      this.undo$.next(undo);
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
      this.setTrack(undo.history[undo.index]);
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

    this.setTrack(track);
  }

  openSnackBar(msg: string): void {
    this.snackBar.open(msg, 'Dismiss', {
      horizontalPosition: 'end',
      verticalPosition: 'top'
    })
  }
}
