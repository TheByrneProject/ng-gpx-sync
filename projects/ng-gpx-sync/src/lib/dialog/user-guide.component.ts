import { Component } from '@angular/core';

@Component({
  selector: 'tbp-gpx-dialog-user-guide',
  template: `
    <h1 mat-dialog-title>User Guide</h1>
    <div mat-dialog-content>
      <mat-tab-group class="">
        <mat-tab label="Introduction">
          <div class="p-1">
            <span class="me-5"></span>This library is designed to be used to sync gpx files with video.  I will be adding more gpx editing features over time,
            but the primary tools are to identify slow spots in the gpx and adjust the times between points so that
            the gpx file can be synced exactly to the duration of a video recorded at the same time.
          </div>
          <div class="p-1">
            <span class="me-5"></span>When recording videos for virtual running/cycling/rowing, you might start your gps, then camera and finish
            the course by stopping your gps and then camera.  So even initially the gpx time might be slightly longer than
            the video and this must be trimmed.  And of course if you stop at any point for a break, the gpx file stores
            absolute time so the pace at that point might be unusually long.  This tool will help you trim down those
            events so the gpx can be synced with the video.
          </div>
        </mat-tab>
        <mat-tab label="Analysis"></mat-tab>
        <mat-tab label="Editing"></mat-tab>
      </mat-tab-group>
    </div>
    <div mat-dialog-actions>
      <button mat-button [mat-dialog-close]="" cdkFocusInitial>Close</button>
    </div>
  `,
  styles: []
})
export class UserGuideComponent {}
