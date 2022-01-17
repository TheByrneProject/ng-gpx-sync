import { Component, OnInit } from '@angular/core';
import { TrackPoint } from '../gpx/track-point';
import { GpxSyncService } from '../gpx-sync.service';
import { Track } from '../gpx/track';
import { AnalysisProps } from '../gpx/analysis-props';
import { Settings } from '../gpx/settings';

@Component({
  selector: 'tbp-gpx-table-sync',
  template: `
    <table mat-table [dataSource]="track.track" class="flex-grow-1">
      <ng-container matColumnDef="time">
        <th mat-header-cell *matHeaderCellDef>Time</th>
        <td mat-cell *matCellDef="let element">{{element.t | stot : track.timeFormat}}</td>
      </ng-container>
      <ng-container matColumnDef="lat">
        <th mat-header-cell *matHeaderCellDef>Lat</th>
        <td mat-cell *matCellDef="let element">{{element.lat | number : '1.1-6'}}</td>
      </ng-container>
      <ng-container matColumnDef="lon">
        <th mat-header-cell *matHeaderCellDef>Lon</th>
        <td mat-cell *matCellDef="let element">{{element.lon | number : '1.1-6'}}</td>
      </ng-container>
      <ng-container matColumnDef="ele">
        <th mat-header-cell *matHeaderCellDef>Elevation</th>
        <td mat-cell *matCellDef="let element">{{settings.getElevation(element.ele) | number : '1.0'}}</td>
      </ng-container>
      <ng-container matColumnDef="pace">
        <th mat-header-cell *matHeaderCellDef>Pace ({{settings.paceUnits}})</th>
        <td mat-cell *matCellDef="let element">{{settings.getPaceDisplay(element.v)}}</td>
      </ng-container>

      <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
      <tr mat-row
          [id]="'table-p-' + row.id"
          *matRowDef="let row; columns: displayedColumns;"
          [class.selected]="selectedPoint?.id === row.id"
          (click)="selectRow(row)"
          style="background-color: {{getTrackPointBGColor(row)}}"></tr>
    </table>
  `,
  styles: [
    `
      #top-panel {
        height: 50%;
      }
      #table {
        height: 50%;
        overflow-y: auto;
      }
    `
  ]
})
export class GpxSyncTableComponent implements OnInit {

  track: Track = new Track();
  data: TrackPoint[] = [];
  displayedColumns: string[] = ['time', 'lat', 'lon', 'ele', 'pace'];
  settings: Settings = new Settings();
  analysisProps: AnalysisProps = new AnalysisProps();

  selectedPoint: TrackPoint = null;

  MIN_RED_A: number = 0.1;
  MAX_RED_A: number = 0.5;

  constructor(private gpxSyncService: GpxSyncService) {}

  ngOnInit() {
    this.gpxSyncService.analysisProps$.subscribe((analysisProps: AnalysisProps) => {
      this.analysisProps = analysisProps;
    });
    this.gpxSyncService.settings$.subscribe((settings: Settings) => {
      this.settings = settings;
    });

    this.gpxSyncService.track$.subscribe((track: Track) => {
      this.track = track;

      this.data = track.track;
    });

    this.gpxSyncService.selectedPoint$.subscribe((p: TrackPoint) => {
      if (p?.id !== this.selectedPoint?.id) {
        this.scrollTo(p);
      }
      this.selectedPoint = p;
    });
  }

  getTrackPointBGColor(p: TrackPoint): string {
    if (p.id === this.selectedPoint?.id) {
      return '';
    } else if (p.v > this.analysisProps.slowThreshold && this.track.slowPoints.length === 0) {
      return `rgba(255, 0, 0, 0.5)`;
    } if (p.v > this.analysisProps.slowThreshold && this.track.slowPoints.length > 1) {
      let a: number = ((p.v - this.analysisProps.slowThreshold) / (this.track.slowPoints[0].v - this.analysisProps.slowThreshold))
          * (this.MAX_RED_A - this.MIN_RED_A) + this.MIN_RED_A;
      return `rgba(255, 0, 0, ${a})`;
    } else {
      return 'transparent';
    }
  }

  selectRow(p: TrackPoint): void {
    console.log('selectRow: ' + p.id);
    this.selectedPoint = p;
    this.gpxSyncService.selectedPoint$.next(p);
  }

  scrollTo(p: TrackPoint): void {
    if (p) {
      document.getElementById('table-p-' + p.id).scrollIntoView();
    }
  }
}
