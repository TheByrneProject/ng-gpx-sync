import { Component, HostBinding, Inject } from '@angular/core';

import { TrackPoint } from '../gpx/track-point';
import { Settings } from '../gpx/settings';
import { GpxSyncService } from '../gpx-sync.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { calcPace } from '../gpx/calc';
import { ActionEvent } from '../event/action-event';

@Component({
  selector: 'tbp-gpx-change-dt',
  template: `
    <mat-card>
      <mat-card-title>Change dt</mat-card-title>
    </mat-card>
    <div class="mb-1 overflow-auto p-1 d-flex flex-column">
      <div class="p-1 d-flex flex-column">
        <mat-card class="mb-1">
          <mat-card-title>Current Values</mat-card-title>
          <mat-card-content class="card-values">
            <div class="card-row"><div class="w-25 label">dt</div><div>{{p1.dt}} s</div></div>
            <div class="card-row"><div class="w-25 label">Pace</div><div>{{settings?.getPaceDisplay(p1.v)}} {{settings?.paceUnits}}</div></div>
            <div class="card-row"><div class="w-25 label">Time</div><div>{{t | stot}}</div></div>
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-title>New Values</mat-card-title>
          <mat-card-content class="card-values">
            <form [formGroup]="form" class="d-flex">
              <mat-form-field class="" appearance="fill">
                <mat-label>New dt</mat-label>
                <input type="number" matInput formControlName="dt" />
              </mat-form-field>
            </form>
            <div class="card-row"><div class="w-25 label">Pace</div><div>{{settings?.getPaceDisplay(newPace)}} {{settings?.paceUnits}}</div></div>
            <div class="card-row"><div class="w-25 label">Time</div><div>{{t - p1.dt + newDt | stot}}</div></div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
    <mat-card>
      <mat-card-actions>
        <button mat-button mat-dialog-close="">Cancel</button>
        <button mat-button mat-dialog-close="" (click)="save()" [disabled]="p1.dt === newDt && !form.valid">Save</button>
      </mat-card-actions>
    </mat-card>
  `
})
export class ChangeDtComponent {

  @HostBinding('class') classes: string = 'd-flex flex-column w-100';

  p1: TrackPoint;
  p2: TrackPoint;
  t: number;
  newDt: number;
  newPace: number;
  newT: number;
  settings: Settings;

  form: FormGroup = new FormGroup({
    dt: new FormControl('', [Validators.required, Validators.min(1), Validators.max(59)])
  });

  constructor(private gpxSyncService: GpxSyncService) {}

  ngOnInit() {
    this.gpxSyncService.settings$.subscribe((settings: Settings) => {
      this.settings = settings;
    });

    this.gpxSyncService.action$.subscribe((e: ActionEvent) => {
      this.p1 = e.data as TrackPoint;

      this.p2 = this.gpxSyncService.track$.getValue().getNext(this.p1);
      this.t = this.gpxSyncService.track$.getValue().duration;
      this.form.get('dt').setValue(this.p1.dt);
      this.setNewDt(this.p1.dt);

      this.form.valueChanges.subscribe((values: any) => {
        this.setNewDt(values.dt);
      });
    });
  }

  setNewDt(newDt: number): void {
    if (newDt) {
      this.newDt = newDt;
      this.newPace = calcPace(this.newDt, this.p1.dx);
    }
  }

  save(): void {
    this.gpxSyncService.shiftTime(this.p1, this.newDt - this.p1.dt);
    this.gpxSyncService.action$.next(new ActionEvent());
  }
}
