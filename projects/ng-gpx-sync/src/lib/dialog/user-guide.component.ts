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
        <mat-tab label="File Type">
          <div class="p-1">
            <span class="me-5"></span>This works with .gpx files only.  And the gpx must only have one segment.  This is typically
            what you will get when you export a course from Caltopo or strava.
          </div>
          <div class="p-1">
            <span class="me-5"></span>Coming features will allow you to prepend a course or append a course with the desired amount
            of time between.  When saved, this will all become part of one track segment in one .gpx file.
          </div>
        </mat-tab>
        <mat-tab label="Analysis">
          <div class="p-1">
            <span class="me-5"></span>The primary analysis is to identify points with unusually slow paces.  For example, this
            happens if you stop for a break.  If the camera is paused and recording begins in the same spot so the two videos
            can be seamlessly merged in a video editor, the gpx file will show this as a very slow pace since it records
            absolute times (so even if you pause your watch it will still show as break by the .gpx).
          </div>
          <div class="p-1">
            <span class="me-5"></span>The 'Change dt' feature will allow you to change the time between two points to match
            as if you never stopped running.  Gpx stores time to the nearest second, so you have to deal with that limitation.
            As you change the time between points, the feature will show you the new target pace so you can set it appropriately.
          </div>
        </mat-tab>
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
