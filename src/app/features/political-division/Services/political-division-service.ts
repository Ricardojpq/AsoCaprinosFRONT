import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  PaisDto,
  PaisCreateDto,
  PaisUpdateDto,
  PaisQueryParams,
  EstadoDto,
  EstadoCreateDto,
  EstadoUpdateDto,
  EstadoQueryParams,
  MunicipioDto,
  MunicipioCreateDto,
  MunicipioUpdateDto,
  MunicipioQueryParams,
  ParroquiaDto,
  ParroquiaCreateDto,
  ParroquiaUpdateDto,
  ParroquiaQueryParams,
  CiudadDto,
  CiudadCreateDto,
  CiudadUpdateDto,
  CiudadQueryParams,
  PoliticalDivisionSelectOption
} from '../models/political-division.dto';
import { LaravelApiResponse, LaravelSingleItemResponse } from '../../../core/models/DTOs';

@Injectable({
  providedIn: 'root'
})
export class PoliticalDivisionService {
  private readonly apiUrl = `${environment.apiUrl}/api/v1/political-division`;

  constructor(private http: HttpClient) {}

  // ============= PAÍSES =============

  /**
   * Obtener lista paginada de países
   */
  getCountries(params?: PaisQueryParams): Observable<LaravelApiResponse<PaisDto>> {
    let httpParams = new HttpParams();
    
    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key as keyof PaisQueryParams];
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }

    return this.http.get<LaravelApiResponse<PaisDto>>(`${this.apiUrl}/paises`, { params: httpParams });
  }

  /**
   * Obtener país por ID
   */
  getCountry(codPais: number): Observable<LaravelSingleItemResponse<PaisDto>> {
    return this.http.get<LaravelSingleItemResponse<PaisDto>>(`${this.apiUrl}/paises/${codPais}`);
  }

  /**
   * Crear nuevo país
   */
  createCountry(pais: PaisCreateDto): Observable<LaravelSingleItemResponse<PaisDto>> {
    return this.http.post<LaravelSingleItemResponse<PaisDto>>(`${this.apiUrl}/paises`, pais);
  }

  /**
   * Actualizar país
   */
  updateCountry(codPais: number, pais: PaisUpdateDto): Observable<LaravelSingleItemResponse<PaisDto>> {
    return this.http.put<LaravelSingleItemResponse<PaisDto>>(`${this.apiUrl}/paises/${codPais}`, pais);
  }

  /**
   * Eliminar país
   */
  deleteCountry(codPais: number): Observable<LaravelSingleItemResponse<any>> {
    return this.http.delete<LaravelSingleItemResponse<any>>(`${this.apiUrl}/paises/${codPais}`);
  }

  /**
   * Obtener todos los países para dropdown
   */
  getAllCountries(): Observable<PoliticalDivisionSelectOption[]> {
    return this.getCountries({ per_page: 100 }).pipe(
      map(response => response.data.data.map(pais => ({
        label: pais.nom_pais,
        value: pais.cod_pais,
        code: pais.siglas_pais
      })))
    );
  }

  // ============= ESTADOS =============

  /**
   * Obtener lista paginada de estados
   */
  getStates(params?: EstadoQueryParams): Observable<LaravelApiResponse<EstadoDto>> {
    let httpParams = new HttpParams();
    
    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key as keyof EstadoQueryParams];
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }

    return this.http.get<LaravelApiResponse<EstadoDto>>(`${this.apiUrl}/estados`, { params: httpParams });
  }

  /**
   * Obtener estado por ID
   */
  getState(codEstado: number): Observable<LaravelSingleItemResponse<EstadoDto>> {
    return this.http.get<LaravelSingleItemResponse<EstadoDto>>(`${this.apiUrl}/estados/${codEstado}`);
  }

  /**
   * Crear nuevo estado
   */
  createState(estado: EstadoCreateDto): Observable<LaravelSingleItemResponse<EstadoDto>> {
    return this.http.post<LaravelSingleItemResponse<EstadoDto>>(`${this.apiUrl}/estados`, estado);
  }

  /**
   * Actualizar estado
   */
  updateState(codEstado: number, estado: EstadoUpdateDto): Observable<LaravelSingleItemResponse<EstadoDto>> {
    return this.http.put<LaravelSingleItemResponse<EstadoDto>>(`${this.apiUrl}/estados/${codEstado}`, estado);
  }

  /**
   * Eliminar estado
   */
  deleteState(codEstado: number): Observable<LaravelSingleItemResponse<any>> {
    return this.http.delete<LaravelSingleItemResponse<any>>(`${this.apiUrl}/estados/${codEstado}`);
  }

  /**
   * Obtener estados por país para dropdown
   */
  getStatesByCountry(codPais: number): Observable<PoliticalDivisionSelectOption[]> {
    return this.getStates({ cod_pais: codPais, per_page: 100 }).pipe(
      map(response => response.data.data.map(estado => ({
        label: estado.nom_estado,
        value: estado.cod_estado,
        code: estado.siglas_estado
      })))
    );
  }

  /**
   * Obtener todos los estados activos para dropdown
   */
  getAllActiveStates(): Observable<EstadoDto[]> {
    return this.getStates({ per_page: 100 }).pipe(
      map(response => response.data.data)
    );
  }

  // ============= MUNICIPIOS =============

  /**
   * Obtener lista paginada de municipios
   */
  getMunicipalities(params?: MunicipioQueryParams): Observable<LaravelApiResponse<MunicipioDto>> {
    let httpParams = new HttpParams();
    
    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key as keyof MunicipioQueryParams];
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }

    return this.http.get<LaravelApiResponse<MunicipioDto>>(`${this.apiUrl}/municipios`, { params: httpParams });
  }

  /**
   * Obtener municipios por estado para dropdown
   */
  getMunicipalitiesByState(codEstado: number): Observable<PoliticalDivisionSelectOption[]> {
    return this.getMunicipalities({ cod_estado: codEstado, per_page: 100 }).pipe(
      map(response => response.data.data.map(municipio => ({
        label: municipio.nom_municipio,
        value: municipio.cod_municipio
      })))
    );
  }

  /**
   * Obtener municipios completos por estado
   */
  getMunicipalitiesFullByState(codEstado: number): Observable<MunicipioDto[]> {
    return this.getMunicipalities({ cod_estado: codEstado, per_page: 100 }).pipe(
      map(response => response.data.data)
    );
  }

  /**
   * Crear nuevo municipio
   */
  createMunicipality(municipio: MunicipioCreateDto): Observable<LaravelSingleItemResponse<MunicipioDto>> {
    return this.http.post<LaravelSingleItemResponse<MunicipioDto>>(`${this.apiUrl}/municipios`, municipio);
  }

  /**
   * Actualizar municipio existente
   */
  updateMunicipality(codMunicipio: number, municipio: MunicipioUpdateDto): Observable<LaravelSingleItemResponse<MunicipioDto>> {
    return this.http.put<LaravelSingleItemResponse<MunicipioDto>>(`${this.apiUrl}/municipios/${codMunicipio}`, municipio);
  }

  /**
   * Eliminar municipio
   */
  deleteMunicipality(codMunicipio: number): Observable<LaravelSingleItemResponse<any>> {
    return this.http.delete<LaravelSingleItemResponse<any>>(`${this.apiUrl}/municipios/${codMunicipio}`);
  }

  // ============= PARROQUIAS =============

  /**
   * Obtener lista paginada de parroquias
   */
  getParishes(params?: ParroquiaQueryParams): Observable<LaravelApiResponse<ParroquiaDto>> {
    let httpParams = new HttpParams();
    
    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key as keyof ParroquiaQueryParams];
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }

    return this.http.get<LaravelApiResponse<ParroquiaDto>>(`${this.apiUrl}/parroquias`, { params: httpParams });
  }

  /**
   * Obtener parroquias por municipio para dropdown
   */
  getParishesByMunicipality(codMunicipio: number): Observable<PoliticalDivisionSelectOption[]> {
    return this.getParishes({ cod_municipio: codMunicipio, per_page: 100 }).pipe(
      map(response => response.data.data.map(parroquia => ({
        label: parroquia.nom_parroquia,
        value: parroquia.cod_parroquia
      })))
    );
  }

  /**
   * Crear nueva parroquia
   */
  createParish(parroquia: ParroquiaCreateDto): Observable<LaravelSingleItemResponse<ParroquiaDto>> {
    return this.http.post<LaravelSingleItemResponse<ParroquiaDto>>(`${this.apiUrl}/parroquias`, parroquia);
  }

  /**
   * Actualizar parroquia existente
   */
  updateParish(codParroquia: number, parroquia: ParroquiaUpdateDto): Observable<LaravelSingleItemResponse<ParroquiaDto>> {
    return this.http.put<LaravelSingleItemResponse<ParroquiaDto>>(`${this.apiUrl}/parroquias/${codParroquia}`, parroquia);
  }

  /**
   * Eliminar parroquia
   */
  deleteParish(codParroquia: number): Observable<LaravelSingleItemResponse<any>> {
    return this.http.delete<LaravelSingleItemResponse<any>>(`${this.apiUrl}/parroquias/${codParroquia}`);
  }

  // ============= CIUDADES =============

  /**
   * Obtener lista paginada de ciudades
   */
  getCities(params?: CiudadQueryParams): Observable<LaravelApiResponse<CiudadDto>> {
    let httpParams = new HttpParams();
    
    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key as keyof CiudadQueryParams];
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }

    return this.http.get<LaravelApiResponse<CiudadDto>>(`${this.apiUrl}/ciudades`, { params: httpParams });
  }

  /**
   * Obtener ciudades por municipio para dropdown
   */
  getCitiesByMunicipality(nomMunicipio: string): Observable<CiudadDto[]> {
    return this.getCities({ municipio_ciudad: nomMunicipio, per_page: 100 }).pipe(
      map(response => response.data.data)
    );
  }


  /**
   * Crear nueva ciudad
   */
  createCity(ciudad: CiudadCreateDto): Observable<LaravelSingleItemResponse<CiudadDto>> {
    return this.http.post<LaravelSingleItemResponse<CiudadDto>>(`${this.apiUrl}/ciudades`, ciudad);
  }

  /**
   * Actualizar ciudad existente
   */
  updateCity(codCiudad: number, ciudad: CiudadUpdateDto): Observable<LaravelSingleItemResponse<CiudadDto>> {
    return this.http.put<LaravelSingleItemResponse<CiudadDto>>(`${this.apiUrl}/ciudades/${codCiudad}`, ciudad);
  }

  /**
   * Eliminar ciudad
   */
  deleteCity(codCiudad: number): Observable<LaravelSingleItemResponse<any>> {
    return this.http.delete<LaravelSingleItemResponse<any>>(`${this.apiUrl}/ciudades/${codCiudad}`);
  }
}
