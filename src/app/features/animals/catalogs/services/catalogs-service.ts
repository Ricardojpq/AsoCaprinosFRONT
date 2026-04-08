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
  LaravelSingleItemResponse
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


@Injectable({
  providedIn: 'root'
})
export class CatalogsService {
  private readonly apiUrl = `${environment.apiUrl}/api/v1`;

  constructor(private http: HttpClient) {}

  // ============= COLOR METHODS =============
  getColors$(params?: CatalogQueryParams): Observable<LaravelPaginationResponse<ColorDto>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          httpParams = httpParams.set(key, params[key].toString());
        }
      });
    }
    return this.http.get<LaravelApiResponse<ColorDto>>(`${this.apiUrl}/color`, { params: httpParams })
      .pipe(
        map(response => response.data)
      );
  }

  getColor$(id: number): Observable<ColorDto> {
    return this.http.get<LaravelSingleItemResponse<ColorDto>>(`${this.apiUrl}/color/${id}`)
      .pipe(map(response => response.data));
  }

  createColor$(data: ColorCreateDto): Observable<ColorDto> {
    return this.http.post<LaravelSingleItemResponse<ColorDto>>(`${this.apiUrl}/color`, data)
      .pipe(map(response => response.data));
  }

  updateColor$(id: number, data: ColorUpdateDto): Observable<ColorDto> {
    return this.http.put<LaravelSingleItemResponse<ColorDto>>(`${this.apiUrl}/color/${id}`, data)
      .pipe(map(response => response.data));
  }

  deleteColor$(id: number): Observable<any> {
    return this.http.delete<LaravelApiResponse<any>>(`${this.apiUrl}/color/${id}`);
  }

  // ============= RAZA METHODS =============
  getBreeds$(params?: CatalogQueryParams): Observable<LaravelPaginationResponse<RazaDto>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          httpParams = httpParams.set(key, params[key].toString());
        }
      });
    }
    return this.http.get<LaravelApiResponse<RazaDto>>(`${this.apiUrl}/raza`, { params: httpParams })
      .pipe(
        map(response => response.data)
      );
  }

  getBreed$(id: number): Observable<RazaDto> {
    return this.http.get<LaravelSingleItemResponse<RazaDto>>(`${this.apiUrl}/raza/${id}`)
      .pipe(map(response => response.data));
  }

  createBreed$(data: RazaCreateDto): Observable<RazaDto> {
    return this.http.post<LaravelSingleItemResponse<RazaDto>>(`${this.apiUrl}/raza`, data)
      .pipe(map(response => response.data));
  }

  updateBreed$(id: number, data: RazaUpdateDto): Observable<RazaDto> {
    return this.http.put<LaravelSingleItemResponse<RazaDto>>(`${this.apiUrl}/raza/${id}`, data)
      .pipe(map(response => response.data));
  }

  deleteBreed$(id: number): Observable<any> {
    return this.http.delete<LaravelApiResponse<any>>(`${this.apiUrl}/raza/${id}`);
  }

  // ============= CONDICION CORPORAL METHODS =============
  getBodyConditions$(params?: CatalogQueryParams): Observable<LaravelPaginationResponse<CondicionCorporalDto>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          httpParams = httpParams.set(key, params[key].toString());
        }
      });
    }
    return this.http.get<LaravelApiResponse<CondicionCorporalDto>>(`${this.apiUrl}/condicion-corporal`, { params: httpParams })
      .pipe(
        map(response => response.data)
      );
  }

  getBodyCondition$(id: number): Observable<CondicionCorporalDto> {
    return this.http.get<LaravelSingleItemResponse<CondicionCorporalDto>>(`${this.apiUrl}/condicion-corporal/${id}`)
      .pipe(map(response => response.data));
  }

  createBodyCondition$(data: CondicionCorporalCreateDto): Observable<CondicionCorporalDto> {
    return this.http.post<LaravelSingleItemResponse<CondicionCorporalDto>>(`${this.apiUrl}/condicion-corporal`, data)
      .pipe(map(response => response.data));
  }

  updateBodyCondition$(id: number, data: CondicionCorporalUpdateDto): Observable<CondicionCorporalDto> {
    return this.http.put<LaravelSingleItemResponse<CondicionCorporalDto>>(`${this.apiUrl}/condicion-corporal/${id}`, data)
      .pipe(map(response => response.data));
  }

  deleteBodyCondition$(id: number): Observable<any> {
    return this.http.delete<LaravelApiResponse<any>>(`${this.apiUrl}/condicion-corporal/${id}`);
  }

  // ============= TIPO PELO METHODS =============
  getHairTypes$(params?: CatalogQueryParams): Observable<LaravelPaginationResponse<TipoPeloDto>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          httpParams = httpParams.set(key, params[key].toString());
        }
      });
    }
    return this.http.get<LaravelApiResponse<TipoPeloDto>>(`${this.apiUrl}/tipo-pelo`, { params: httpParams })
      .pipe(
        map(response => response.data)
      );
  }

  getHairType$(id: number): Observable<TipoPeloDto> {
    return this.http.get<LaravelSingleItemResponse<TipoPeloDto>>(`${this.apiUrl}/tipo-pelo/${id}`)
      .pipe(map(response => response.data));
  }

  createHairType$(data: TipoPeloCreateDto): Observable<TipoPeloDto> {
    return this.http.post<LaravelSingleItemResponse<TipoPeloDto>>(`${this.apiUrl}/tipo-pelo`, data)
      .pipe(map(response => response.data));
  }

  updateHairType$(id: number, data: TipoPeloUpdateDto): Observable<TipoPeloDto> {
    return this.http.put<LaravelSingleItemResponse<TipoPeloDto>>(`${this.apiUrl}/tipo-pelo/${id}`, data)
      .pipe(map(response => response.data));
  }

  deleteHairType$(id: number): Observable<any> {
    return this.http.delete<LaravelApiResponse<any>>(`${this.apiUrl}/tipo-pelo/${id}`);
  }

  // ============= UTILITY METHODS =============
  
  /**
   * Get all colors for dropdown/select components (simplified)
   */
  getAllColors$(): Observable<ColorDto[]> {
    return this.getColors$({ per_page: 100 }).pipe(
      map(response => response.data || [])
    );
  }

  /**
   * Get all razas for dropdown/select components (simplified)
   */
  getAllBreeds$(): Observable<RazaDto[]> {
    return this.getBreeds$({ per_page: 100 }).pipe(
      map(response => response.data || [])
    );
  }

  /**
   * Get all condiciones corporales for dropdown/select components (simplified)
   */
  getAllBodyConditions$(): Observable<CondicionCorporalDto[]> {
    return this.getBodyConditions$({ per_page: 100 }).pipe(
      map(response => response.data || [])
    );
  }

  /**
   * Get all tipos de pelo for dropdown/select components (simplified)
   */
  getAllHairTypes$(): Observable<TipoPeloDto[]> {
    return this.getHairTypes$({ per_page: 100 }).pipe(
      map(response => response.data || [])
    );
  }
}
