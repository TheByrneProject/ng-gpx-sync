import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GpxSyncComponent } from './gpx-sync.component';

describe('GpxSyncComponent', () => {
  let component: GpxSyncComponent;
  let fixture: ComponentFixture<GpxSyncComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GpxSyncComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GpxSyncComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
