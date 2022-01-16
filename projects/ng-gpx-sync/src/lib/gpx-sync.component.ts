import { Component, HostBinding } from '@angular/core';

import { FileSaverService } from 'ngx-filesaver';

import { GpxSyncService } from './gpx-sync.service';
import { Track } from './gpx/track';

@Component({
  selector: 'tbp-gpx-sync',
  template: `
    <div class="form-group">
      <button mat-button [matMenuTriggerFor]="fileMenu">File</button>
      <mat-menu #fileMenu="matMenu">
        <button mat-menu-item (click)="open()">Open</button>
        <button mat-menu-item (click)="save()">Save</button>
      </mat-menu>
    </div>
    <div id="top-panel" class="d-flex">
      <tbp-gpx-map-sync id="map" class="d-flex w-50 h-100 r-border m-1 p-1"></tbp-gpx-map-sync>
      <mat-tab-group class="w-50 h-100 r-border m-1 p-1">
        <mat-tab label="Info"><tbp-gpx-info-sync></tbp-gpx-info-sync></mat-tab>
        <mat-tab label="Actions">Actions</mat-tab>
      </mat-tab-group>
    </div>
    <tbp-gpx-table-sync id="table" class="d-flex r-border mt-2 m-1 p-1"></tbp-gpx-table-sync>

    <input type="file" id="file-upload" (change)="openGpx($event)" style="display: none;">
  `,
  styles: [
    `
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
    `
  ]
})
export class GpxSyncComponent {

  @HostBinding('class') classes: string = 'd-flex flex-grow-1 flex-column';

  track: Track = new Track();

  constructor(private gpxSyncService: GpxSyncService,
              private fileSaverService: FileSaverService) { }

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
}
