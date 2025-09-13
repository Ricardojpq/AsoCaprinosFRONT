import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { ApiResponseSuccess, ApiResponseError } from '@core/models/DTOs/api-response';
import {
  MemberDto,
  MemberCreateDto,
  MemberUpdateDto,
  MemberListParamsDto,
  MemberSearchParamsDto,
  MemberStatsDto,
  PaginatedMembersDto
} from '../models/DTOs';

export interface MemberQueryParams {
  ced_socio?: string;
  cod_finca?: number;
  estatus_socio?: string;
  is_active?: boolean;
  global_search?: string;
  per_page?: 10 | 25 | 50 | 100;
  sort_by?: 'ced_socio' | 'cod_finca' | 'estatus_socio' | 'fec_ingreso' | 'created_at';
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
interface MemberListApiResponse {
  status: string;
  message: string;
  data: PaginatedMembersDto;
}

@Injectable({ providedIn: 'root' })
export class MembersService {
  private membersURL: string = `${environment.apiUrl}${environment.apiPrefix}/${environment.apiVersion}/socios`;

  constructor(private httpClient: HttpClient) {}

  private handleError(error: HttpErrorResponse) {
    console.error('MembersService error:', error);
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
      return this.httpClient.post<ApiResponseSuccess<MemberDto>>(this.membersURL, data).pipe(
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

  getMembers$(params: MemberQueryParams): Observable<PaginatedMembersDto> {
    try {
      const queryParams = this.buildQueryParams(params);
      const uri = `${this.membersURL}?${queryParams}`;
      
      return this.httpClient.get<any>(uri).pipe(
        map(res => {
          if (res.status === 'success' && res.message) {
            // The API returns data in 'message' field, not 'data'
            return res.message;
          } else {
            throw new Error('Respuesta inválida del servidor');
          }
        }),
        catchError(this.handleError)
      );
    } catch (e) {
      console.error('Error fetching members', e);
      return of({ current_page: 1, data: [], per_page: 10, total: 0, last_page: 1 });
    }
  }

  /**
   * Obtener socio específico
   */
  getMemberById$(cedSocio: string, codFinca: number): Observable<MemberDto> {
    try {
      const uri = `${this.membersURL}/${cedSocio}/${codFinca}`;
      return this.httpClient.get<ApiResponseSuccess<MemberDto>>(uri).pipe(
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
      return this.httpClient.put<ApiResponseSuccess<MemberDto>>(uri, data).pipe(
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
      return this.httpClient.delete<ApiResponseSuccess>(uri).pipe(
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
   * Buscar socios por criterios
   */
  searchMembers$(params: MemberSearchParams): Observable<MemberDto[]> {
    try {
      let httpParams = new HttpParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.set(key, value as string);
        }
      });

      return this.httpClient.get<ApiResponseSuccess<MemberDto[]>>(`${this.membersURL}/search`, { params: httpParams }).pipe(
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
      return of([]);
    }
  }

  /**
   * Obtener estadísticas de socios
   */
  getMemberStats$(): Observable<MemberStatsDto> {
    try {
      return this.httpClient.get<ApiResponseSuccess<MemberStatsDto>>(`${this.membersURL}/stats`).pipe(
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
