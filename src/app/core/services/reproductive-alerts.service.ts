import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { interval, Subscription } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { FarmContextService } from './farm-context.service';
import { environment } from '../../../environments/environment';

export interface ReproductiveAlert {
  tipo: 'PARTO_PROXIMO' | 'DESTETE_PROXIMO' | 'DX_PENDIENTE' | 'CRIAS_SIN_TATUAR';
  mensaje: string;
  count: number;
  severity: 'warn' | 'error' | 'info';
  ruta?: string;
}

const POLL_INTERVAL_MS = 5 * 60 * 1000; // 5 minutos

@Injectable({ providedIn: 'root' })
export class ReproductiveAlertsService {
  private http = inject(HttpClient);
  private farmContext = inject(FarmContextService);
  private apiUrl = `${environment.apiUrl}/api/v1`;

  readonly alerts = signal<ReproductiveAlert[]>([]);
  readonly totalCount = signal<number>(0);

  private poller?: Subscription;

  startPolling(): void {
    if (this.poller) return;
    this.fetch();
    this.poller = interval(POLL_INTERVAL_MS).pipe(
      switchMap(() => this.fetchAlerts$())
    ).subscribe(alerts => this.setAlerts(alerts));
  }

  stopPolling(): void {
    this.poller?.unsubscribe();
    this.poller = undefined;
  }

  fetch(): void {
    this.fetchAlerts$().subscribe(alerts => this.setAlerts(alerts));
  }

  private fetchAlerts$() {
    const farmId = this.farmContext.getSelectedFarm();
    if (!farmId) return of([]);

    return this.http.get<{ data: any }>(`${this.apiUrl}/reproduccion/dashboard?cod_finca=${farmId}`).pipe(
      switchMap(res => {
        const data = res.data;
        const alerts: ReproductiveAlert[] = [];

        const partosProximos = (data?.proximos_eventos as any[])?.filter(e => e.tipo === 'PARTO_PROXIMO').length ?? 0;
        if (partosProximos > 0) {
          alerts.push({
            tipo: 'PARTO_PROXIMO',
            mensaje: `${partosProximos} parto${partosProximos > 1 ? 's' : ''} en los próximos 15 días`,
            count: partosProximos,
            severity: 'warn',
            ruta: '/reproduccion/partos',
          });
        }

        const destetesProximos = (data?.proximos_eventos as any[])?.filter(e => e.tipo === 'DESTETE_PROXIMO').length ?? 0;
        if (destetesProximos > 0) {
          alerts.push({
            tipo: 'DESTETE_PROXIMO',
            mensaje: `${destetesProximos} cría${destetesProximos > 1 ? 's' : ''} próxima${destetesProximos > 1 ? 's' : ''} a destete`,
            count: destetesProximos,
            severity: 'info',
            ruta: '/reproduccion/lactancia',
          });
        }

        const sinTatuar = data?.crias?.sinTatuar ?? 0;
        if (sinTatuar > 0) {
          alerts.push({
            tipo: 'CRIAS_SIN_TATUAR',
            mensaje: `${sinTatuar} cría${sinTatuar > 1 ? 's' : ''} pendiente${sinTatuar > 1 ? 's' : ''} de tatuar`,
            count: sinTatuar,
            severity: 'info',
            ruta: '/reproduccion/tatuar-crias',
          });
        }

        return of(alerts);
      }),
      catchError(() => of([] as ReproductiveAlert[]))
    );
  }

  private setAlerts(alerts: ReproductiveAlert[]): void {
    this.alerts.set(alerts);
    this.totalCount.set(alerts.reduce((s, a) => s + a.count, 0));
  }
}
