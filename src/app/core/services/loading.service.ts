import { Injectable, signal, Signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private loadingSignal = signal(false);

  show() {
    this.loadingSignal.set(true);
  }

  hide() {
    this.loadingSignal.set(false);
  }

  get loading(): Signal<boolean> {
    return this.loadingSignal;
  }
} 