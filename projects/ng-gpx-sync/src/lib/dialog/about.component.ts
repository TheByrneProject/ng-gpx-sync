import { Component } from '@angular/core';

@Component({
  selector: 'tbp-gpx-dialog-about',
  template: `
    <h1 mat-dialog-title>User Guide</h1>
    <div mat-dialog-content>
      <div class="p-1 d-flex flex-column">
        <div class="d-flex">
          <div class="w-25 label">Author</div><div>The Byrne Project / Michael Byrne</div>
        </div>
        <div class="d-flex">
          <div class="w-25 label">Version</div><div>0.0.1</div>
        </div>
      </div>
    </div>
    <div mat-dialog-actions>
      <button mat-button [mat-dialog-close]="" cdkFocusInitial>Close</button>
    </div>
  `,
  styles: []
})
export class AboutComponent {}
