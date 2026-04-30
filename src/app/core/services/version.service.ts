import { Injectable } from '@angular/core';

/**
 * Registro local de versiones/ETags por recurso para optimistic locking.
 *
 * Flujo:
 * 1. Después de un GET, el version-interceptor guarda la versión recibida
 *    (header ETag o campo `version`/`updated_at` en el body).
 * 2. Antes de un PUT/PATCH/DELETE al mismo recurso, el version-interceptor
 *    añade `If-Match: <version>` automáticamente.
 * 3. Si el backend devuelve 409, se mapea a ConflictError.
 *
 * La key se construye a partir del método + URL del recurso.
 */
@Injectable({ providedIn: 'root' })
export class VersionService {
  private readonly versions = new Map<string, string>();

  setVersion(resourceKey: string, version: string | null | undefined): void {
    if (!version) return;
    this.versions.set(this.normalize(resourceKey), version);
  }

  getVersion(resourceKey: string): string | undefined {
    return this.versions.get(this.normalize(resourceKey));
  }

  invalidate(resourceKey: string): void {
    this.versions.delete(this.normalize(resourceKey));
  }

  clear(): void {
    this.versions.clear();
  }

  /**
   * Normaliza la URL removiendo query params para que la versión
   * guardada en GET /animals/1?include=x sirva también para PUT /animals/1.
   */
  private normalize(url: string): string {
    const qIndex = url.indexOf('?');
    return qIndex >= 0 ? url.substring(0, qIndex) : url;
  }
}
