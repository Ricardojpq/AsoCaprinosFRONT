import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { 
  FincaDto, 
  CreateFincaDto, 
  UpdateFincaDto, 
  FincaQueryParams 
} from '../models/finca.dto';
import { 
  LaravelApiResponse, 
  LaravelSingleItemResponse, 
  LaravelPaginationResponse 
} from '../../../core/models/DTOs/laravel-response';

@Injectable({
  providedIn: 'root'
})
export class FarmsService {
  private readonly apiUrl = `${environment.apiUrl}/api/v1/fincas`;

  constructor(private http: HttpClient) {}

  /**
   * Get paginated list of farms with filters
   */
  getFincas$(params: FincaQueryParams = {}): Observable<LaravelPaginationResponse<FincaDto>> {
    let httpParams = new HttpParams();
    
    // Add pagination parameters
    if (params.page) httpParams = httpParams.set('page', params.page.toString());
    if (params.per_page) httpParams = httpParams.set('per_page', params.per_page.toString());
    
    // Add sorting parameters
    if (params.sort_by) httpParams = httpParams.set('sort_by', params.sort_by);
    if (params.sort_dir) httpParams = httpParams.set('sort_dir', params.sort_dir);
    
    // Add filter parameters
    if (params.nom_finca) httpParams = httpParams.set('nom_finca', params.nom_finca);
    if (params.cod_estado) httpParams = httpParams.set('cod_estado', params.cod_estado.toString());
    if (params.cod_municipio) httpParams = httpParams.set('cod_municipio', params.cod_municipio.toString());
    if (params.cod_ciudad) httpParams = httpParams.set('cod_ciudad', params.cod_ciudad.toString());
    if (params.ced_propietario) httpParams = httpParams.set('ced_propietario', params.ced_propietario);
    if (params.estatus_finca) httpParams = httpParams.set('estatus_finca', params.estatus_finca);
    if (params.search) httpParams = httpParams.set('search', params.search);

    return this.http.get<LaravelApiResponse<FincaDto>>(this.apiUrl, { params: httpParams })
      .pipe(
        map(response => response.data)
      );
  }

  /**
   * Get a specific farm by ID
   */
  getFinca$(cod_finca: number): Observable<FincaDto> {
    return this.http.get<LaravelSingleItemResponse<FincaDto>>(`${this.apiUrl}/${cod_finca}`)
      .pipe(
        map(response => response.data)
      );
  }

  /**
   * Create a new farm
   */
  createFinca$(finca: CreateFincaDto): Observable<FincaDto> {
    return this.http.post<LaravelSingleItemResponse<FincaDto>>(this.apiUrl, finca)
      .pipe(
        map(response => response.data)
      );
  }

  /**
   * Update an existing farm
   */
  updateFinca$(cod_finca: number, finca: UpdateFincaDto): Observable<FincaDto> {
    return this.http.put<LaravelSingleItemResponse<FincaDto>>(`${this.apiUrl}/${cod_finca}`, finca)
      .pipe(
        map(response => response.data)
      );
  }

  /**
   * Delete a farm (soft delete)
   */
  deleteFinca$(cod_finca: number): Observable<any> {
    return this.http.delete<LaravelSingleItemResponse<any>>(`${this.apiUrl}/${cod_finca}`)
      .pipe(
        map(response => response.data)
      );
  }

  /**
   * Search farms by text
   */
  searchFincas$(searchTerm: string, params: Partial<FincaQueryParams> = {}): Observable<LaravelPaginationResponse<FincaDto>> {
    const searchParams: FincaQueryParams = {
      ...params,
      search: searchTerm
    };
    return this.getFincas$(searchParams);
  }

  /**
   * Get all active farms for dropdowns
   * @param perPage Número de elementos a obtener (por defecto 100)
   */
  getAllActiveFincas$(perPage: number = 100): Observable<FincaDto[]> {
    const params: FincaQueryParams = {
      per_page: perPage,
      estatus_finca: 'A'
    };
    return this.getFincas$(params).pipe(
      map(response => response.data)
    );
  }

  /**
   * Check if a farm exists by RIF
   */
  existsByRif$(rif: string, excludeId?: number): Observable<boolean> {
    let httpParams = new HttpParams().set('rif', rif);
    if (excludeId) {
      httpParams = httpParams.set('exclude_id', excludeId.toString());
    }
    
    return this.http.get<LaravelSingleItemResponse<boolean>>(`${this.apiUrl}/exists-by-rif`, { params: httpParams })
      .pipe(
        map(response => response.data)
      );
  }

  /**
   * Get farms by estado
   */
  getFincasByEstado$(cod_estado: number): Observable<FincaDto[]> {
    const params: FincaQueryParams = {
      cod_estado,
      per_page: 1000
    };
    return this.getFincas$(params).pipe(
      map(response => response.data)
    );
  }

  /**
   * Get farms by municipio
   */
  getFincasByMunicipio$(cod_municipio: number): Observable<FincaDto[]> {
    const params: FincaQueryParams = {
      cod_municipio,
      per_page: 1000
    };
    return this.getFincas$(params).pipe(
      map(response => response.data)
    );
  }

  /**
   * Get status options for dropdowns
   */
  getEstatusOptions(): Array<{label: string, value: string}> {
    return [
      { label: 'Activo', value: 'A' },
      { label: 'Inactivo', value: 'I' },
      { label: 'Suspendido', value: 'S' }
    ];
  }

  /**
   * Get tipo ganaderia options
   */
  getTipoGanaderiaOptions(): Array<{label: string, value: string}> {
    return [
      { label: 'Caprino', value: 'C' },
      { label: 'Ovino', value: 'O' },
      { label: 'Bovino', value: 'B' },
      { label: 'Mixto', value: 'M' }
    ];
  }

  /**
   * Get tipo sistema options
   */
  getTipoSistemaOptions(): Array<{label: string, value: string}> {
    return [
      { label: 'Extensivo', value: 'E' },
      { label: 'Semi-intensivo', value: 'S' },
      { label: 'Intensivo', value: 'I' }
    ];
  }

  /**
   * Get tipo criador options
   */
  getTipoCriadorOptions(): Array<{label: string, value: string}> {
    return [
      { label: 'Comercial', value: 'C' },
      { label: 'Registrado', value: 'R' },
      { label: 'Puro', value: 'P' },
      { label: 'Tradicional', value: 'T' }
    ];
  }
}
