/**
 * Jerarquía de errores tipados de la aplicación.
 * Permite diferenciar errores de red, validación, conflicto y timeout
 * en lugar de depender sólo de HttpErrorResponse.status.
 */
import { HttpErrorResponse } from '@angular/common/http';

export type AppErrorCategory =
  | 'network'
  | 'timeout'
  | 'validation'
  | 'conflict'
  | 'forbidden'
  | 'not_found'
  | 'unauthorized'
  | 'server'
  | 'business'
  | 'unknown';

export class AppError extends Error {
  readonly category: AppErrorCategory;
  readonly status: number;
  readonly details?: unknown;
  readonly original?: HttpErrorResponse;

  constructor(
    category: AppErrorCategory,
    message: string,
    status: number,
    details?: unknown,
    original?: HttpErrorResponse
  ) {
    super(message);
    this.name = 'AppError';
    this.category = category;
    this.status = status;
    this.details = details;
    this.original = original;
  }

  get isRetryable(): boolean {
    return this.category === 'network' || this.category === 'timeout' || this.status >= 500;
  }
}

export class NetworkError extends AppError {
  constructor(original?: HttpErrorResponse) {
    super('network', 'Sin conexión con el servidor', 0, undefined, original);
    this.name = 'NetworkError';
  }
}

export class TimeoutError extends AppError {
  constructor(public readonly timeoutMs: number, original?: HttpErrorResponse) {
    super('timeout', `La operación excedió ${timeoutMs}ms`, 0, undefined, original);
    this.name = 'TimeoutError';
  }
}

export class ValidationError extends AppError {
  constructor(
    public readonly fieldErrors: Record<string, string[]>,
    message = 'Datos inválidos',
    original?: HttpErrorResponse
  ) {
    super('validation', message, 422, fieldErrors, original);
    this.name = 'ValidationError';
  }
}

/**
 * Conflict (HTTP 409) - tipicamente por optimistic locking / ETag mismatch.
 * El registro fue modificado por otro usuario/proceso.
 */
export class ConflictError extends AppError {
  constructor(
    message = 'El registro fue modificado por otro usuario. Recargue los datos.',
    public readonly serverVersion?: string,
    original?: HttpErrorResponse
  ) {
    super('conflict', message, 409, serverVersion, original);
    this.name = 'ConflictError';
  }
}

export class BusinessError extends AppError {
  constructor(message: string, status = 422, details?: unknown, original?: HttpErrorResponse) {
    super('business', message, status, details, original);
    this.name = 'BusinessError';
  }
}
