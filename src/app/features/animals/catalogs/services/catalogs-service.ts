import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';
import {
  ColorDto,
  RazaDto,
  CondicionCorporalDto,
  TipoPeloDto,
  ColorCreateDto,
  RazaCreateDto,
  CondicionCorporalCreateDto,
  TipoPeloCreateDto,
  ColorUpdateDto,
  RazaUpdateDto,
  CondicionCorporalUpdateDto,
  TipoPeloUpdateDto,
  LaravelPaginationResponse,
  LaravelApiResponse,
  LaravelSingleItemResponse,
  CatalogListResponse
} from '../../../../core/models/DTOs';

// Query parameters interface
export interface CatalogQueryParams {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_dir?: 'asc' | 'desc';
  // Specific search fields for each catalog
  nomb_color?: string; // For colors
  descripcion?: string; // For razas and condicion corporal
  nomb_tipo_pelo?: string; // For tipo pelo
  [key: string]: any;
}

// Re-export DTOs for backward compatibility
export type {
  ColorDto,
  RazaDto,
  CondicionCorporalDto,
  TipoPeloDto,
  ColorCreateDto,
  RazaCreateDto,
  CondicionCorporalCreateDto,
  TipoPeloCreateDto,
  ColorUpdateDto,
  RazaUpdateDto,
  CondicionCorporalUpdateDto,
  TipoPeloUpdateDto,
  CatalogListResponse
};

// Legacy aliases for backward compatibility
export type ApiResponse<T> = LaravelApiResponse<T>;
export type SingleItemResponse<T> = LaravelSingleItemResponse<T>;
export type PaginationLink = import('../../../../core/models/DTOs').PaginationLink;

@Injectable({
  providedIn: 'root'
})
export class CatalogsService {
  private readonly apiUrl = `${environment.apiUrl}/api/v1`;

  constructor(private http: HttpClient) {}

  // ============= COLOR METHODS =============
  getColors$(params?: CatalogQueryParams): Observable<CatalogListResponse<ColorDto>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          httpParams = httpParams.set(key, params[key].toString());
        }
      });
    }
    return this.http.get<ApiResponse<LaravelPaginationResponse<ColorDto>>>(`${this.apiUrl}/color`, { params: httpParams })
      .pipe(
        map(response => ({
          data: response.message.data,
          total: response.message.total,
          per_page: response.message.per_page,
          current_page: response.message.current_page,
          last_page: response.message.last_page,
          from: response.message.from,
          to: response.message.to
        }))
      );
  }

  getColor$(id: number): Observable<ColorDto> {
    return this.http.get<SingleItemResponse<ColorDto>>(`${this.apiUrl}/color/${id}`)
      .pipe(map(response => response.data));
  }

  createColor$(data: ColorCreateDto): Observable<ColorDto> {
    return this.http.post<SingleItemResponse<ColorDto>>(`${this.apiUrl}/color`, data)
      .pipe(map(response => response.data));
  }

  updateColor$(id: number, data: ColorUpdateDto): Observable<ColorDto> {
    return this.http.put<SingleItemResponse<ColorDto>>(`${this.apiUrl}/color/${id}`, data)
      .pipe(map(response => response.data));
  }

  deleteColor$(id: number): Observable<any> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/color/${id}`);
  }

  // ============= RAZA METHODS =============
  getRazas$(params?: CatalogQueryParams): Observable<CatalogListResponse<RazaDto>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          httpParams = httpParams.set(key, params[key].toString());
        }
      });
    }
    return this.http.get<ApiResponse<LaravelPaginationResponse<RazaDto>>>(`${this.apiUrl}/raza`, { params: httpParams })
      .pipe(
        map(response => ({
          data: response.message.data,
          total: response.message.total,
          per_page: response.message.per_page,
          current_page: response.message.current_page,
          last_page: response.message.last_page,
          from: response.message.from,
          to: response.message.to
        }))
      );
  }

  getRaza$(id: number): Observable<RazaDto> {
    return this.http.get<SingleItemResponse<RazaDto>>(`${this.apiUrl}/raza/${id}`)
      .pipe(map(response => response.data));
  }

  createRaza$(data: RazaCreateDto): Observable<RazaDto> {
    return this.http.post<SingleItemResponse<RazaDto>>(`${this.apiUrl}/raza`, data)
      .pipe(map(response => response.data));
  }

  updateRaza$(id: number, data: RazaUpdateDto): Observable<RazaDto> {
    return this.http.put<SingleItemResponse<RazaDto>>(`${this.apiUrl}/raza/${id}`, data)
      .pipe(map(response => response.data));
  }

  deleteRaza$(id: number): Observable<any> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/raza/${id}`);
  }

  // ============= CONDICION CORPORAL METHODS =============
  getCondicionesCorporales$(params?: CatalogQueryParams): Observable<CatalogListResponse<CondicionCorporalDto>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          httpParams = httpParams.set(key, params[key].toString());
        }
      });
    }
    return this.http.get<ApiResponse<LaravelPaginationResponse<CondicionCorporalDto>>>(`${this.apiUrl}/condicion-corporal`, { params: httpParams })
      .pipe(
        map(response => ({
          data: response.message.data,
          total: response.message.total,
          per_page: response.message.per_page,
          current_page: response.message.current_page,
          last_page: response.message.last_page,
          from: response.message.from,
          to: response.message.to
        }))
      );
  }

  getCondicionCorporal$(id: number): Observable<CondicionCorporalDto> {
    return this.http.get<SingleItemResponse<CondicionCorporalDto>>(`${this.apiUrl}/condicion-corporal/${id}`)
      .pipe(map(response => response.data));
  }

  createCondicionCorporal$(data: CondicionCorporalCreateDto): Observable<CondicionCorporalDto> {
    return this.http.post<SingleItemResponse<CondicionCorporalDto>>(`${this.apiUrl}/condicion-corporal`, data)
      .pipe(map(response => response.data));
  }

  updateCondicionCorporal$(id: number, data: CondicionCorporalUpdateDto): Observable<CondicionCorporalDto> {
    return this.http.put<SingleItemResponse<CondicionCorporalDto>>(`${this.apiUrl}/condicion-corporal/${id}`, data)
      .pipe(map(response => response.data));
  }

  deleteCondicionCorporal$(id: number): Observable<any> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/condicion-corporal/${id}`);
  }

  // ============= TIPO PELO METHODS =============
  getTiposPelo$(params?: CatalogQueryParams): Observable<CatalogListResponse<TipoPeloDto>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          httpParams = httpParams.set(key, params[key].toString());
        }
      });
    }
    return this.http.get<ApiResponse<LaravelPaginationResponse<TipoPeloDto>>>(`${this.apiUrl}/tipo-pelo`, { params: httpParams })
      .pipe(
        map(response => ({
          data: response.message.data,
          total: response.message.total,
          per_page: response.message.per_page,
          current_page: response.message.current_page,
          last_page: response.message.last_page,
          from: response.message.from,
          to: response.message.to
        }))
      );
  }

  getTipoPelo$(id: number): Observable<TipoPeloDto> {
    return this.http.get<SingleItemResponse<TipoPeloDto>>(`${this.apiUrl}/tipo-pelo/${id}`)
      .pipe(map(response => response.data));
  }

  createTipoPelo$(data: TipoPeloCreateDto): Observable<TipoPeloDto> {
    return this.http.post<SingleItemResponse<TipoPeloDto>>(`${this.apiUrl}/tipo-pelo`, data)
      .pipe(map(response => response.data));
  }

  updateTipoPelo$(id: number, data: TipoPeloUpdateDto): Observable<TipoPeloDto> {
    return this.http.put<SingleItemResponse<TipoPeloDto>>(`${this.apiUrl}/tipo-pelo/${id}`, data)
      .pipe(map(response => response.data));
  }

  deleteTipoPelo$(id: number): Observable<any> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/tipo-pelo/${id}`);
  }

  // ============= UTILITY METHODS =============
  
  /**
   * Get all colors for dropdown/select components (simplified)
   */
  getAllColors$(): Observable<ColorDto[]> {
    return this.getColors$({ per_page: 100 }).pipe(
      map(response => response.data)
    );
  }

  /**
   * Get all razas for dropdown/select components (simplified)
   */
  getAllRazas$(): Observable<RazaDto[]> {
    return this.getRazas$({ per_page: 100 }).pipe(
      map(response => response.data)
    );
  }

  /**
   * Get all condiciones corporales for dropdown/select components (simplified)
   */
  getAllCondicionesCorporales$(): Observable<CondicionCorporalDto[]> {
    return this.getCondicionesCorporales$({ per_page: 100 }).pipe(
      map(response => response.data)
    );
  }

  /**
   * Get all tipos de pelo for dropdown/select components (simplified)
   */
  getAllTiposPelo$(): Observable<TipoPeloDto[]> {
    return this.getTiposPelo$({ per_page: 100 }).pipe(
      map(response => response.data)
    );
  }
}
