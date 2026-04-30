import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { tap } from 'rxjs/operators';
import { VersionService } from '@core/services/version.service';

/**
 * Version Interceptor - Optimistic Locking.
 *
 * - En GET: captura `ETag` header (o `data.version` / `data.updated_at`) y lo persiste.
 * - En PUT/PATCH/DELETE: añade `If-Match` con la última versión conocida.
 *
 * El backend debe:
 *   - Responder con header `ETag` en GET de un recurso.
 *   - Validar `If-Match` en escritura y devolver 409 si no coincide.
 *
 * Fallback: si no hay ETag, se intenta usar `data.updated_at` como versión.
 */
export const versionInterceptor: HttpInterceptorFn = (req, next) => {
  const versionService = inject(VersionService);
  const method = req.method.toUpperCase();

  let request = req;

  // Adjuntar If-Match en escrituras si tenemos versión conocida
  if (['PUT', 'PATCH', 'DELETE'].includes(method)) {
    const known = versionService.getVersion(req.url);
    if (known && !req.headers.has('If-Match')) {
      request = req.clone({ setHeaders: { 'If-Match': known } });
    }
  }

  return next(request).pipe(
    tap(event => {
      if (event instanceof HttpResponse && method === 'GET') {
        const etag = event.headers.get('ETag');
        if (etag) {
          versionService.setVersion(req.url, etag);
          return;
        }
        // Fallback: usar updated_at del body como versión
        const body: any = event.body;
        const fallback = body?.data?.updated_at ?? body?.data?.version;
        if (typeof fallback === 'string') {
          versionService.setVersion(req.url, fallback);
        }
      }
    })
  );
};
