import { DestroyRef, Injectable, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent, merge, Observable, timer } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';

export interface SyncOptions {
  /** Intervalo de polling en ms. */
  intervalMs: number;
  /** Ejecutar refresh inmediato al suscribir. */
  immediate?: boolean;
  /** Refresh al volver a primer plano la pestaña. */
  refreshOnFocus?: boolean;
  /** Refresh cuando vuelve la conexión. */
  refreshOnReconnect?: boolean;
}

/**
 * SyncService - Orquesta revalidación de datos contra backend.
 *
 * Estrategias combinadas:
 *  1. Polling con intervalo configurable.
 *  2. Revalidación al volver al foco de la pestaña (Page Visibility API).
 *  3. Revalidación al reconectar (online event).
 *
 * El stream emite "ticks" (number) que el consumidor usa como señal
 * para volver a pedir datos. El consumidor debe hacer el fetch y
 * actualizar su store (no se acopla a ninguna entidad).
 *
 * Uso:
 *   sync.register({ intervalMs: 30000, refreshOnFocus: true })
 *       .subscribe(() => this.loadSeasons());
 *
 * Se auto-desuscribe con el DestroyRef del contexto de inyección.
 */
@Injectable({ providedIn: 'root' })
export class SyncService {
  /**
   * Crea un stream de revalidación. Debe llamarse desde un contexto
   * con DestroyRef (componente o injection context).
   */
  register(options: SyncOptions): Observable<number> {
    const destroyRef = inject(DestroyRef);

    const streams: Observable<number>[] = [];

    // 1. Polling
    streams.push(
      timer(options.immediate === false ? options.intervalMs : 0, options.intervalMs)
    );

    // 2. Focus / visibility
    if (options.refreshOnFocus !== false && typeof document !== 'undefined') {
      streams.push(
        fromEvent(document, 'visibilitychange').pipe(
          filter(() => document.visibilityState === 'visible'),
          map(() => Date.now())
        )
      );
    }

    // 3. Reconnect
    if (options.refreshOnReconnect !== false && typeof window !== 'undefined') {
      streams.push(fromEvent(window, 'online').pipe(map(() => Date.now())));
    }

    return merge(...streams).pipe(takeUntilDestroyed(destroyRef));
  }

  /**
   * Polling de estado de una operación asíncrona backend.
   * Útil para procesos de larga duración que devuelven un operationId.
   *
   * @param check Función que devuelve el estado ('pending'|'completed'|'failed').
   * @param intervalMs Intervalo base.
   * @param maxAttempts Intentos máximos antes de fallar.
   */
  async waitForOperation<T>(
    check: () => Promise<{ status: 'pending' | 'completed' | 'failed'; data?: T; error?: string }>,
    intervalMs = 2000,
    maxAttempts = 60
  ): Promise<T | undefined> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const result = await check();
      if (result.status === 'completed') return result.data;
      if (result.status === 'failed') throw new Error(result.error ?? 'Operación fallida');
      // Backoff suave: min(base*attempt, 10s)
      const wait = Math.min(intervalMs * (1 + attempt * 0.25), 10_000);
      await new Promise(res => setTimeout(res, wait));
    }
    throw new Error('Operación excedió el tiempo máximo de espera');
  }
}
