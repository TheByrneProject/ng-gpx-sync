import { Component, HostBinding, OnInit } from '@angular/core';

import { Track } from '../gpx/track';
import { GpxSyncService } from '../gpx-sync.service';

@Component({
  selector: 'tbp-gpx-info-sync',
  template: `
    <div class="d-flex p-2">
      <div class="w-25 align-items-center label">Distance</div><div>{{track.distance / 1000.0}} km</div>
    </div>
    <div class="d-flex p-2">
      <div class="w-25 align-items-center label">Duration</div><div>{{track.durationDisplay}}</div>
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

  constructor(private gpxSyncService: GpxSyncService) {}

  ngOnInit(): void {
    this.gpxSyncService.track$.subscribe((track: Track) => {
      this.track = track;
    });
  }

}
