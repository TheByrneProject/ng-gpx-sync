import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

import { BehaviorSubject, Subject } from 'rxjs';

import { Track } from './gpx/track';
import { AnalysisProps } from './gpx/analysis-props';

@Injectable()
export class GpxSyncService {

  track$: BehaviorSubject<Track> = new BehaviorSubject<Track>(new Track());
  analysisProps$: BehaviorSubject<AnalysisProps> = new BehaviorSubject<AnalysisProps>(new AnalysisProps());

  clickPoint$: Subject<number[]> = new Subject<number[]>();

  metric: boolean = true;

  constructor(private snackBar: MatSnackBar) {}

  openGpx(file: File): void {
    let track: Track = new Track();
    track.fileName = file.name;
    let reader: FileReader = new FileReader();

    reader.onload = () => {
      let fileText = reader.result as string;
      let parser: DOMParser = new DOMParser();

      track.parseGpx(parser.parseFromString(fileText, "text/xml"));
      track.analyze(this.analysisProps$.getValue());

      this.track$.next(track);
    };

    reader.readAsText(file);
  }

  openSnackBar(msg: string): void {
    this.snackBar.open(msg, 'Dismiss', {
      horizontalPosition: 'end',
      verticalPosition: 'top'
    })
  }
}
