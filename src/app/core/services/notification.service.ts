import { Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';

export type NotificationSeverity = 'success' | 'info' | 'warn' | 'error';

export interface Notification {
  id: number;
  severity: NotificationSeverity;
  summary: string;
  detail?: string;
  life?: number;
  sticky?: boolean;
}

/**
 * Bus global de notificaciones. Desacopla el error-interceptor de PrimeNG
 * y permite que cualquier componente suscriba y renderice (Toast, etc.).
 *
 * Se usa como fuente única para toasts derivados de errores HTTP.
 */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private counter = 0;
  private readonly _stream = new Subject<Notification>();
  readonly stream$ = this._stream.asObservable();

  readonly lastNotification = signal<Notification | null>(null);

  notify(n: Omit<Notification, 'id'>): void {
    const notification: Notification = { id: ++this.counter, life: 5000, ...n };
    this.lastNotification.set(notification);
    this._stream.next(notification);
  }

  success(summary: string, detail?: string): void {
    this.notify({ severity: 'success', summary, detail });
  }

  info(summary: string, detail?: string): void {
    this.notify({ severity: 'info', summary, detail });
  }

  warn(summary: string, detail?: string): void {
    this.notify({ severity: 'warn', summary, detail });
  }

  error(summary: string, detail?: string, sticky = false): void {
    this.notify({ severity: 'error', summary, detail, sticky, life: sticky ? 0 : 8000 });
  }
}
