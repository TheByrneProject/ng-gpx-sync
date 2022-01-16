import { TestBed } from '@angular/core/testing';

import { GpxSyncService } from './gpx-sync.service';

describe('NgGpxSyncService', () => {
  let service: GpxSyncService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GpxSyncService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
