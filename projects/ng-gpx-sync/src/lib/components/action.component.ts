import { Component, HostBinding, OnInit } from '@angular/core';

import { GpxSyncService } from '../gpx-sync.service';
import { ActionEvent } from '../event/action-event';

@Component({
  selector: 'tbp-gpx-sync-action',
  template: `
    <div *ngIf="!action">
      <mat-card>
        <mat-card-title style="color: grey;">Action Panel</mat-card-title>
      </mat-card>
    </div>
    <tbp-gpx-compress *ngIf="action?.name === 'compress'"></tbp-gpx-compress>
    <tbp-gpx-change-dt *ngIf="action?.name === 'change-dt'"></tbp-gpx-change-dt>
    <tbp-gpx-update-point *ngIf="action?.name === 'update-point'"></tbp-gpx-update-point>
  `
})
export class GpxSyncActionComponent implements OnInit {

  @HostBinding('class') classes: string = 'd-flex';

  action: ActionEvent;

  constructor(private gpxSyncService: GpxSyncService) {}

  ngOnInit(): void {
    this.gpxSyncService.action$.subscribe((action: ActionEvent) => {
      this.action = action;
    });
  }
}
