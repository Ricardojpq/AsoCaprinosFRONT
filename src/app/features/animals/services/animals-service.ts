import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError, timer } from 'rxjs';
import { map, catchError, switchMap, filter, take } from 'rxjs/operators';
import { toObservable } from '@angular/core/rxjs-interop';
import { ApiAnimals } from '@core/infrastructure/Apis/api-animals';
import { environment } from '@environments/environment';
import { LaravelApiResponse, LaravelSingleItemResponse, LaravelPaginationResponse } from '../../../core/models/DTOs';
import { AuthService } from '@features/auth/services/auth.service';
import { AnimalCreateDto } from '@features/animals/models/DTOs/animal-create';
import { AnimalUpdateDto } from '@features/animals/models/DTOs/animal-update';
import { AnimalDto } from '@features/animals/models/DTOs/animal';
import { AnimalSexEnum } from '@core/enums/animal-sex-enum';
import { AnimalOriginEnum } from '@core/enums/animal-origin-enum';
import { AnimalStatusEnum } from '@core/enums/animal-status-enum';
import { ConceptionTypeEnum } from '@core/enums/conception-type-enum';
import { BirthTypeEnum } from '@core/enums/birth-type-enum';
import { GeneticMaterialEnum } from '@core/enums/genetic-material-enum';
import { BloodlinePurityEnum } from '@core/enums/bloodline-purity-enum';

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
  private authService = inject(AuthService);
  private user$ = toObservable(this.authService.user);

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
    // Primero verificar si ya hay finca en localStorage
    const storedFinca = localStorage.getItem('selected_finca');
    if (storedFinca) {
      return this.fetchAnimals(query, storedFinca);
    }

    // Si no hay en localStorage, esperar a que el usuario esté disponible
    return this.user$.pipe(
      filter(user => !!user?.fincas?.length),
      take(1),
      switchMap(user => {
        const fincas = user?.fincas || [];
        const fincaPrincipal = fincas.find((f: any) => f.es_principal) || fincas[0];
        const codFinca = fincaPrincipal?.cod_finca?.toString();
        return this.fetchAnimals(query, codFinca);
      }),
      catchError(() => this.fetchAnimals(query, undefined))
    );
  }

  private fetchAnimals(query: AnimalQueryParams, codFinca?: string): Observable<LaravelPaginationResponse<AnimalDto>> {
    try {
      let params = new HttpParams();
      
      if (codFinca) {
        params = params.set('cod_finca', codFinca);
      }
      
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
  getSexOptions() {
    return [
      { label: 'Macho', value: AnimalSexEnum.Male },
      { label: 'Hembra', value: AnimalSexEnum.Female }
    ];
  }

  getOriginOptions() {
    return [
      { label: 'Nacido en Finca', value: AnimalOriginEnum.FarmBorn },
      { label: 'Extranjero', value: AnimalOriginEnum.Foreign },
      { label: 'Compra a Socio', value: AnimalOriginEnum.MemberPurchase },
      { label: 'Compra Independiente', value: AnimalOriginEnum.IndependentPurchase }
    ];
  }

  getStatusOptions() {
    return [
      { label: 'Activo', value: AnimalStatusEnum.ACTIVE },
      { label: 'Referencia', value: AnimalStatusEnum.REFERENCE },
      { label: 'Inactivo', value: AnimalStatusEnum.INACTIVE }
    ];
  }

  getConceptionTypeOptions() {
    return [
      { label: 'Monta Natural', value: ConceptionTypeEnum.NaturalMating },
      { label: 'TE Fresco', value: ConceptionTypeEnum.ET_Fresh },
      { label: 'TE Congelado', value: ConceptionTypeEnum.ET_Frozen },
      { label: 'Inseminación Artificial', value: ConceptionTypeEnum.AI }
    ];
  }

  getBirthTypeOptions() {
    return [
      { label: 'Simple', value: BirthTypeEnum.Single },
      { label: 'Doble', value: BirthTypeEnum.Twin },
      { label: 'Triple', value: BirthTypeEnum.Triplet },
      { label: 'Cuádruple', value: BirthTypeEnum.Quadruplet },
      { label: 'Quíntuple', value: BirthTypeEnum.Quintuplet }
    ];
  }

  getGeneticMaterialOptions() {
    return [
      { label: 'Nacional', value: GeneticMaterialEnum.Domestic },
      { label: 'Importado', value: GeneticMaterialEnum.Imported }
    ];
  }

  getImportProtocolOptions() {
    return [
      { label: 'SI', value: 'S' },
      { label: 'NO', value: 'N' }
    ];
  }

  getBloodlinePurityOptions() {
    return [
      { label: 'PO', value: BloodlinePurityEnum.PO },
      { label: 'PCOC', value: BloodlinePurityEnum.PCOC },
      { label: 'PR', value: BloodlinePurityEnum.PR },
      { label: 'Base', value: BloodlinePurityEnum.BASE },
      { label: 'G1', value: BloodlinePurityEnum.G1 },
      { label: 'G2', value: BloodlinePurityEnum.G2 },
      { label: 'G3', value: BloodlinePurityEnum.G3 },
      { label: 'G4', value: BloodlinePurityEnum.G4 }
    ];
  }

  getAnimalStats$(): Observable<any> {
    return this.httpClient.get<any>(`${this.animalsURL}/api/v1/animals/stats`)
      .pipe(
        catchError(this.handleError)
      );
  }
}