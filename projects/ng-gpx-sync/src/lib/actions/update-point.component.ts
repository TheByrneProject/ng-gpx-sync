import { Component, HostBinding } from '@angular/core';

import { TrackPoint } from '../gpx/track-point';
import { Settings } from '../gpx/settings';
import { GpxSyncService } from '../gpx-sync.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { calcDistance } from '../gpx/calc';
import { GpxEvent } from '../event/gpx-event';
import { ActionEvent } from '../event/action-event';

@Component({
  selector: 'tbp-gpx-update-point',
  template: `
    <div class="action-title">Update Point</div>
    <div class="mb-1 y-auto p-1 d-flex flex-column">
      <mat-card class="mb-1">
        <mat-card-title>Current Point</mat-card-title>
        <mat-card-content class="card-values">
          <div class="card-row"><div class="w-25 label">Latitude</div><div>{{p1.lat}}</div></div>
          <div class="card-row"><div class="w-25 label">Longitude</div><div>{{p1.lon}}</div></div>
          <div class="card-row"><div class="w-25 label">Elevation</div><div>{{settings.getElevationAsString(p1.ele)}}</div></div>
        </mat-card-content>
      </mat-card>

      <mat-card>
        <mat-card-title class="d-flex">
          <div class="me-5">New Values</div>
          <button mat-button color="primary" (click)="reset()">Reset</button>
          <button mat-button color="primary" (click)="paste()">Paste From Map</button>
        </mat-card-title>
        <mat-card-content class="card-values">
          <form [formGroup]="form" class="d-flex">
            <mat-form-field class="" appearance="fill">
              <mat-label>Latitude</mat-label>
              <input type="number" matInput formControlName="lat" />
            </mat-form-field>
            <mat-form-field class="" appearance="fill">
              <mat-label>Longitude</mat-label>
              <input type="number" matInput formControlName="lon" />
            </mat-form-field>
            <mat-form-field class="" appearance="fill">
              <mat-label>Elevation</mat-label>
              <input type="number" matInput formControlName="ele" />
            </mat-form-field>
          </form>
          <div class="card-row"><div class="w-50 label">Distance Before</div><div>{{d0 ? settings.getShortDistanceDisplay(d0) + ' ' + settings.shortDistanceUnits : '-'}}</div></div>
          <div class="card-row"><div class="w-50 label">Distance After</div><div>{{d2 ? settings.getShortDistanceDisplay(d2) + ' ' + settings.shortDistanceUnits : '-'}}</div></div>
          <div class="card-row"><div class="w-50 label">Loss/Gain to Previous</div><div>{{e0 ? (e0 - e1).toFixed(1) + ' ' + settings.eleUnits : '-'}}</div></div>
          <div class="card-row"><div class="w-50 label">Loss/Gain to Next</div><div>{{e2 ? (e2 - e1).toFixed(1) + ' ' + settings.eleUnits : '-'}}</div></div>
        </mat-card-content>
      </mat-card>
    </div>
    <mat-card>
      <mat-card-actions>
        <button mat-button (click)="cancel()">Cancel</button>
        <button mat-button (click)="update()" [disabled]="!form.valid">Update <mat-spinner *ngIf="loading"></mat-spinner></button>
      </mat-card-actions>
    </mat-card>
  `,
  styles: []
})
export class UpdatePointComponent {

  @HostBinding('class') classes: string = 'd-flex flex-column w-100';

  p0: TrackPoint;
  p1: TrackPoint;
  p2: TrackPoint;
  d0: number;
  d2: number;
  e0: number;
  e1: number;
  e2: number;
  settings: Settings;
  loading: boolean = false;

  form: FormGroup = new FormGroup({
    lon: new FormControl('', [Validators.required, Validators.pattern('^(\\+|-)?((\\d((\\.)|\\.\\d{1,6})?)|(0*?\\d\\d((\\.)|\\.\\d{1,6})?)|(0*?1[0-7]\\d((\\.)|\\.\\d{1,6})?)|(0*?180((\\.)|\\.0{1,6})?))$')]),
    lat: new FormControl('', [Validators.required, Validators.pattern('^(\\+|-)?((\\d((\\.)|\\.\\d{1,6})?)|(0*?[0-8]\\d((\\.)|\\.\\d{1,6})?)|(0*?90((\\.)|\\.0{1,6})?))$')]),
    ele: new FormControl('', [Validators.required, Validators.pattern('^^\\d{1,5}(\\.\\d)?$')])
  });

  constructor(private gpxSyncService: GpxSyncService) {}

  ngOnInit() {
    this.gpxSyncService.settings$.subscribe((settings: Settings) => {
      this.settings = settings;
    });

    this.gpxSyncService.action$.subscribe((e: ActionEvent) => {
      if (this.p1) {
        // Flash alert
      }

      this.p1 = e.data as TrackPoint;
      this.p0 = this.gpxSyncService.track$.getValue().getPrevious(this.p1);
      this.p2 = this.gpxSyncService.track$.getValue().getNext(this.p1);

      this.reset();
      this.form.valueChanges.subscribe((values: any) => {
        this.setChanges();
      });
    });
  }

  cancel(): void {
    this.gpxSyncService.action$.next(new ActionEvent());
  }

  reset(): void {
    this.form.get('lon').setValue(this.p1.lon);
    this.form.get('lat').setValue(this.p1.lat);
    this.form.get('ele').setValue(this.settings.getElevation(this.p1.ele).toFixed(1));
    this.setChanges();
  }

  paste(): void {
    navigator['clipboard'].readText().then((data: string) => {
      console.log(data);
      const p: any = JSON.parse(data);
      if (p.lat && p.lon) {
        this.form.get('lon').setValue(p.lon);
        this.form.get('lat').setValue(p.lat);
        this.setChanges();
      }
    });
  }

  setChanges(): void {
    const v: any = this.form.getRawValue();
    this.e1 = this.settings.setElevation(v.ele);

    if (this.p0) {
      this.d0 = calcDistance(this.p0.lon, this.p0.lat, v.lon, v.lat);
      this.e0 = this.p0.ele;
    }
    if (this.p2) {
      this.d2 = calcDistance(v.lon, v.lat, this.p2.lon, this.p2.lat);
      this.e2 = this.p2.ele;
    }
  }

  update(): void {
    const v: any = this.form.getRawValue();
    this.p1.lon = v.lon;
    this.p1.lat = v.lat;
    this.p1.ele = this.settings.setElevation(v.ele);
    const result: GpxEvent = this.gpxSyncService.updatePoint(this.p1);
    if (result.success) {
      this.gpxSyncService.action$.next(new ActionEvent());
    }
    this.loading = false;
  }
}
