import { computed, signal } from '@angular/core';

export interface EntityStateSnapshot<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
  version: number;
}

/**
 * Base genérica para stores de entidades.
 *
 * - `isStale(ms)` signal: true si los datos superan el TTL configurado.
 *   Usar en conjunto con SyncService para auto-refresh.
 * - `version`: contador incremental para invalidar caches/derivados.
 * - No impone modelo de ID; las subclases definen helpers específicos.
 */
export abstract class BaseEntityState<T> {
  protected readonly _snapshot = signal<EntityStateSnapshot<T>>({
    data: [],
    loading: false,
    error: null,
    lastUpdated: null,
    version: 0,
  });

  readonly snapshot = this._snapshot.asReadonly();
  readonly data = computed(() => this._snapshot().data);
  readonly loading = computed(() => this._snapshot().loading);
  readonly error = computed(() => this._snapshot().error);
  readonly lastUpdated = computed(() => this._snapshot().lastUpdated);
  readonly version = computed(() => this._snapshot().version);

  /**
   * TTL por defecto (ms) tras el cual los datos son considerados obsoletos.
   * Las subclases pueden sobreescribir.
   */
  protected readonly staleTtlMs: number = 5 * 60 * 1000;

  readonly isStale = computed(() => {
    const last = this._snapshot().lastUpdated;
    if (last === null) return true;
    return Date.now() - last > this.staleTtlMs;
  });

  setLoading(loading: boolean): void {
    this._snapshot.update(s => ({ ...s, loading }));
  }

  setData(data: T[]): void {
    this._snapshot.update(s => ({
      ...s,
      data,
      loading: false,
      error: null,
      lastUpdated: Date.now(),
      version: s.version + 1,
    }));
  }

  setError(error: string | null): void {
    this._snapshot.update(s => ({ ...s, error, loading: false }));
  }

  invalidate(): void {
    this._snapshot.update(s => ({ ...s, lastUpdated: null }));
  }

  reset(): void {
    this._snapshot.set({
      data: [],
      loading: false,
      error: null,
      lastUpdated: null,
      version: 0,
    });
  }

  /**
   * Contrato para que la subclase implemente la recarga desde el servicio.
   */
  abstract refresh(): void;
}
