import { Component, HostBinding } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { GpxSyncService } from '../gpx-sync.service';
import { Track } from '../gpx/track';

@Component({
  selector: 'tbp-gpx-compress',
  template: `
    <mat-card>
      <mat-card-title>Compress</mat-card-title>
    </mat-card>
    <mat-card class="mb-1 overflow-auto">
      <mat-card-content>
        <div class="mb-1">
          <span class="me-5"></span>Compression will automatically reduce the length of a course.  If it is 59:00 and you need to get it down
          to fit a 58:30 video, this will go through and find the points with the slowest pace and reduce its duration
          by a second at a time.  It iterates in this fashion until it hits 58:30.
        </div>
        <div class="d-flex mb-3">
          <div class="w-25 label">Current Duration</div><div>{{duration | stot}}</div>
        </div>
        <form [formGroup]="form" class="d-flex align-items-center justify-content-between">
          <div class="label me-5">
            New Duration
          </div>
          <mat-form-field class="w-100px" appearance="fill">
            <mat-label>H</mat-label>
            <input type="number" matInput formControlName="h" />
          </mat-form-field>
          <mat-form-field class="w-100px" appearance="fill">
            <mat-label>M</mat-label>
            <input type="number" matInput formControlName="m" />
          </mat-form-field>
          <mat-form-field class="w-100px" appearance="fill">
            <mat-label>S</mat-label>
            <input type="number" matInput formControlName="s" />
          </mat-form-field>
        </form>
      </mat-card-content>
    </mat-card>
    <mat-card>
      <mat-card-actions>
        <button mat-button mat-dialog-close="" cdkFocusInitial>Cancel</button>
        <button mat-button mat-dialog-close="" (click)="compress()">Compress <mat-spinner *ngIf="loading"></mat-spinner></button>
      </mat-card-actions>
    </mat-card>
  `
})
export class CompressComponent {

  @HostBinding('class') classes: string = 'p-1 d-flex flex-column w-100';

  loading: boolean = false;

  duration: number = 0;

  form: FormGroup = new FormGroup({
    h: new FormControl('', [Validators.required, Validators.min(0), Validators.max(59)]),
    m: new FormControl('', [Validators.required, Validators.min(0), Validators.max(59)]),
    s: new FormControl('', [Validators.required, Validators.min(0), Validators.max(59)]),
  });

  constructor(private gpxSyncService: GpxSyncService) {}

  ngOnInit() {
    this.gpxSyncService.track$.subscribe((track: Track) => {
      if (this.loading) {
        this.loading = false;
      }

      this.duration = track.duration;

      const h = Math.floor(this.duration / 3600.0);
      const hr = this.duration % 3600;
      const m = Math.floor(hr / 60.0);
      const mh = hr % 60;
      const s = mh;
      this.form.get('h').setValue(h);
      this.form.get('m').setValue(m);
      this.form.get('s').setValue(s);
    });
  }

  compress(): void {
    this.loading = true;
    const v: any = this.form.getRawValue();

    const result: boolean = this.gpxSyncService.compress(v.h * 3600 + v.m * 60 + v.s);
    if (!result) {
      this.loading = false;
    }
    this.gpxSyncService.action$.next(undefined);
  }
}
