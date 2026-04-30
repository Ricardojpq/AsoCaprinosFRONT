import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { throwError, timer, TimeoutError as RxTimeoutError } from 'rxjs';
import { catchError, retry, timeout } from 'rxjs/operators';
import {
  AppError,
  BusinessError,
  ConflictError,
  NetworkError,
  TimeoutError,
  ValidationError,
} from '@core/errors/app-errors';
import { NotificationService } from '@core/services/notification.service';

/**
 * Error Interceptor - Centraliza:
 *  - Timeout por request (30s; configurable vía header `X-Timeout-Ms`).
 *  - Retry automático con backoff para errores de red / 5xx (solo GET idempotentes).
 *  - Categorización a AppError (NetworkError, TimeoutError, ValidationError, ConflictError, ...).
 *  - Mensajes de usuario coherentes vía NotificationService (root).
 *
 * No maneja 401: de eso se encarga auth-interceptor.
 * No muestra toast si el request lleva header `X-Skip-Error-Toast: true`.
 */
const DEFAULT_TIMEOUT_MS = 30_000;
const MAX_RETRIES = 2;

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notifications = inject(NotificationService);

  const timeoutHeader = req.headers.get('X-Timeout-Ms');
  const timeoutMs = timeoutHeader ? Number(timeoutHeader) : DEFAULT_TIMEOUT_MS;
  const skipToast = req.headers.get('X-Skip-Error-Toast') === 'true';
  const isIdempotent = req.method === 'GET' || req.method === 'HEAD';

  // Limpiar headers internos antes de enviar
  const cleanReq = req.clone({
    headers: req.headers.delete('X-Timeout-Ms').delete('X-Skip-Error-Toast'),
  });

  return next(cleanReq).pipe(
    timeout(timeoutMs),
    retry({
      count: isIdempotent ? MAX_RETRIES : 0,
      delay: (error, retryIndex) => {
        // Retry sólo para red o 5xx
        const retryable =
          error instanceof RxTimeoutError ||
          (error instanceof HttpErrorResponse && (error.status === 0 || error.status >= 500));
        if (!retryable) return throwError(() => error);
        const backoffMs = Math.min(1000 * Math.pow(2, retryIndex), 8000);
        return timer(backoffMs);
      },
    }),
    catchError(error => {
      const appError = mapToAppError(error, timeoutMs);

      // 401 lo maneja auth-interceptor; no tocar
      if (appError.status === 401) {
        return throwError(() => error);
      }

      if (!skipToast) {
        notifications.notify({
          severity: severityForCategory(appError),
          summary: titleForCategory(appError),
          detail: appError.message,
          life: appError.category === 'network' ? 8000 : 5000,
          sticky: appError.status >= 500,
        });
      }

      return throwError(() => appError);
    })
  );
};

function mapToAppError(error: unknown, timeoutMs: number): AppError {
  if (error instanceof AppError) return error;

  if (error instanceof RxTimeoutError) {
    return new TimeoutError(timeoutMs);
  }

  if (error instanceof HttpErrorResponse) {
    const status = error.status;
    const body: any = error.error;
    const serverMsg = body?.message || body?.error || error.message;

    if (status === 0) {
      return new NetworkError(error);
    }
    if (status === 422) {
      const fields: Record<string, string[]> =
        body?.errors && typeof body.errors === 'object' ? body.errors : {};
      return new ValidationError(fields, serverMsg || 'Datos inválidos', error);
    }
    if (status === 409) {
      const version = error.headers?.get?.('ETag') ?? body?.data?.version ?? undefined;
      return new ConflictError(
        serverMsg || 'El registro fue modificado por otro usuario. Recargue los datos.',
        version ?? undefined,
        error
      );
    }
    if (status === 404) {
      return new AppError('not_found', serverMsg || 'Recurso no encontrado', 404, body, error);
    }
    if (status === 403) {
      return new AppError('forbidden', serverMsg || 'No tiene permisos para esta acción', 403, body, error);
    }
    if (status === 401) {
      return new AppError('unauthorized', serverMsg || 'Sesión expirada', 401, body, error);
    }
    if (status >= 500) {
      return new AppError('server', serverMsg || 'Error del servidor', status, body, error);
    }
    if (status >= 400) {
      return new BusinessError(serverMsg || 'Error de lógica de negocio', status, body, error);
    }
  }

  return new AppError('unknown', 'Error desconocido', 0, error);
}

function severityForCategory(err: AppError): 'error' | 'warn' | 'info' {
  switch (err.category) {
    case 'validation':
    case 'conflict':
    case 'forbidden':
      return 'warn';
    case 'network':
    case 'timeout':
    case 'server':
    case 'unauthorized':
      return 'error';
    default:
      return 'error';
  }
}

function titleForCategory(err: AppError): string {
  switch (err.category) {
    case 'network': return 'Sin conexión';
    case 'timeout': return 'Tiempo agotado';
    case 'validation': return 'Datos inválidos';
    case 'conflict': return 'Conflicto de versión';
    case 'forbidden': return 'Acceso denegado';
    case 'not_found': return 'No encontrado';
    case 'server': return 'Error del servidor';
    case 'business': return 'Operación no permitida';
    default: return 'Error';
  }
}

