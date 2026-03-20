import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '@environments/environment';

export interface Modulo {
  id: number;
  modulo: string;
  padre_id: number | null;
  vista: string;
  icon_menu: string | null;
  orden: number;
  hijos?: Modulo[];
}

export interface PerfilModulo {
  idperfil_modulo: number;
  id_perfil: number;
  id_modulo: number;
  puede_ver: boolean;
  puede_crear: boolean;
  puede_editar: boolean;
  puede_eliminar: boolean;
  vista_inicio: number;
  modulo?: Modulo;
}

export interface Perfil {
  id_perfil: number;
  descripcion: string;
  is_active: boolean;
  perfil_modulos?: PerfilModulo[];
}

export interface PerfilPaginationResponse {
  current_page: number;
  data: Perfil[];
  per_page: number;
  total: number;
  last_page: number;
}

export interface ModuloPermiso {
  id_modulo: number;
  puede_ver: boolean;
  puede_crear: boolean;
  puede_editar: boolean;
  puede_eliminar: boolean;
  vista_inicio?: number;
}

@Injectable({
  providedIn: 'root'
})
export class PerfilesService {
  private apiUrl = environment.apiUrl;
  private httpClient = inject(HttpClient);

  /**
   * Obtener lista de perfiles paginada
   */
  getPerfiles(page: number = 1, perPage: number = 10, search?: string): Observable<PerfilPaginationResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('per_page', perPage.toString());

    if (search) {
      params = params.set('search', search);
    }

    return this.httpClient.get<{ status: string; data: PerfilPaginationResponse }>(
      `${this.apiUrl}/api/v1/perfiles`,
      { params }
    ).pipe(
      map(res => res.data)
    );
  }

  /**
   * Obtener un perfil específico con sus módulos
   */
  getPerfil(id: number): Observable<Perfil> {
    return this.httpClient.get<{ status: string; data: Perfil }>(
      `${this.apiUrl}/api/v1/perfiles/${id}`
    ).pipe(
      map(res => res.data)
    );
  }

  /**
   * Obtener permisos de un perfil
   */
  getPermisos(id: number): Observable<{ perfil: Perfil; permisos: PerfilModulo[] }> {
    return this.httpClient.get<{ status: string; data: { perfil: Perfil; permisos: PerfilModulo[] } }>(
      `${this.apiUrl}/api/v1/perfiles/${id}/permisos`
    ).pipe(
      map(res => res.data)
    );
  }

  /**
   * Obtener todos los módulos en estructura de árbol
   */
  getModulos(): Observable<Modulo[]> {
    return this.httpClient.get<{ status: string; data: Modulo[] }>(
      `${this.apiUrl}/api/v1/perfiles/modulos`
    ).pipe(
      map(res => res.data)
    );
  }

  /**
   * Obtener todos los módulos en estructura plana
   */
  getModulosFlat(): Observable<Modulo[]> {
    return this.httpClient.get<{ status: string; data: Modulo[] }>(
      `${this.apiUrl}/api/v1/perfiles/modulos-flat`
    ).pipe(
      map(res => res.data)
    );
  }

  /**
   * Crear un nuevo perfil
   */
  createPerfil(descripcion: string): Observable<Perfil> {
    return this.httpClient.post<{ status: string; data: Perfil }>(
      `${this.apiUrl}/api/v1/perfiles`,
      { descripcion }
    ).pipe(
      map(res => res.data)
    );
  }

  /**
   * Actualizar un perfil
   */
  updatePerfil(id: number, descripcion: string): Observable<Perfil> {
    return this.httpClient.put<{ status: string; data: Perfil }>(
      `${this.apiUrl}/api/v1/perfiles/${id}`,
      { descripcion }
    ).pipe(
      map(res => res.data)
    );
  }

  /**
   * Actualizar permisos de un perfil
   */
  updatePermisos(id: number, modulos: ModuloPermiso[]): Observable<Perfil> {
    return this.httpClient.put<{ status: string; data: Perfil }>(
      `${this.apiUrl}/api/v1/perfiles/${id}/permisos`,
      { modulos }
    ).pipe(
      map(res => res.data)
    );
  }

  /**
   * Eliminar un perfil
   */
  deletePerfil(id: number): Observable<void> {
    return this.httpClient.delete<{ status: string }>(
      `${this.apiUrl}/api/v1/perfiles/${id}`
    ).pipe(
      map(() => void 0)
    );
  }
}
