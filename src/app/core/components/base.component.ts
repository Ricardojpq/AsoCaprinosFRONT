import { Directive, DestroyRef, inject, OnDestroy } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MonoTypeOperatorFunction, Subject } from 'rxjs';

/**
 * BaseComponent - Elimina memory leaks mediante manejo automático de suscripciones.
 *
 * Uso recomendado (Angular 16+):
 *   obs$.pipe(this.untilDestroyed()).subscribe(...)
 *
 * Uso legacy:
 *   obs$.pipe(takeUntil(this.destroy$)).subscribe(...)
 *
 * Se completa automáticamente el Subject cuando el componente se destruye.
 */
@Directive()
export abstract class BaseComponent implements OnDestroy {
  protected readonly destroyRef = inject(DestroyRef);
  protected readonly destroy$ = new Subject<void>();

  /**
   * Operador que auto-desuscribe al destruir el componente.
   * Preferido sobre takeUntil(destroy$) en código nuevo.
   */
  protected untilDestroyed<T>(): MonoTypeOperatorFunction<T> {
    return takeUntilDestroyed<T>(this.destroyRef);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
