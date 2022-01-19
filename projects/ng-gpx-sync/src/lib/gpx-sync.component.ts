import { Component, HostBinding, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { Clipboard } from '@angular/cdk/clipboard';

import { FileSaverService } from 'ngx-filesaver';

import { GpxSyncService } from './gpx-sync.service';
import { Track } from './gpx/track';
import { Undo } from './event/undo';
import { UserGuideComponent } from './dialog/user-guide.component';
import { AboutComponent } from './dialog/about.component';
import { Settings } from './gpx/settings';
import { ActionEvent } from './event/action-event';

@Component({
  selector: 'tbp-gpx-sync',
  template: `
    <div class="form-group d-flex flex-grow-0 m-1">
      <!-- File -->
      <button mat-raised-button color="primary" class="me-1" [matMenuTriggerFor]="fileMenu" i18n>File</button>
      <mat-menu #fileMenu="matMenu">
        <button mat-menu-item (click)="open()" i18n>Open</button>
        <button mat-menu-item (click)="save(true)" i18n>Save File</button>
        <button mat-menu-item (click)="save(false)" i18n>Save to Clipboard</button>
        <button mat-menu-item [matMenuTriggerFor]="unitsMenu" i18n>Units</button>
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

    <!-- xl -->
    <div class="d-none d-xl-flex flex-column flex-grow-1 overflow-hidden">
      <div class="panel">
        <tbp-gpx-openlayers-sync id="openlayers" target="xl-map" class="sub-panel"></tbp-gpx-openlayers-sync>
        <mat-tab-group class="sub-panel">
          <mat-tab label="Info"><tbp-gpx-info-sync></tbp-gpx-info-sync></mat-tab>
          <mat-tab label="Slow Analysis"><tbp-gpx-analysis-sync></tbp-gpx-analysis-sync></mat-tab>
        </mat-tab-group>
      </div>
      <div class="d-flex flex-grow-1 panel">
        <tbp-gpx-table-sync id="table" class="sub-panel"></tbp-gpx-table-sync>
        <tbp-gpx-sync-action id="actions" flasher class="sub-panel"></tbp-gpx-sync-action>
      </div>
    </div>

    <!-- less than xl -->
    <mat-tab-group class="d-flex d-xl-none flex-grow-1 h-100">
      <mat-tab label="Map">
        <tbp-gpx-openlayers-sync id="openlayers" class="d-flex flex-grow-1 h-100 p-1"></tbp-gpx-openlayers-sync>
      </mat-tab>
      <mat-tab label="Info/Analysis">
        <mat-tab-group class="d-flex flex-grow-1 h-100 p-1">
          <mat-tab label="Info"><tbp-gpx-info-sync></tbp-gpx-info-sync></mat-tab>
          <!--<mat-tab label="Map"><tbp-gpx-map-sync></tbp-gpx-map-sync></mat-tab>-->
          <mat-tab label="Slow Analysis"><tbp-gpx-analysis-sync></tbp-gpx-analysis-sync></mat-tab>
        </mat-tab-group>
      </mat-tab>
      <mat-tab label="Table">
        <tbp-gpx-table-sync id="table" class="d-flex flex-grow-1 h-100 p-1"></tbp-gpx-table-sync>
      </mat-tab>
      <mat-tab label="Actions">
        <tbp-gpx-sync-action id="actions" flasher class="d-flex flex-grow-1 h-100 p-1"></tbp-gpx-sync-action>
      </mat-tab>
    </mat-tab-group>

    <input type="file" id="file-upload" (change)="openGpx($event)" style="display: none;">
  `,
  styleUrls: [
    'gpx-sync.component.scss'
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
              private clipboard: Clipboard,
              private fileSaverService: FileSaverService) { }

  ngOnInit(): void {
    this.gpxSyncService.undo$.subscribe((undo: Undo) => {
      this.undo = undo;
    });
    this.gpxSyncService.settings$.subscribe((settings: Settings) => {
      this.settings = settings;
    });
    this.gpxSyncService.track$.subscribe((track: Track) => {
      this.track = track;
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

  save(file: boolean): void {
    if (file) {
      const blob = new Blob([new XMLSerializer().serializeToString(this.track.writeGpx())], { type: 'text/xml'});
      this.fileSaverService.save(blob, this.track.fileName);
    } else {
      this.clipboard.copy(new XMLSerializer().serializeToString(this.track.writeGpx()));
    }
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

  doUndo(): void {
    this.gpxSyncService.undo();
  }

  doRedo(): void {
    this.gpxSyncService.redo();
  }

  compress() {
    /*const dialogRef = this.dialog.open(CompressComponent, {
      minWidth: '50vw'
    });
    dialogRef.afterClosed().subscribe();*/
    this.gpxSyncService.action$.next(new ActionEvent('compress'));
  }

  about() {
    const dialogRef = this.dialog.open(AboutComponent, {
      minWidth: '50vw'
    });
    dialogRef.afterClosed().subscribe();
  }

  userGuide() {
    const dialogRef = this.dialog.open(UserGuideComponent, {
      minWidth: '50vw'
    });
    dialogRef.afterClosed().subscribe();
  }
}
