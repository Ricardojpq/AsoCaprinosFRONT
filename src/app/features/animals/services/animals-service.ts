import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiAnimals } from '@core/infrastructure/Apis/api-animals';
import { environment } from '@environments/environment';
import { LaravelApiResponse, LaravelSingleItemResponse, LaravelPaginationResponse } from '../../../core/models/DTOs';
import { AnimalCreateDto } from '@features/animals/models/DTOs/animal-create';
import { AnimalUpdateDto } from '@features/animals/models/DTOs/animal-update';
import { AnimalDto } from '@features/animals/models/DTOs/animal';
import { SexoAnimalEnum } from '@core/enums/sexo-animal-enum';
import { OrigenAnimalEnum } from '@core/enums/origen-animal-enum';
import { EstatusAnimalEnum } from '@core/enums/estatus-animal-enum';
import { TipoConcepcionEnum } from '@core/enums/tipo-concepcion-enum';
import { TipoPartoEnum } from '@core/enums/tipo-parto-enum';
import { MaterialGeneticoEnum } from '@core/enums/material-genetico-enum';
import { PurezaSangreEnum } from '@core/enums/pureza-sangre-enum';

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
      // Manejar tanto conflictos de duplicados como de certificados asociados
      if (error.error && error.error.message && error.error.message.includes('certificados asociados')) {
        errorMessage = error.error.message;
      } else {
        errorMessage = 'El animal ya existe';
      }
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

  addAnimal$(data: Partial<AnimalCreateDto>): Observable<AnimalDto> {
    try {
      const uri = ApiAnimals.AddAnimal(this.animalsURL);
      return this.httpClient.post<LaravelSingleItemResponse<AnimalDto>>(uri, data).pipe(
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

  getAnimals$(query: AnimalQueryParams = {}): Observable<LaravelPaginationResponse<AnimalDto>> {
    try {
      let params = new HttpParams();
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, value as string);
        }
      });
      const uri = ApiAnimals.GetAnimals(this.animalsURL);
      return this.httpClient.get<LaravelApiResponse<AnimalDto>>(uri, { params }).pipe(
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
      console.error('Error fetching animals', e);
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

  getAnimalById$(cod_finca: string, cod_animal: number): Observable<AnimalDto> {
    try {
      const uri = ApiAnimals.GetAnimalById(this.animalsURL, cod_finca, cod_animal);
      return this.httpClient.get<LaravelSingleItemResponse<AnimalDto>>(uri).pipe(
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
      return this.httpClient.put<LaravelSingleItemResponse<AnimalDto>>(uri, data).pipe(
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
      console.error('Error deleting animal', e);
      return throwError(() => new Error('Error al eliminar animal'));
    }
  }

  canDeleteAnimal$(cod_finca: string, cod_animal: string): Observable<{can_delete: boolean, reason: string | null}> {
    try {
      const uri = `${this.animalsURL}/api/v1/animals/${cod_finca}/${cod_animal}/can-delete`;
      return this.httpClient.get<LaravelSingleItemResponse<{can_delete: boolean, reason: string | null}>>(uri).pipe(
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
      console.error('Error checking if animal can be deleted', e);
      return throwError(() => new Error('Error al verificar si el animal puede ser eliminado'));
    }
  }

  // Métodos para obtener opciones de los enums
  getSexoOptions() {
    return [
      { label: 'Macho', value: SexoAnimalEnum.Macho },
      { label: 'Hembra', value: SexoAnimalEnum.Hembra }
    ];
  }

  getOrigenOptions() {
    return [
      { label: 'Nacido en Finca', value: OrigenAnimalEnum.NacidoFinca },
      { label: 'Extranjero', value: OrigenAnimalEnum.Extranjero },
      { label: 'Compra a Socio', value: OrigenAnimalEnum.CompraSocio },
      { label: 'Compra Independiente', value: OrigenAnimalEnum.CompraIndependiente }
    ];
  }

  getEstatusOptions() {
    return [
      { label: 'Activo', value: EstatusAnimalEnum.ACTIVO },
      { label: 'Referencia', value: EstatusAnimalEnum.REFERENCIA },
      { label: 'Inactivo', value: EstatusAnimalEnum.INACTIVO }
    ];
  }

  getTipoConcepcionOptions() {
    return [
      { label: 'Monta Natural', value: TipoConcepcionEnum.MN },
      { label: 'TE Fresco', value: TipoConcepcionEnum.TE_Fresco },
      { label: 'TE Congelado', value: TipoConcepcionEnum.TE_Congelado },
      { label: 'Inseminación Artificial', value: TipoConcepcionEnum.IA }
    ];
  }

  getTipoPartoOptions() {
    return [
      { label: 'Simple', value: TipoPartoEnum.Simple },
      { label: 'Doble', value: TipoPartoEnum.Doble },
      { label: 'Triple', value: TipoPartoEnum.Triple },
      { label: 'Cuádruple', value: TipoPartoEnum.Cuádruple },
      { label: 'Quíntuple', value: TipoPartoEnum.Quíntuple }
    ];
  }

  getMaterialGeneticoOptions() {
    return [
      { label: 'Nacional', value: MaterialGeneticoEnum.Nacional },
      { label: 'Importado', value: MaterialGeneticoEnum.Importado }
    ];
  }

  getProtocoloImportacionOptions() {
    return [
      { label: 'SI', value: 'S' },
      { label: 'NO', value: 'N' }
    ];
  }

  getCompRacialOptions() {
    return [
      { label: 'PO', value: PurezaSangreEnum.PO },
      { label: 'PCOC', value: PurezaSangreEnum.PCOC },
      { label: 'PR', value: PurezaSangreEnum.PR },
      { label: 'Base', value: PurezaSangreEnum.BASE },
      { label: 'G1', value: PurezaSangreEnum.G1 },
      { label: 'G2', value: PurezaSangreEnum.G2 },
      { label: 'G3', value: PurezaSangreEnum.G3 },
      { label: 'G4', value: PurezaSangreEnum.G4 }
    ];
  }

  getAnimalStats$(): Observable<any> {
    return this.httpClient.get<any>(`${this.animalsURL}/api/v1/animals/stats`)
      .pipe(
        catchError(this.handleError)
      );
  }
}