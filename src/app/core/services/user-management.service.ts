import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface Usuario {
  id_usuario: number;
  nombre_usuario: string;
  apellido_usuario: string;
  email: string;
  id_perfil_usuario: number;
  cod_finca?: number;
  is_active: boolean;
  is_deleted: boolean;
  created_at?: string;
  updated_at?: string;
  perfil?: {
    id_perfil: number;
    descripcion: string;
  };
  fincas?: FincaAsignada[];
}

export interface FincaAsignada {
  cod_finca: number;
  nomb_finca: string;
  pivot?: {
    es_finca_principal: boolean;
  };
}

export interface Perfil {
  id_perfil: number;
  descripcion: string;
}

export interface FincaDisponible {
  cod_finca: number;
  nomb_finca: string;
  ide_finca?: string;
}

export interface CreateUserRequest {
  nombre_usuario: string;
  apellido_usuario: string;
  email: string;
  password: string;
  id_perfil_usuario: number;
  fincas?: number[];
  finca_principal?: number;
}

export interface UpdateUserRequest {
  nombre_usuario?: string;
  apellido_usuario?: string;
  email?: string;
  id_perfil_usuario?: number;
  is_active?: boolean;
  fincas?: number[];
  finca_principal?: number;
}

export interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  per_page: number;
  total: number;
  last_page: number;
}

export interface PermisosPagina {
  pagina: string;
  descripcion: string;
  puede_ver: boolean;
  puede_crear: boolean;
  puede_editar: boolean;
  puede_eliminar: boolean;
  is_active: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UserManagementService {
  private baseUrl = `${environment.apiUrl}${environment.apiPrefix}/${environment.apiVersion}`;

  constructor(private http: HttpClient) {}

  /**
   * Listar usuarios con paginación y filtros
   */
  getUsers(params?: {
    page?: number;
    per_page?: number;
    search?: string;
    perfil_id?: number;
    is_active?: boolean;
  }): Observable<PaginatedResponse<Usuario>> {
    let httpParams = new HttpParams();
    
    if (params) {
      if (params.page) httpParams = httpParams.set('page', params.page.toString());
      if (params.per_page) httpParams = httpParams.set('per_page', params.per_page.toString());
      if (params.search) httpParams = httpParams.set('search', params.search);
      if (params.perfil_id) httpParams = httpParams.set('perfil_id', params.perfil_id.toString());
      if (params.is_active !== undefined) httpParams = httpParams.set('is_active', params.is_active.toString());
    }

    return this.http.get<{ status: string; data: PaginatedResponse<Usuario> }>(
      `${this.baseUrl}/users`,
      { params: httpParams }
    ).pipe(map(response => response.data));  
  }

  /**
   * Obtener un usuario por ID
   */
  getUser(id: number): Observable<{ usuario: Usuario; permisos: any }> {
    return this.http.get<{ status: string; data: { usuario: Usuario; permisos: any } }>(
      `${this.baseUrl}/users/${id}`
    ).pipe(map(response => response.data));
  }

  /**
   * Crear un nuevo usuario
   */
  createUser(data: CreateUserRequest): Observable<Usuario> {
    return this.http.post<{ status: string; data: { usuario: Usuario } }>(
      `${this.baseUrl}/users`,
      data
    ).pipe(map(response => response.data.usuario));
  }

  /**
   * Actualizar un usuario
   */
  updateUser(id: number, data: UpdateUserRequest): Observable<Usuario> {
    return this.http.put<{ status: string; data: { usuario: Usuario } }>(
      `${this.baseUrl}/users/${id}`,
      data
    ).pipe(map(response => response.data.usuario));
  }

  /**
   * Desactivar un usuario (soft delete)
   */
  deleteUser(id: number): Observable<void> {
    return this.http.delete<{ status: string }>(
      `${this.baseUrl}/users/${id}`
    ).pipe(map(() => undefined));
  }

  /**
   * Reactivar un usuario
   */
  reactivateUser(id: number): Observable<Usuario> {
    return this.http.post<{ status: string; data: { usuario: Usuario } }>(
      `${this.baseUrl}/users/${id}/reactivate`,
      {}
    ).pipe(map(response => response.data.usuario));
  }

  /**
   * Resetear contraseña de un usuario
   */
  resetPassword(id: number): Observable<{ temp_password: string; message: string }> {
    return this.http.post<{ status: string; data: { temp_password: string; message: string } }>(
      `${this.baseUrl}/users/${id}/reset-password`,
      {}
    ).pipe(map(response => response.data));
  }

  /**
   * Asignar fincas a un usuario
   */
  assignFincas(id: number, fincas: number[], finca_principal?: number): Observable<Usuario> {
    return this.http.post<{ status: string; data: { usuario: Usuario } }>(
      `${this.baseUrl}/users/${id}/fincas`,
      { fincas, finca_principal }
    ).pipe(map(response => response.data.usuario));
  }

  /**
   * Obtener lista de perfiles disponibles
   */
  getPerfiles(): Observable<Perfil[]> {
    return this.http.get<{ status: string; data: { perfiles: Perfil[] } }>(
      `${this.baseUrl}/users/perfiles`
    ).pipe(map(response => response.data.perfiles));
  }

  /**
   * Obtener lista de fincas disponibles
   */
  getFincasDisponibles(): Observable<FincaDisponible[]> {
    return this.http.get<{ status: string; data: { fincas: FincaDisponible[] } }>(
      `${this.baseUrl}/users/fincas-disponibles`
    ).pipe(map(response => response.data.fincas));
  }

  /**
   * Obtener permisos de un usuario
   */
  getUserPermissions(userId: number): Observable<{ usuario: any; permisos: PermisosPagina[] }> {
    return this.http.get<{ status: string; data: { usuario: any; permisos: PermisosPagina[] } }>(
      `${this.baseUrl}/permissions/user/${userId}`
    ).pipe(map(response => response.data));
  }

  /**
   * Asignar permisos a un usuario
   */
  setUserPermissions(userId: number, permisos: PermisosPagina[]): Observable<any> {
    return this.http.post<{ status: string; data: any }>(
      `${this.baseUrl}/permissions/user/${userId}`,
      { permisos }
    ).pipe(map(response => response.data));
  }

  /**
   * Obtener páginas disponibles
   */
  getAvailablePages(): Observable<{ pagina: string; descripcion: string }[]> {
    return this.http.get<{ status: string; data: { paginas: { pagina: string; descripcion: string }[] } }>(
      `${this.baseUrl}/permissions/pages`
    ).pipe(map(response => response.data.paginas));
  }
}
