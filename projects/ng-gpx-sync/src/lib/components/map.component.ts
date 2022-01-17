import { Component, HostBinding, OnInit } from '@angular/core';

import { GpxSyncService } from '../gpx-sync.service';

@Component({
  selector: 'tbp-gpx-map-sync',
  template: `
    Map
  `,
  styles: [
    ``
  ]
})
export class GpxSyncMapComponent implements OnInit {

  @HostBinding('class') classes: string = 'd-flex flex-grow-1 flex-column';

  constructor(private gpxSyncService: GpxSyncService) {}

  ngOnInit() {}

}
