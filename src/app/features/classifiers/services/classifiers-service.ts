import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { ClasificadorDto, CreateClasificadorDto, UpdateClasificadorDto, ClasificadorFilters } from '../models/classifier.dto';
import { LaravelApiResponse, LaravelSingleItemResponse, LaravelPaginationResponse } from '../../../core/models/DTOs';

@Injectable({
  providedIn: 'root'
})
export class ClassifiersService {
  private readonly apiUrl = `${environment.apiUrl}/api/v1/clasificador`;

  constructor(private http: HttpClient) { }

  /**
   * Obtiene lista paginada de clasificadores con filtros
   */
  getClasificadores(filters: ClasificadorFilters = {}, page: number = 1, perPage: number = 25): Observable<LaravelPaginationResponse<ClasificadorDto>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('per_page', perPage.toString());

    // Agregar filtros
    Object.keys(filters).forEach(key => {
      const value = filters[key as keyof ClasificadorFilters];
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    return this.http.get<LaravelApiResponse<ClasificadorDto>>(this.apiUrl, { params })
      .pipe(
        map(response => response.data)
      );
  }

  /**
   * Obtiene un clasificador por cédula
   */
  getClasificador(cedClasificador: string): Observable<ClasificadorDto> {
    return this.http.get<LaravelSingleItemResponse<ClasificadorDto>>(`${this.apiUrl}/${cedClasificador}`)
      .pipe(
        map(response => response.data)
      );
  }

  /**
   * Crea un nuevo clasificador
   */
  createClasificador(clasificador: CreateClasificadorDto): Observable<ClasificadorDto> {
    return this.http.post<LaravelSingleItemResponse<ClasificadorDto>>(this.apiUrl, clasificador)
      .pipe(
        map(response => response.data)
      );
  }

  /**
   * Actualiza un clasificador existente
   */
  updateClasificador(cedClasificador: string, clasificador: UpdateClasificadorDto): Observable<ClasificadorDto> {
    return this.http.put<LaravelSingleItemResponse<ClasificadorDto>>(`${this.apiUrl}/${cedClasificador}`, clasificador)
      .pipe(
        map(response => response.data)
      );
  }

  /**
   * Elimina un clasificador (soft delete)
   */
  deleteClasificador(cedClasificador: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${cedClasificador}`);
  }

  /**
   * Obtiene todos los clasificadores activos para dropdowns
   */
  getAllActiveClasificadores(): Observable<ClasificadorDto[]> {
    return this.getClasificadores({ is_active: true }, 1, 1000)
      .pipe(
        map(response => response.data)
      );
  }

  /**
   * Busca clasificadores por término de búsqueda
   */
  searchClasificadores(searchTerm: string, perPage: number = 25): Observable<LaravelPaginationResponse<ClasificadorDto>> {
    const params = new HttpParams()
      .set('q', searchTerm)
      .set('per_page', perPage.toString());

    return this.http.get<LaravelApiResponse<ClasificadorDto>>(`${this.apiUrl}/search`, { params })
      .pipe(
        map(response => response.data)
      );
  }

  /**
   * Verifica si existe un clasificador por código
   */
  existsByCodigo(codigo: string): Observable<boolean> {
    return this.getClasificadores({ cod_clasificador: codigo }, 1, 1)
      .pipe(
        map(response => response.total > 0)
      );
  }
}
