import { Injectable } from '@angular/core';

/**
 * Servicio simple para manejar el almacenamiento local y construcción de URLs con parámetros
 */
@Injectable({
  providedIn: 'root'
})
export class FincaContextService {
  private readonly STORAGE_KEY = 'selected_finca';

  /**
   * Guarda el cod_finca seleccionado en localStorage
   */
  setSelectedFinca(codFinca: number | null): void {
    if (codFinca !== null) {
      localStorage.setItem(this.STORAGE_KEY, codFinca.toString());
    } else {
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }

  /**
   * Obtiene el cod_finca seleccionado del localStorage
   */
  getSelectedFinca(): number | null {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? parseInt(stored, 10) : null;
  }

  /**
   * Obtiene el cod_finca como string (para URLs)
   */
  getSelectedFincaString(): string | null {
    return localStorage.getItem(this.STORAGE_KEY);
  }

  /**
   * Agrega cod_finca como query parameter a una URL
   * @param url URL base
   * @returns URL con ?cod_finca=X o &cod_finca=X si ya tiene parámetros
   */
  appendFincaToUrl(url: string): string {
    const fincaId = this.getSelectedFinca();
    if (!fincaId) return url;
    
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}cod_finca=${fincaId}`;
  }

  /**
   * Obtiene los parámetros de query para filtrar por finca
   * @returns Objeto con cod_finca si está seleccionada
   */
  getFincaQueryParams(): { cod_finca?: number } {
    const fincaId = this.getSelectedFinca();
    return fincaId ? { cod_finca: fincaId } : {};
  }

  /**
   * Obtiene los parámetros de query como string
   */
  getFincaQueryParamsString(): { cod_finca?: string } {
    const fincaId = this.getSelectedFincaString();
    return fincaId ? { cod_finca: fincaId } : {};
  }

  /**
   * Limpia la finca seleccionada (logout)
   */
  clear(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}
