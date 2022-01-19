import { Directive, ElementRef, Renderer2 } from '@angular/core';
import { GpxSyncService } from '../gpx-sync.service';
import { ActionEvent } from './action-event';
import { timer } from 'rxjs';

@Directive({
  selector: '[flasher]'
})
export class FlasherDirective {

  e1: ActionEvent;

  constructor(private gpxSyncService: GpxSyncService,
              private el: ElementRef,
              private renderer: Renderer2) {}

  ngOnInit(): void {
    this.gpxSyncService.action$.subscribe((e2: ActionEvent) => {
      if (this.e1 && e2 && this.e1.name === e2.name) {
        this.renderer.addClass(this.el.nativeElement, 'flash');
        timer(1000).subscribe(() => {
          this.renderer.removeClass(this.el.nativeElement, 'flash');
        });
      }
      this.e1 = e2;
    });
  }
}
