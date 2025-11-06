import { Directive, ElementRef, HostListener, Input, inject } from '@angular/core';
import { ZoomPanService } from '../services/zoom-pan.service';

@Directive({
  selector: '[lyricZoomPan]',
  standalone: true,
})
export class ZoomPanDirective {
  @Input() enabled = true;

  private isPanning = false;
  private startX = 0;
  private startY = 0;

  private el = inject(ElementRef<SVGSVGElement>);
  private zoomPanService = inject(ZoomPanService);

  @HostListener('wheel', ['$event'])
  onWheel(event: WheelEvent): void {
    if (!this.enabled) return;
    event.preventDefault();

    const delta = -event.deltaY * 0.001;
    this.zoomPanService.zoom(delta);
    this.updateTransform();
  }

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent): void {
    if (!this.enabled) return;
    this.isPanning = true;
    this.startX = event.clientX;
    this.startY = event.clientY;
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (!this.isPanning) return;

    const dx = event.clientX - this.startX;
    const dy = event.clientY - this.startY;

    this.zoomPanService.pan(dx, dy);
    this.updateTransform();

    this.startX = event.clientX;
    this.startY = event.clientY;
  }

  @HostListener('document:mouseup')
  onMouseUp(): void {
    this.isPanning = false;
  }

  private updateTransform(): void {
    const state = this.zoomPanService.state();
    const g = this.el.nativeElement.querySelector('g');
    if (g) {
      g.setAttribute(
        'transform',
        `translate(${state.translateX}, ${state.translateY}) scale(${state.scale})`
      );
    }
  }
}
