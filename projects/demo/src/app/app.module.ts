import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { GpxSyncModule } from '@thebyrneproject/ng-gpx-sync';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CommonModule,
    GpxSyncModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
