import { Component, OnInit } from '@angular/core';

import { TrackPoint } from '../gpx/track-point';
import { GpxSyncService } from '../gpx-sync.service';
import { Track } from '../gpx/track';
import { AnalysisProps } from '../gpx/analysis-props';
import { Settings } from '../gpx/settings';
import { TrackPointEvent } from '../event/track-point-event';
import { ActionEvent } from '../event/action-event';

@Component({
  selector: 'tbp-gpx-table-sync',
  template: `
    <div class="w-100 h-100 y-auto me-3">
      <table mat-table [dataSource]="track.track" class="flex-grow-1 w-100">
        <ng-container matColumnDef="id">
          <th mat-header-cell *matHeaderCellDef>ID</th>
          <td mat-cell *matCellDef="let element">{{element.id}}</td>
        </ng-container>
        <ng-container matColumnDef="time">
          <th mat-header-cell *matHeaderCellDef>Time</th>
          <td mat-cell *matCellDef="let element">{{element.t | stot : track.timeFormat}}</td>
        </ng-container>
        <ng-container matColumnDef="lonlat">
          <th mat-header-cell *matHeaderCellDef>Lon/Lat</th>
          <td mat-cell *matCellDef="let element">{{element.lon | number : '1.1-6'}}, {{element.lat | number : '1.1-6'}}</td>
        </ng-container>
        <ng-container matColumnDef="ele">
          <th mat-header-cell *matHeaderCellDef>Elevation ({{settings.eleUnits}})</th>
          <td mat-cell *matCellDef="let element">{{settings.getElevation(element.ele) | number : '1.0-1'}}</td>
        </ng-container>
        <ng-container matColumnDef="pace">
          <th mat-header-cell *matHeaderCellDef>Pace ({{settings.paceUnits}})</th>
          <td mat-cell *matCellDef="let element">{{settings.getPaceDisplay(element.v)}}</td>
        </ng-container>
        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef></th>
          <td mat-cell *matCellDef="let element">
            <div *ngIf="selectedPoint?.id !== element.id" style="width: 82px;"></div>
            <ng-container *ngIf="selectedPoint?.id === element.id">
              <button mat-raised-button color="primary" class="me-1" [matMenuTriggerFor]="actionMenu">Actions</button>
              <mat-menu #actionMenu="matMenu">
                <button mat-menu-item (click)="updateLatLon()">Update Point</button>
                <button mat-menu-item (click)="changeDt()">Change dt</button>
              </mat-menu>
            </ng-container>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row
            [id]="'table-p-' + row.id"
            *matRowDef="let row; columns: displayedColumns;"
            [class.selected]="selectedPoint?.id === row.id"
            (click)="selectRow(row)"
            style="background-color: {{getTrackPointBGColor(row)}}"></tr>
      </table>
    </div>
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
  displayedColumns: string[] = ['id', 'time', 'lonlat', 'ele', 'pace', 'actions'];
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

    this.gpxSyncService.selectedPoint$.subscribe((e: TrackPointEvent) => {
      if (e.source !== 'table') {
        this.scrollTo(e.p);
      }
      this.selectedPoint = e.p;
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
    this.gpxSyncService.selectedPoint$.next(new TrackPointEvent(p, 'table'));
  }

  scrollTo(p: TrackPoint): void {
    if (p) {
      document.getElementById('table-p-' + p.id).scrollIntoView();
    }
  }

  changeDt(): void {
    if (this.selectedPoint) {
      this.gpxSyncService.action$.next(new ActionEvent('change-dt', this.selectedPoint));
    } else {
      this.gpxSyncService.openSnackBar('No point selected!');
    }
  }

  updateLatLon(): void {
    if (this.selectedPoint) {
      this.gpxSyncService.action$.next(new ActionEvent('update-point', this.selectedPoint));
    } else {
      this.gpxSyncService.openSnackBar('No point selected!');
    }
  }
}
