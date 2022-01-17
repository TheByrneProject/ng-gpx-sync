import { Component, HostBinding, Input } from '@angular/core';

import { FileSaverService } from 'ngx-filesaver';

import { GpxSyncService } from './gpx-sync.service';
import { Track } from './gpx/track';
import { Undo } from './events/undo';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { UserGuideComponent } from './dialog/user-guide.component';
import { AboutComponent } from './dialog/about.component';
import { Settings } from './gpx/settings';

@Component({
  selector: 'tbp-gpx-sync',
  template: `
    <div class="form-group d-flex flex-grow-1 m-1">
      <!-- File -->
      <button mat-raised-button color="primary" class="me-1" [matMenuTriggerFor]="fileMenu">File</button>
      <mat-menu #fileMenu="matMenu">
        <button mat-menu-item (click)="open()">Open</button>
        <button mat-menu-item (click)="save()">Save</button>
        <button mat-menu-item [matMenuTriggerFor]="unitsMenu">Units</button>
      </mat-menu>
      <mat-menu #unitsMenu="matMenu">
        <button mat-menu-item (click)="setMetric(true)">Metric<mat-icon *ngIf="settings?.metric" class="ms-3">check</mat-icon></button>
        <button mat-menu-item (click)="setMetric(false)">Imperial<mat-icon *ngIf="!settings?.metric" class="ms-3">check</mat-icon></button>
      </mat-menu>

      <!-- Edit -->
      <button mat-raised-button color="primary" class="me-1" [matMenuTriggerFor]="editMenu">Edit</button>
      <mat-menu #editMenu="matMenu">
        <button mat-menu-item (click)="compress()">Compress</button>
      </mat-menu>

      <!-- Help -->
      <button mat-raised-button color="primary" class="me-1" [matMenuTriggerFor]="helpMenu">Help</button>
      <mat-menu #helpMenu="matMenu">
        <button mat-menu-item (click)="userGuide()">User Guide</button>
        <button mat-menu-item (click)="about()">About</button>
      </mat-menu>

      <div class="ms-auto me-0 d-flex align-items-center">
        <mat-icon (click)="doUndo()" [class.inactive]="undo.index >= undo.history.length - 1">undo</mat-icon>
        <mat-icon class="ms-2 me-2" (click)="doRedo()" [class.inactive]="undo.index === 0">redo</mat-icon>
      </div>
    </div>
    <div id="top-panel" class="d-flex">
      <tbp-gpx-openlayers-sync id="openlayers" class="d-flex w-50 h-100 r-border m-1 p-1"></tbp-gpx-openlayers-sync>
      <mat-tab-group class="w-50 h-100 r-border m-1 p-1">
        <mat-tab label="Info"><tbp-gpx-info-sync></tbp-gpx-info-sync></mat-tab>
        <mat-tab label="Map"><tbp-gpx-map-sync></tbp-gpx-map-sync></mat-tab>
        <mat-tab label="Analysis"><tbp-gpx-analysis-sync></tbp-gpx-analysis-sync></mat-tab>
      </mat-tab-group>
    </div>
    <tbp-gpx-table-sync id="table" class="d-flex r-border mt-2 m-1 p-1"></tbp-gpx-table-sync>

    <input type="file" id="file-upload" (change)="openGpx($event)" style="display: none;">
  `,
  styles: [
    `
      .inactive {
        color: grey;
      }

      #top-panel {
        height: 49%;
      }

      #table {
        height: 49%;
        overflow-y: auto;
      }

      .r-border {
        border-radius: 1rem;
        border: 1px solid grey;
      }

      ::ng-deep .mat-row.selected {
        background-color: yellow;
      }
    `
  ]
})
export class GpxSyncComponent {

  @HostBinding('class') classes: string = 'd-flex flex-grow-1 flex-column';

  @Input() localData: string;

  track: Track = new Track();
  undo: Undo = new Undo();
  settings: Settings;

  constructor(private gpxSyncService: GpxSyncService,
              public dialog: MatDialog,
              private http: HttpClient,
              private fileSaverService: FileSaverService) { }

  ngOnInit(): void {
    this.gpxSyncService.undo$.subscribe((undo: Undo) => {
      this.undo = undo;
    });
    this.gpxSyncService.settings$.subscribe((settings: Settings) => {
      this.settings = settings;
    });

    if (this.localData) {
      this.http.get('assets/' + this.localData, {responseType: 'text'}).subscribe((response: string) => {
        this.gpxSyncService.parseGpx(response, this.localData);
      });
    }
  }

  open(): void {
    (document.getElementById('file-upload') as HTMLButtonElement).click();
  }

  save(): void {
    const blob = new Blob([new XMLSerializer().serializeToString(this.track.writeGpx())], { type: 'text/xml'});
    this.fileSaverService.save(blob, this.track.fileName);
  }

  openGpx(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      try {
        this.gpxSyncService.openGpx(file);
      } catch (error) {
        console.error(error);
        this.gpxSyncService.openSnackBar('Failed to parse gpx, check console.');
      }
    } else {
      this.gpxSyncService.openSnackBar('Failed to open, file is null.');
    }
  }

  setMetric(metric: boolean): void {
    this.gpxSyncService.setMetric(metric);
  }

  doUndo(): void {}

  doRedo(): void {}

  compress() {
    const dialogRef = this.dialog.open(UserGuideComponent);
    dialogRef.afterClosed().subscribe();
  }

  about() {
    const dialogRef = this.dialog.open(AboutComponent);
    dialogRef.afterClosed().subscribe();
  }

  userGuide() {
    const dialogRef = this.dialog.open(UserGuideComponent);
    dialogRef.afterClosed().subscribe();
  }
}
