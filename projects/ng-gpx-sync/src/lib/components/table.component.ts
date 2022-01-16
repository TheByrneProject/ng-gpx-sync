import { Component, OnInit } from '@angular/core';
import { TrackPoint } from '../gpx/track-point';
import { GpxSyncService } from '../gpx-sync.service';
import { Track } from '../gpx/track';
import { AnalysisProps } from '../gpx/analysis-props';

@Component({
  selector: 'tbp-gpx-table-sync',
  template: `
    <table mat-table [dataSource]="track.track" class="flex-grow-1">
      <ng-container matColumnDef="time">
        <th mat-header-cell *matHeaderCellDef>Time</th>
        <td mat-cell *matCellDef="let element">{{element.t | stot : timeFormat}}</td>
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
        <td mat-cell *matCellDef="let element">{{element.ele | number : '1.0'}}</td>
      </ng-container>
      <ng-container matColumnDef="pace">
        <th mat-header-cell *matHeaderCellDef>Min / Mi</th>
        <td mat-cell *matCellDef="let element">{{element.v | number : '1.1-2'}}</td>
      </ng-container>

      <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
      <tr mat-row *matRowDef="let row; columns: displayedColumns;" style="background-color: {{getTrackPointBGColor(row)}}"></tr>
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
  timeFormat: string = 'mmss';
  data: TrackPoint[] = [];
  displayedColumns: string[] = ['time', 'lat', 'lon', 'ele', 'pace'];
  analysisProps: AnalysisProps = new AnalysisProps();

  MIN_RED_A: number = 0.1;
  MAX_RED_A: number = 0.5;

  constructor(private gpxSyncService: GpxSyncService) {}

  ngOnInit() {
    this.gpxSyncService.analysisProps$.subscribe((analysisProps: AnalysisProps) => {
      this.analysisProps = analysisProps;
    });

    this.gpxSyncService.track$.subscribe((track: Track) => {
      this.track = track;

      this.timeFormat = track.duration > 3600 ? 'hhmmss' : 'mmss';
      this.data = track.track;
    });
  }

  getTrackPointBGColor(p: TrackPoint): string {
    if (p.v > this.analysisProps.slowLimit && this.track.slowPoints.length === 0) {
      return `rgba(255, 0, 0, 0.5)`;
    } if (p.v > this.analysisProps.slowLimit && this.track.slowPoints.length > 1) {
      let a: number = ((p.v - this.analysisProps.slowLimit) / (this.track.slowPoints[0].v - this.analysisProps.slowLimit))
          * (this.MAX_RED_A - this.MIN_RED_A) + this.MIN_RED_A;
      return `rgba(255, 0, 0, ${a})`;
    } else {
      return 'transparent';
    }
  }
}
