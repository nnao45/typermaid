import { Injectable, signal } from '@angular/core';

export interface ZoomPanState {
  scale: number;
  translateX: number;
  translateY: number;
}

@Injectable({ providedIn: 'root' })
export class ZoomPanService {
  state = signal<ZoomPanState>({
    scale: 1,
    translateX: 0,
    translateY: 0,
  });

  zoom(delta: number): void {
    this.state.update((s) => ({
      ...s,
      scale: Math.max(0.1, Math.min(5, s.scale + delta)),
    }));
  }

  pan(dx: number, dy: number): void {
    this.state.update((s) => ({
      ...s,
      translateX: s.translateX + dx,
      translateY: s.translateY + dy,
    }));
  }

  reset(): void {
    this.state.set({ scale: 1, translateX: 0, translateY: 0 });
  }
}
