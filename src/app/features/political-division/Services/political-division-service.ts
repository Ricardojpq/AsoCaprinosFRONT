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
  PoliticalDivisionListResponse,
  SingleItemResponse,
  PoliticalDivisionSelectOption
} from '../models/political-division.dto';

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
  getPaises(params?: PaisQueryParams): Observable<PoliticalDivisionListResponse<PaisDto>> {
    let httpParams = new HttpParams();
    
    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key as keyof PaisQueryParams];
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }

    return this.http.get<PoliticalDivisionListResponse<PaisDto>>(`${this.apiUrl}/paises`, { params: httpParams });
  }

  /**
   * Obtener país por ID
   */
  getPais(codPais: number): Observable<SingleItemResponse<PaisDto>> {
    return this.http.get<SingleItemResponse<PaisDto>>(`${this.apiUrl}/paises/${codPais}`);
  }

  /**
   * Crear nuevo país
   */
  createPais(pais: PaisCreateDto): Observable<SingleItemResponse<PaisDto>> {
    return this.http.post<SingleItemResponse<PaisDto>>(`${this.apiUrl}/paises`, pais);
  }

  /**
   * Actualizar país
   */
  updatePais(codPais: number, pais: PaisUpdateDto): Observable<SingleItemResponse<PaisDto>> {
    return this.http.put<SingleItemResponse<PaisDto>>(`${this.apiUrl}/paises/${codPais}`, pais);
  }

  /**
   * Eliminar país
   */
  deletePais(codPais: number): Observable<SingleItemResponse<any>> {
    return this.http.delete<SingleItemResponse<any>>(`${this.apiUrl}/paises/${codPais}`);
  }

  /**
   * Obtener todos los países para dropdown
   */
  getAllPaises(): Observable<PoliticalDivisionSelectOption[]> {
    return this.getPaises({ per_page: 100 }).pipe(
      map(response => response.message.data.map(pais => ({
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
  getEstados(params?: EstadoQueryParams): Observable<PoliticalDivisionListResponse<EstadoDto>> {
    let httpParams = new HttpParams();
    
    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key as keyof EstadoQueryParams];
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }

    return this.http.get<PoliticalDivisionListResponse<EstadoDto>>(`${this.apiUrl}/estados`, { params: httpParams });
  }

  /**
   * Obtener estado por ID
   */
  getEstado(codEstado: number): Observable<SingleItemResponse<EstadoDto>> {
    return this.http.get<SingleItemResponse<EstadoDto>>(`${this.apiUrl}/estados/${codEstado}`);
  }

  /**
   * Crear nuevo estado
   */
  createEstado(estado: EstadoCreateDto): Observable<SingleItemResponse<EstadoDto>> {
    return this.http.post<SingleItemResponse<EstadoDto>>(`${this.apiUrl}/estados`, estado);
  }

  /**
   * Actualizar estado
   */
  updateEstado(codEstado: number, estado: EstadoUpdateDto): Observable<SingleItemResponse<EstadoDto>> {
    return this.http.put<SingleItemResponse<EstadoDto>>(`${this.apiUrl}/estados/${codEstado}`, estado);
  }

  /**
   * Eliminar estado
   */
  deleteEstado(codEstado: number): Observable<SingleItemResponse<any>> {
    return this.http.delete<SingleItemResponse<any>>(`${this.apiUrl}/estados/${codEstado}`);
  }

  /**
   * Obtener estados por país para dropdown
   */
  getEstadosByPais(codPais: number): Observable<PoliticalDivisionSelectOption[]> {
    return this.getEstados({ cod_pais: codPais, per_page: 100 }).pipe(
      map(response => response.message.data.map(estado => ({
        label: estado.nom_estado,
        value: estado.cod_estado,
        code: estado.siglas_estado
      })))
    );
  }

  // ============= MUNICIPIOS =============

  /**
   * Obtener lista paginada de municipios
   */
  getMunicipios(params?: MunicipioQueryParams): Observable<PoliticalDivisionListResponse<MunicipioDto>> {
    let httpParams = new HttpParams();
    
    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key as keyof MunicipioQueryParams];
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }

    return this.http.get<PoliticalDivisionListResponse<MunicipioDto>>(`${this.apiUrl}/municipios`, { params: httpParams });
  }

  /**
   * Obtener municipios por estado para dropdown
   */
  getMunicipiosByEstado(codEstado: number): Observable<PoliticalDivisionSelectOption[]> {
    return this.getMunicipios({ cod_estado: codEstado, per_page: 100 }).pipe(
      map(response => response.message.data.map(municipio => ({
        label: municipio.nom_municipio,
        value: municipio.cod_municipio
      })))
    );
  }

  /**
   * Crear nuevo municipio
   */
  createMunicipio(municipio: MunicipioCreateDto): Observable<SingleItemResponse<MunicipioDto>> {
    return this.http.post<SingleItemResponse<MunicipioDto>>(`${this.apiUrl}/municipios`, municipio);
  }

  /**
   * Actualizar municipio existente
   */
  updateMunicipio(codMunicipio: number, municipio: MunicipioUpdateDto): Observable<SingleItemResponse<MunicipioDto>> {
    return this.http.put<SingleItemResponse<MunicipioDto>>(`${this.apiUrl}/municipios/${codMunicipio}`, municipio);
  }

  /**
   * Eliminar municipio
   */
  deleteMunicipio(codMunicipio: number): Observable<SingleItemResponse<any>> {
    return this.http.delete<SingleItemResponse<any>>(`${this.apiUrl}/municipios/${codMunicipio}`);
  }

  // ============= PARROQUIAS =============

  /**
   * Obtener lista paginada de parroquias
   */
  getParroquias(params?: ParroquiaQueryParams): Observable<PoliticalDivisionListResponse<ParroquiaDto>> {
    let httpParams = new HttpParams();
    
    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key as keyof ParroquiaQueryParams];
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }

    return this.http.get<PoliticalDivisionListResponse<ParroquiaDto>>(`${this.apiUrl}/parroquias`, { params: httpParams });
  }

  /**
   * Obtener parroquias por municipio para dropdown
   */
  getParroquiasByMunicipio(codMunicipio: number): Observable<PoliticalDivisionSelectOption[]> {
    return this.getParroquias({ cod_municipio: codMunicipio, per_page: 100 }).pipe(
      map(response => response.message.data.map(parroquia => ({
        label: parroquia.nom_parroquia,
        value: parroquia.cod_parroquia
      })))
    );
  }

  /**
   * Crear nueva parroquia
   */
  createParroquia(parroquia: ParroquiaCreateDto): Observable<SingleItemResponse<ParroquiaDto>> {
    return this.http.post<SingleItemResponse<ParroquiaDto>>(`${this.apiUrl}/parroquias`, parroquia);
  }

  /**
   * Actualizar parroquia existente
   */
  updateParroquia(codParroquia: number, parroquia: ParroquiaUpdateDto): Observable<SingleItemResponse<ParroquiaDto>> {
    return this.http.put<SingleItemResponse<ParroquiaDto>>(`${this.apiUrl}/parroquias/${codParroquia}`, parroquia);
  }

  /**
   * Eliminar parroquia
   */
  deleteParroquia(codParroquia: number): Observable<SingleItemResponse<any>> {
    return this.http.delete<SingleItemResponse<any>>(`${this.apiUrl}/parroquias/${codParroquia}`);
  }

  // ============= CIUDADES =============

  /**
   * Obtener lista paginada de ciudades
   */
  getCiudades(params?: CiudadQueryParams): Observable<PoliticalDivisionListResponse<CiudadDto>> {
    let httpParams = new HttpParams();
    
    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key as keyof CiudadQueryParams];
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }

    return this.http.get<PoliticalDivisionListResponse<CiudadDto>>(`${this.apiUrl}/ciudades`, { params: httpParams });
  }


  /**
   * Crear nueva ciudad
   */
  createCiudad(ciudad: CiudadCreateDto): Observable<SingleItemResponse<CiudadDto>> {
    return this.http.post<SingleItemResponse<CiudadDto>>(`${this.apiUrl}/ciudades`, ciudad);
  }

  /**
   * Actualizar ciudad existente
   */
  updateCiudad(codCiudad: number, ciudad: CiudadUpdateDto): Observable<SingleItemResponse<CiudadDto>> {
    return this.http.put<SingleItemResponse<CiudadDto>>(`${this.apiUrl}/ciudades/${codCiudad}`, ciudad);
  }

  /**
   * Eliminar ciudad
   */
  deleteCiudad(codCiudad: number): Observable<SingleItemResponse<any>> {
    return this.http.delete<SingleItemResponse<any>>(`${this.apiUrl}/ciudades/${codCiudad}`);
  }
}
