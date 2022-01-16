import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatMenuModule } from '@angular/material/menu';

import { FileSaverModule } from 'ngx-filesaver';

import { GpxSyncComponent } from './gpx-sync.component';
import { SecondsToTime } from './pipes/s-to-t';
import { GpxSyncService } from './gpx-sync.service';
import { GpxSyncMapComponent } from './components/map.component';
import { GpxSyncTableComponent } from './components/table.component';
import { GpxSyncInfoComponent } from './components/info.component';

@NgModule({
  declarations: [
    GpxSyncComponent,
    GpxSyncInfoComponent,
    GpxSyncMapComponent,
    GpxSyncTableComponent,
    SecondsToTime
  ],
  imports: [
    BrowserAnimationsModule,
    BrowserModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FileSaverModule,
    MatMenuModule,
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
