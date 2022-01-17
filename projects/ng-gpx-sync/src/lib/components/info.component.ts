import { Component, HostBinding, OnInit } from '@angular/core';

import { Track } from '../gpx/track';
import { GpxSyncService } from '../gpx-sync.service';
import { Settings } from '../gpx/settings';

@Component({
  selector: 'tbp-gpx-info-sync',
  template: `
    <div class="d-flex p-2">
      <div class="w-25 align-items-center label">Distance</div><div>{{settings.getDistance(track.distance) | number : '1.0-2'}} {{settings.distanceUnits}}</div>
    </div>
    <div class="d-flex p-2">
      <div class="w-25 align-items-center label">Duration</div><div>{{track.durationDisplay}}</div>
    </div>
    <div class="d-flex p-2">
      <div class="w-25 align-items-center label">Pace</div><div>{{settings.getPaceDisplay(track.v)}} {{settings.paceUnits}}</div>
    </div>
  `,
  styles: [`
    .label {
      font-size: larger;
    }
  `]
})
export class GpxSyncInfoComponent implements OnInit {

  @HostBinding('class') classes: string = 'd-flex flex-grow-1 flex-column';

  track: Track = new Track();
  settings: Settings;

  constructor(private gpxSyncService: GpxSyncService) {}

  ngOnInit(): void {
    this.gpxSyncService.track$.subscribe((track: Track) => {
      this.track = track;
    });
    this.gpxSyncService.settings$.subscribe((settings: Settings) => {
      this.settings = settings;
    });
  }
}
