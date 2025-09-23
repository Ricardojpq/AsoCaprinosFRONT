import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { EmpresaDto, CreateEmpresaDto, UpdateEmpresaDto, EmpresaFilters } from '../models/company.dto';
import { LaravelApiResponse, LaravelSingleItemResponse, LaravelPaginationResponse } from '../../../core/models/DTOs';

@Injectable({
  providedIn: 'root'
})
export class CompaniesService {
  private readonly apiUrl = `${environment.apiUrl}/api/v1/empresa`;

  constructor(private http: HttpClient) { }

  /**
   * Obtiene lista paginada de empresas con filtros
   */
  getEmpresas(filters: EmpresaFilters = {}, page: number = 1, perPage: number = 25): Observable<LaravelPaginationResponse<EmpresaDto>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('per_page', perPage.toString());

    // Agregar filtros
    Object.keys(filters).forEach(key => {
      const value = filters[key as keyof EmpresaFilters];
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    return this.http.get<LaravelApiResponse<EmpresaDto>>(this.apiUrl, { params })
      .pipe(
        map(response => response.data)
      );
  }

  /**
   * Obtiene una empresa por código
   */
  getEmpresa(codEmpresa: number): Observable<EmpresaDto> {
    return this.http.get<LaravelSingleItemResponse<EmpresaDto>>(`${this.apiUrl}/${codEmpresa}`)
      .pipe(
        map(response => response.data)
      );
  }

  /**
   * Crea una nueva empresa
   */
  createEmpresa(empresa: CreateEmpresaDto): Observable<EmpresaDto> {
    return this.http.post<LaravelSingleItemResponse<EmpresaDto>>(this.apiUrl, empresa)
      .pipe(
        map(response => response.data)
      );
  }

  /**
   * Actualiza una empresa existente
   */
  updateEmpresa(codEmpresa: number, empresa: UpdateEmpresaDto): Observable<EmpresaDto> {
    return this.http.put<LaravelSingleItemResponse<EmpresaDto>>(`${this.apiUrl}/${codEmpresa}`, empresa)
      .pipe(
        map(response => response.data)
      );
  }

  /**
   * Elimina una empresa (soft delete)
   */
  deleteEmpresa(codEmpresa: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${codEmpresa}`);
  }

  /**
   * Obtiene todas las empresas activas para dropdowns
   */
  getAllActiveEmpresas(): Observable<EmpresaDto[]> {
    return this.getEmpresas({ is_active: true }, 1, 1000)
      .pipe(
        map(response => response.data)
      );
  }

  /**
   * Verifica si existe una empresa por RIF
   */
  existsByRif(rif: string): Observable<boolean> {
    return this.getEmpresas({ rif_empresa: rif }, 1, 1)
      .pipe(
        map(response => response.total > 0)
      );
  }
}
