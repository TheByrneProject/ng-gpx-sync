import { Component, HostBinding, OnInit } from '@angular/core';

import { GpxSyncService } from '../gpx-sync.service';
import { Track } from '../gpx/track';
import { TrackPoint } from '../gpx/track-point';
import { FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { AnalysisProps } from '../gpx/analysis-props';
import { Settings } from '../gpx/settings';

@Component({
  selector: 'tbp-gpx-analysis-sync',
  template: `
    <form [formGroup]="form" class="d-flex align-items-center justify-content-between">
      <div class="label">Slowest Points</div>
      <mat-form-field class="example-full-width" appearance="fill">
        <mat-label>Pace Threshold ({{settings.paceUnits}})</mat-label>
        <input type="number" matInput formControlName="slowThreshold" />
      </mat-form-field>
    </form>
    <table mat-table [dataSource]="slowPoints" class="flex-grow-1">
      <ng-container matColumnDef="time">
        <th mat-header-cell *matHeaderCellDef>Time</th>
        <td mat-cell *matCellDef="let element">{{element.t | stot : track.timeFormat}}</td>
      </ng-container>
      <ng-container matColumnDef="pace">
        <th mat-header-cell *matHeaderCellDef>Pace {{settings.paceUnits}}</th>
        <td mat-cell *matCellDef="let element">{{settings.getPaceDisplay(element.v)}}</td>
      </ng-container>

      <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
      <tr mat-row
          [id]="'analysis-p-' + row.id"
          *matRowDef="let row; columns: displayedColumns;"
          [class.selected]="selectedPoint?.id === row.id"
          (click)="selectRow(row)"></tr>
    </table>
  `,
  styles: []
})
export class GpxSyncAnalysisComponent implements OnInit {

  @HostBinding('class') classes: string = 'd-flex flex-grow-1 flex-column p-1';

  track: Track = new Track();
  slowPoints: TrackPoint[] = [];
  displayedColumns: string[] = ['time', 'pace'];

  selectedPoint: TrackPoint = null;
  analysisProps: AnalysisProps;
  settings: Settings;

  form: FormGroup = new FormGroup({
    slowThreshold: new FormControl('', Validators.required)
  });

  constructor(private gpxSyncService: GpxSyncService) {}

  ngOnInit(): void {
    this.gpxSyncService.settings$.subscribe((settings: Settings) => {
      this.settings = settings;
    });

    this.gpxSyncService.track$.subscribe((track: Track) => {
      this.track = track;
      this.slowPoints = track.slowPoints;
    });

    this.gpxSyncService.analysisProps$.subscribe((analysisProps: AnalysisProps) => {
      if (!this.analysisProps) {
        this.form.get('slowThreshold').setValue(this.settings.getPace(analysisProps.slowThreshold).toPrecision(3));
      }
      this.analysisProps = analysisProps;
    });

    this.gpxSyncService.selectedPoint$.subscribe((p: TrackPoint) => {
      if (p?.id !== this.selectedPoint?.id) {
        this.scrollTo(p);
      }
      this.selectedPoint = p;
    });

    this.form.valueChanges.subscribe((value: any) => {
      if (value
          && value.slowThreshold
          && value.slowThreshold > this.track.v
          && value.slowThreshold < 100.0) {
        this.analysisProps.slowThreshold = this.settings.setPace(value.slowThreshold);
        this.gpxSyncService.setAnalysisProps(this.analysisProps);
      }
    });
  }

  selectRow(p: TrackPoint): void {
    console.log('selectRow: ' + p.id);
    this.selectedPoint = p;
    this.gpxSyncService.selectedPoint$.next(p);
  }

  scrollTo(p: TrackPoint): void {
    if (p) {
      const e = document.getElementById('analysis-p-' + p.id);
      if (e) {
        e.scrollIntoView();
      }

    }
  }
}
