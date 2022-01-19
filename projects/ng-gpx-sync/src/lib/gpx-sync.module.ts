import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { FileSaverModule } from 'ngx-filesaver';

import { GpxSyncComponent } from './gpx-sync.component';
import { SecondsToTime } from './pipes/s-to-t';
import { GpxSyncService } from './gpx-sync.service';
import { GpxSyncOpenLayersComponent } from './components/openlayers.component';
import { GpxSyncTableComponent } from './components/table.component';
import { GpxSyncInfoComponent } from './components/info.component';
import { GpxSyncAnalysisComponent } from './components/analysis.component';
import { GpxSyncMapComponent } from './components/map.component';
import { UserGuideComponent } from './dialog/user-guide.component';
import { AboutComponent } from './dialog/about.component';
import { ChangeDtComponent } from './actions/change-dt.component';
import { CompressComponent } from './actions/compress.component';
import { UpdatePointComponent } from './actions/update-point.component';
import { GpxSyncActionComponent } from './components/action.component';
import { FlasherDirective } from './event/flasher.directive';

@NgModule({
  declarations: [
    GpxSyncComponent,
    GpxSyncAnalysisComponent,
    GpxSyncInfoComponent,
    GpxSyncMapComponent,
    GpxSyncOpenLayersComponent,
    GpxSyncTableComponent,
    SecondsToTime,
    AboutComponent,
    UserGuideComponent,
    ChangeDtComponent,
    CompressComponent,
    UpdatePointComponent,
    GpxSyncActionComponent,
    FlasherDirective
  ],
  imports: [
    BrowserAnimationsModule,
    BrowserModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FileSaverModule,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTableModule,
    MatTabsModule
  ],
  providers: [
    GpxSyncService
  ],
  exports: [
    GpxSyncComponent
  ]
})
export class GpxSyncModule { }
