import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiAnimals } from '@core/infrastructure/Apis/api-animals';
import { environment } from '@environments/environment';
import { ApiResponseSuccess, ApiResponseError } from '@core/models/DTOs/api-response';
import { AnimalCreateDto } from '@features/animals/models/DTOs/animal-create';
import { AnimalUpdateDto } from '@features/animals/models/DTOs/animal-update';
import { AnimalDto } from '@features/animals/models/DTOs/animal';
import { AnimalListResponse } from '@features/animals/models/DTOs/animal-list-response';

export interface AnimalQueryParams {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_dir?: 'asc' | 'desc';
  sexo_animal?: string;
  estatus?: string;
  cod_finca?: string;
  search?: string;
  nomb_animal?: string;
  [key: string]: any;
}

// Tipo para la respuesta real del backend
interface AnimalListApiResponse {
  status: string;
  data: string; // El mensaje
  message: AnimalListResponse; // Los datos reales
}

@Injectable({ providedIn: 'root' })
export class AnimalsService {
  private animalsURL: string = environment.apiUrl;

  constructor(private httpClient: HttpClient) {}

  private handleError(error: HttpErrorResponse) {
    console.error('AnimalsService error:', error);
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
      errorMessage = 'El animal ya existe';
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

  addAnimal$(data: AnimalCreateDto): Observable<AnimalDto> {
    try {
      const uri = ApiAnimals.AddAnimal(this.animalsURL);
      return this.httpClient.post<ApiResponseSuccess<AnimalDto>>(uri, data).pipe(
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
      console.error('Error adding animal', e);
      return throwError(() => new Error('Error al agregar animal'));
    }
  }

  getAnimals$(query: AnimalQueryParams = {}): Observable<AnimalListResponse> {
    try {
      let params = new HttpParams();
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, value as string);
        }
      });
      const uri = ApiAnimals.GetAnimals(this.animalsURL);
      return this.httpClient.get<AnimalListApiResponse>(uri, { params }).pipe(
        map(res => {
          if (res.status === 'success' && res.message) {
            // El backend devuelve los datos en 'message' y el mensaje en 'data'
            return res.message as AnimalListResponse;
          } else {
            throw new Error('Respuesta inválida del servidor');
          }
        }),
        catchError(this.handleError)
      );
    } catch (e) {
      console.error('Error fetching animals', e);
      return of({ current_page: 1, data: [], per_page: 10, total: 0 });
    }
  }

  getAnimalById$(cod_finca: string, cod_animal: string): Observable<AnimalDto> {
    try {
      const uri = ApiAnimals.GetAnimalById(this.animalsURL, cod_finca, cod_animal);
      return this.httpClient.get<ApiResponseSuccess<AnimalDto>>(uri).pipe(
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
      console.error('Error fetching animal', e);
      return throwError(() => new Error('Error al obtener animal'));
    }
  }

  updateAnimal$(cod_finca: string, cod_animal: string, data: AnimalUpdateDto): Observable<AnimalDto> {
    try {
      const uri = ApiAnimals.UpdateAnimal(this.animalsURL, cod_finca, cod_animal);
      return this.httpClient.put<ApiResponseSuccess<AnimalDto>>(uri, data).pipe(
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
      console.error('Error updating animal', e);
      return throwError(() => new Error('Error al actualizar animal'));
    }
  }

  deleteAnimal$(cod_finca: string, cod_animal: string): Observable<any> {
    try {
      const uri = ApiAnimals.DeleteAnimal(this.animalsURL, cod_finca, cod_animal);
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
      console.error('Error deleting animal', e);
      return throwError(() => new Error('Error al eliminar animal'));
    }
  }
} 