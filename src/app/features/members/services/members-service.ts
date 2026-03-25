import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { LaravelApiResponse, LaravelSingleItemResponse, LaravelPaginationResponse } from '../../../core/models/DTOs';
import {
  MemberDto,
  MemberCreateDto,
  MemberUpdateDto,
  MemberListParamsDto,
  MemberSearchParamsDto,
  MemberStatsDto
} from '../models/DTOs';

export interface MemberQueryParams {
  ced_socio?: string;
  cod_finca?: number;
  estatus_socio?: string;
  is_active?: boolean;
  global_search?: string;
  per_page?: 10 | 25 | 50 | 100;
  sort_by?: 'ced_socio' | 'cod_finca' | 'estatus_socio' | 'fec_ingreso' | 'created_at' | 'nom_persona' | 'ape_persona' | 'tel_persona' | 'email_persona';
  sort_dir?: 'asc' | 'desc';
  page?: number;
  [key: string]: any;
}

export interface MemberSearchParams {
  ced_socio?: string;
  cod_finca?: number;
  estatus_socio?: string;
  is_active?: boolean;
  [key: string]: any;
}

// Tipo para la respuesta real del backend

@Injectable({ providedIn: 'root' })
export class MembersService {
  private membersURL: string = `${environment.apiUrl}${environment.apiPrefix}/${environment.apiVersion}/socios`;

  constructor(private httpClient: HttpClient) {}

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Error desconocido';
    let errorDetails: any = null;
    
    if (error.error && error.error.message) {
      errorMessage = error.error.message;
    }
    
    if (error.error && error.error.errors) {
      errorDetails = error.error.errors;
    }
    
    if (error.status === 422) {
      errorMessage = 'Datos de entrada inválidos';
      if (error.error && error.error.errors) {
        errorDetails = error.error.errors;
      }
    } else if (error.status === 404) {
      errorMessage = 'Recurso no encontrado';
      if (error.error && error.error.detail) {
        errorDetails = { detail: error.error.detail };
      }
    } else if (error.status === 409) {
      errorMessage = 'El socio ya existe';
      if (error.error && error.error.detail) {
        errorDetails = { detail: error.error.detail };
      }
    } else if (error.status === 401) {
      errorMessage = 'No autorizado';
    } else if (error.status === 403) {
      errorMessage = 'Acceso denegado';
    } else if (error.status === 500) {
      errorMessage = 'Error del servidor';
      if (error.error && error.error.detail) {
        errorDetails = { detail: error.error.detail };
      }
    }
    
    return throwError(() => ({ 
      message: errorMessage, 
      details: errorDetails,
      status: error.status 
    }));
  }

  /**
   * Crear nuevo socio
   */
  addMember$(data: MemberCreateDto): Observable<MemberDto> {
    try {
      return this.httpClient.post<LaravelSingleItemResponse<MemberDto>>(this.membersURL, data).pipe(
        map(res => {
          if (res.status === 'success' && res.data) {
            return res.data;
          } else {
            throw new Error('Respuesta inválida del servidor');
          }
        }),
        catchError(this.handleError)
      );
    } catch (e) {
      console.error('Error adding member', e);
      return throwError(() => new Error('Error al agregar socio'));
    }
  }

  /**
   * Obtener lista paginada de socios
   */
  private buildQueryParams(params: MemberQueryParams): string {
    let httpParams = new HttpParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        httpParams = httpParams.set(key, value.toString());
      }
    });
    return httpParams.toString();
  }

  getMembers$(params: MemberQueryParams): Observable<LaravelPaginationResponse<MemberDto>> {
    try {
      const queryParams = this.buildQueryParams(params);
      const uri = `${this.membersURL}?${queryParams}`;
      
      return this.httpClient.get<LaravelApiResponse<MemberDto>>(uri).pipe(
        map(res => {
          if (res.status === 'success' && res.data) {
            return res.data;
          } else {
            throw new Error('Respuesta inválida del servidor');
          }
        }),
        catchError(this.handleError)
      );
    } catch (e) {
      console.error('Error fetching members', e);
      return of({
        current_page: 1,
        data: [],
        per_page: 10,
        total: 0,
        first_page_url: '',
        from: 0,
        last_page: 1,
        last_page_url: '',
        links: [],
        next_page_url: null,
        path: '',
        prev_page_url: null,
        to: 0
      });
    }
  }

  /**
   * Obtener socio específico
   */
  getMemberById$(cedSocio: string, codFinca: number): Observable<MemberDto> {
    try {
      const uri = `${this.membersURL}/${cedSocio}/${codFinca}`;
      return this.httpClient.get<LaravelSingleItemResponse<MemberDto>>(uri).pipe(
        map(res => {
          if (res.status === 'success' && res.data) {
            return res.data;
          } else {
            throw new Error('Respuesta inválida del servidor');
          }
        }),
        catchError(this.handleError)
      );
    } catch (e) {
      console.error('Error fetching member', e);
      return throwError(() => new Error('Error al obtener socio'));
    }
  }

  /**
   * Actualizar socio existente
   */
  updateMember$(cedSocio: string, data: MemberUpdateDto, codFinca: number = 1): Observable<MemberDto> {
    try {
      const uri = `${this.membersURL}/${cedSocio}/${codFinca}`;
      return this.httpClient.put<LaravelSingleItemResponse<MemberDto>>(uri, data).pipe(
        map(res => {
          if (res.status === 'success' && res.data) {
            return res.data;
          } else {
            throw new Error('Respuesta inválida del servidor');
          }
        }),
        catchError(this.handleError)
      );
    } catch (e) {
      console.error('Error updating member', e);
      return throwError(() => new Error('Error al actualizar socio'));
    }
  }

  /**
   * Eliminar socio
   */
  deleteMember$(cedSocio: string, codFinca: number = 1): Observable<any> {
    try {
      const uri = `${this.membersURL}/${cedSocio}/${codFinca}`;
      return this.httpClient.delete<LaravelApiResponse<any>>(uri).pipe(
        map(res => {
          if (res.status === 'success') {
            return res;
          } else {
            throw new Error('Respuesta inválida del servidor');
          }
        }),
        catchError(this.handleError)
      );
    } catch (e) {
      console.error('Error deleting member', e);
      return throwError(() => new Error('Error al eliminar socio'));
    }
  }

  /**
   * Busca socios por texto (cédula, nombre, apellido, email)
   */
  searchMembers(searchTerm: string, perPage: number = 25): Observable<LaravelPaginationResponse<MemberDto>> {
    const params = new HttpParams()
      .set('q', searchTerm)
      .set('per_page', perPage.toString());

    return this.httpClient.get<LaravelApiResponse<MemberDto>>(`${this.membersURL}/search`, { params })
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  /**
   * Buscar socios por criterios
   */
  searchMembers$(params: MemberSearchParams): Observable<LaravelPaginationResponse<MemberDto>> {
    try {
      let httpParams = new HttpParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.set(key, value as string);
        }
      });

      return this.httpClient.get<LaravelApiResponse<MemberDto>>(`${this.membersURL}/search`, { params: httpParams }).pipe(
        map(res => {
          if (res.status === 'success' && res.data) {
            return res.data;
          } else {
            throw new Error('Respuesta inválida del servidor');
          }
        }),
        catchError(this.handleError)
      );
    } catch (e) {
      console.error('Error searching members', e);
      return of({
        current_page: 1,
        data: [],
        per_page: 10,
        total: 0,
        first_page_url: '',
        from: 0,
        last_page: 1,
        last_page_url: '',
        links: [],
        next_page_url: null,
        path: '',
        prev_page_url: null,
        to: 0
      });
    }
  }

  /**
   * Obtener estadísticas de socios
   */
  getMemberStats$(): Observable<MemberStatsDto> {
    try {
      return this.httpClient.get<LaravelSingleItemResponse<MemberStatsDto>>(`${this.membersURL}/stats`).pipe(
        map(res => {
          if (res.status === 'success' && res.data) {
            return res.data;
          } else {
            throw new Error('Respuesta inválida del servidor');
          }
        }),
        catchError(this.handleError)
      );
    } catch (e) {
      console.error('Error fetching member stats', e);
      return throwError(() => new Error('Error al obtener estadísticas'));
    }
  }
}
