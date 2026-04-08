import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  TemporadaMonta,
  CreateBreedingSeasonRequest,
  AgregarHembrasRequest,
  TemporadaMontaHembra,
  TemporadaMontaEstadisticas
} from '../models/temporada-monta.interface';
import {
  Parto,
  CreatePartoRequest,
  Cria,
  CreateCriaRequest,
  ControlLactancia,
  PartoEstadisticas,
  LactanciaEstadisticas
} from '../models/parto.interface';
import { Parametro } from '../models/estado-animal.interface';
import {
  LaravelPaginationResponse as PaginatedResponse,
  LaravelSingleItemResponse as ApiResponse
} from '@core/models/DTOs/laravel-response';

export interface DiagnosticoResponse {
  hembras: TemporadaMontaHembra[];
  diasEspera: number;
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

@Injectable({
  providedIn: 'root'
})
export class ReproductionService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}${environment.apiPrefix}/${environment.apiVersion}`;

  // =====================================================
  // FINCAS
  // =====================================================

  getFarms(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/fincas`);
  }

  // =====================================================
  // PARÁMETROS
  // =====================================================

  getParametros(filters?: { 
    categoria?: string; 
    search?: string;
    page?: number;
    per_page?: number;
    sort_by?: string;
    sort_dir?: string;
  }): Observable<ApiResponse<PaginatedResponse<Parametro>>> {
    let params = new HttpParams();
    if (filters?.categoria) params = params.set('categoria', filters.categoria);
    if (filters?.search) params = params.set('search', filters.search);
    if (filters?.page) params = params.set('page', filters.page.toString());
    if (filters?.per_page) params = params.set('per_page', filters.per_page.toString());
    if (filters?.sort_by) params = params.set('sort_by', filters.sort_by);
    if (filters?.sort_dir) params = params.set('sort_dir', filters.sort_dir);
    return this.http.get<ApiResponse<PaginatedResponse<Parametro>>>(`${this.apiUrl}/parametros`, { params });
  }

  getParametroPorNombre(nombre: string): Observable<ApiResponse<Parametro>> {
    return this.http.get<ApiResponse<Parametro>>(`${this.apiUrl}/parametros/nombre/${nombre}`);
  }

  getParametrosPorCategoria(categoria: string): Observable<ApiResponse<Parametro[]>> {
    return this.http.get<ApiResponse<Parametro[]>>(`${this.apiUrl}/parametros/categoria/${categoria}`);
  }

  getParametro(id: number): Observable<ApiResponse<Parametro>> {
    return this.http.get<ApiResponse<Parametro>>(`${this.apiUrl}/parametros/${id}`);
  }

  createParametro(data: Partial<Parametro>): Observable<ApiResponse<Parametro>> {
    return this.http.post<ApiResponse<Parametro>>(`${this.apiUrl}/parametros`, data);
  }

  updateParametro(id: number, data: Partial<Parametro>): Observable<ApiResponse<Parametro>> {
    return this.http.put<ApiResponse<Parametro>>(`${this.apiUrl}/parametros/${id}`, data);
  }

  deleteParametro(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/parametros/${id}`);
  }

  // =====================================================
  // TEMPORADAS DE MONTA
  // =====================================================

  getBreedingSeasons(filters?: {
    cod_finca?: number;
    estado?: string;
    buscar?: string;
    fecha_inicio?: string;
    fecha_fin?: string;
    per_page?: number;
    page?: number;
  }): Observable<ApiResponse<PaginatedResponse<TemporadaMonta>>> {
    let params = new HttpParams();
    if (filters?.cod_finca) params = params.set('cod_finca', filters.cod_finca.toString());
    if (filters?.estado) params = params.set('estado', filters.estado);
    if (filters?.buscar) params = params.set('buscar', filters.buscar);
    if (filters?.fecha_inicio) params = params.set('fecha_inicio', filters.fecha_inicio);
    if (filters?.fecha_fin) params = params.set('fecha_fin', filters.fecha_fin);
    if (filters?.per_page) params = params.set('per_page', filters.per_page.toString());
    if (filters?.page) params = params.set('page', filters.page.toString());
    return this.http.get<ApiResponse<PaginatedResponse<TemporadaMonta>>>(`${this.apiUrl}/reproduction/temporadas-monta`, { params });
  }

  getActiveMatingSeasons(codFinca?: number): Observable<ApiResponse<TemporadaMonta[]>> {
    let params = new HttpParams();
    if (codFinca) params = params.set('cod_finca', codFinca.toString());
    return this.http.get<ApiResponse<TemporadaMonta[]>>(`${this.apiUrl}/reproduction/temporadas-monta/activas`, { params });
  }

  getMatingSeason(id: number): Observable<ApiResponse<TemporadaMonta>> {
    return this.http.get<ApiResponse<TemporadaMonta>>(`${this.apiUrl}/reproduction/temporadas-monta/${id}`);
  }

  getTemporadaEstadisticas(id: number): Observable<ApiResponse<TemporadaMontaEstadisticas>> {
    return this.http.get<ApiResponse<TemporadaMontaEstadisticas>>(`${this.apiUrl}/reproduction/temporadas-monta/${id}/statistics`);
  }

  createBreedingSeasons(data: CreateBreedingSeasonRequest): Observable<ApiResponse<TemporadaMonta>> {
    return this.http.post<ApiResponse<TemporadaMonta>>(`${this.apiUrl}/reproduction/temporadas-monta`, data);
  }

  updateTemporadaMonta(id: number, data: Partial<TemporadaMonta>): Observable<ApiResponse<TemporadaMonta>> {
    return this.http.put<ApiResponse<TemporadaMonta>>(`${this.apiUrl}/reproduction/temporadas-monta/${id}`, data);
  }

  endMatingSeason(id: number): Observable<ApiResponse<TemporadaMonta>> {
    return this.http.post<ApiResponse<TemporadaMonta>>(`${this.apiUrl}/reproduction/temporadas-monta/${id}/finalizar`, {});
  }

  cancelMatingSeason(id: number): Observable<ApiResponse<TemporadaMonta>> {
    return this.http.post<ApiResponse<TemporadaMonta>>(`${this.apiUrl}/reproduction/temporadas-monta/${id}/cancelar`, {});
  }

  addFemalesToSeason(temporadaId: number, data: AgregarHembrasRequest): Observable<ApiResponse<TemporadaMontaHembra[]>> {
    return this.http.post<ApiResponse<TemporadaMontaHembra[]>>(`${this.apiUrl}/reproduction/temporadas-monta/${temporadaId}/hembras`, data);
  }

  confirmPregnancy(hembraId: number): Observable<ApiResponse<TemporadaMontaHembra>> {
    return this.http.post<ApiResponse<TemporadaMontaHembra>>(`${this.apiUrl}/reproduction/temporadas-monta/hembras/${hembraId}/confirmar-prenez`, {});
  }

  marcarVacia(hembraId: number): Observable<ApiResponse<TemporadaMontaHembra>> {
    return this.http.post<ApiResponse<TemporadaMontaHembra>>(`${this.apiUrl}/reproduction/temporadas-monta/hembras/${hembraId}/marcar-vacia`, {});
  }

  // =====================================================
  // ANIMALES DISPONIBLES
  // =====================================================

  getAvailableFemales(codFinca: number): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/reproduction/hembras-disponibles/${codFinca}`);
  }

  getMachosReproductores(codFinca: number): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/reproduction/machos-reproductores/${codFinca}`);
  }

  // =====================================================
  // PARTOS
  // =====================================================

  getPartos(filters?: {
    cod_finca?: number;
    fecha_inicio?: string;
    fecha_fin?: string;
    per_page?: number;
    page?: number;
  }): Observable<ApiResponse<PaginatedResponse<Parto>>> {
    let params = new HttpParams();
    if (filters?.cod_finca) params = params.set('cod_finca', filters.cod_finca.toString());
    if (filters?.fecha_inicio) params = params.set('fecha_inicio', filters.fecha_inicio);
    if (filters?.fecha_fin) params = params.set('fecha_fin', filters.fecha_fin);
    if (filters?.per_page) params = params.set('per_page', filters.per_page.toString());
    if (filters?.page) params = params.set('page', filters.page.toString());
    return this.http.get<ApiResponse<PaginatedResponse<Parto>>>(`${this.apiUrl}/reproduction/partos`, { params });
  }

  getParto(id: number): Observable<ApiResponse<Parto>> {
    return this.http.get<ApiResponse<Parto>>(`${this.apiUrl}/reproduction/partos/${id}`);
  }

  getPartoCrias(id: number): Observable<ApiResponse<Cria[]>> {
    return this.http.get<ApiResponse<Cria[]>>(`${this.apiUrl}/reproduction/partos/${id}/crias`);
  }

  getPartoEstadisticas(codFinca: number, fechaInicio?: string, fechaFin?: string): Observable<ApiResponse<PartoEstadisticas>> {
    let params = new HttpParams();
    if (fechaInicio) params = params.set('fecha_inicio', fechaInicio);
    if (fechaFin) params = params.set('fecha_fin', fechaFin);
    return this.http.get<ApiResponse<PartoEstadisticas>>(`${this.apiUrl}/reproduction/partos/statistics/${codFinca}`, { params });
  }

  getProximosPartos(codFinca: number, dias?: number): Observable<ApiResponse<TemporadaMontaHembra[]>> {
    let params = new HttpParams();
    if (dias) params = params.set('dias', dias.toString());
    return this.http.get<ApiResponse<TemporadaMontaHembra[]>>(`${this.apiUrl}/reproduction/partos/proximos/${codFinca}`, { params });
  }

  getHembrasPreñadas(codFinca: number): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/reproduction/partos/hembras-prenadas/${codFinca}`);
  }

  getPersonas(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/personas`);
  }

  createParto(data: CreatePartoRequest): Observable<ApiResponse<Parto>> {
    return this.http.post<ApiResponse<Parto>>(`${this.apiUrl}/reproduction/partos`, data);
  }

  updateParto(id: number, data: Partial<Parto>): Observable<ApiResponse<Parto>> {
    return this.http.put<ApiResponse<Parto>>(`${this.apiUrl}/reproduction/partos/${id}`, data);
  }

  updatePartoDetalle(detalleId: number, data: any): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/reproduction/partos/detalles/${detalleId}`, data);
  }

  deleteParto(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/reproduction/partos/${id}`);
  }

  registrarCria(partoDetalleId: number, data: CreateCriaRequest): Observable<ApiResponse<Cria>> {
    return this.http.post<ApiResponse<Cria>>(`${this.apiUrl}/reproduction/partos/${partoDetalleId}/crias`, data);
  }

  updateCria(criaId: number, data: Partial<Cria>): Observable<ApiResponse<Cria>> {
    return this.http.put<ApiResponse<Cria>>(`${this.apiUrl}/reproduction/partos/crias/${criaId}`, data);
  }

  deleteCria(criaId: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/reproduction/partos/crias/${criaId}`);
  }

  // =====================================================
  // LACTANCIA
  // =====================================================

  getControlesLactancia(filters?: {
    cod_finca?: number;
    estado?: string;
    cria?: string;
    madre?: string;
    fecha_inicio?: string;
    fecha_fin?: string;
    per_page?: number;
    page?: number;
  }): Observable<ApiResponse<PaginatedResponse<ControlLactancia>>> {
    let params = new HttpParams();
    if (filters?.cod_finca) params = params.set('cod_finca', filters.cod_finca.toString());
    if (filters?.estado) params = params.set('estado', filters.estado);
    if (filters?.cria) params = params.set('cria', filters.cria);
    if (filters?.madre) params = params.set('madre', filters.madre);
    if (filters?.fecha_inicio) params = params.set('fecha_inicio', filters.fecha_inicio);
    if (filters?.fecha_fin) params = params.set('fecha_fin', filters.fecha_fin);
    if (filters?.per_page) params = params.set('per_page', filters.per_page.toString());
    if (filters?.page) params = params.set('page', filters.page.toString());
    return this.http.get<ApiResponse<PaginatedResponse<ControlLactancia>>>(`${this.apiUrl}/reproduction/lactancia`, { params });
  }

  getControlLactancia(id: number): Observable<ApiResponse<ControlLactancia>> {
    return this.http.get<ApiResponse<ControlLactancia>>(`${this.apiUrl}/reproduction/lactancia/${id}`);
  }

  getCriasEnCalostro(codFinca?: number): Observable<ApiResponse<ControlLactancia[]>> {
    let params = new HttpParams();
    if (codFinca) params = params.set('cod_finca', codFinca.toString());
    return this.http.get<ApiResponse<ControlLactancia[]>>(`${this.apiUrl}/reproduction/lactancia/calostro`, { params });
  }

  getCriasLactando(codFinca?: number): Observable<ApiResponse<ControlLactancia[]>> {
    let params = new HttpParams();
    if (codFinca) params = params.set('cod_finca', codFinca.toString());
    return this.http.get<ApiResponse<ControlLactancia[]>>(`${this.apiUrl}/reproduction/lactancia/lactando`, { params });
  }

  getLactationStats(codFinca?: number): Observable<ApiResponse<LactanciaEstadisticas>> {
    let params = new HttpParams();
    if (codFinca) params = params.set('cod_finca', codFinca.toString());
    return this.http.get<ApiResponse<LactanciaEstadisticas>>(`${this.apiUrl}/reproduction/lactancia/statistics`, { params });
  }

  getProximosDestetes(codFinca: number, dias?: number): Observable<ApiResponse<ControlLactancia[]>> {
    let params = new HttpParams();
    if (dias) params = params.set('dias', dias.toString());
    return this.http.get<ApiResponse<ControlLactancia[]>>(`${this.apiUrl}/reproduction/lactancia/proximos-destetes/${codFinca}`, { params });
  }

  startLactation(id: number): Observable<ApiResponse<ControlLactancia>> {
    return this.http.post<ApiResponse<ControlLactancia>>(`${this.apiUrl}/reproduction/lactancia/${id}/iniciar-lactancia`, {});
  }

  registerWeaning(id: number, peso?: number): Observable<ApiResponse<ControlLactancia>> {
    return this.http.post<ApiResponse<ControlLactancia>>(`${this.apiUrl}/reproduction/lactancia/${id}/destete`, { peso });
  }

  // =====================================================
  // ESTADOS DE ANIMALES
  // =====================================================

  getTiposEstado(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/reproduction/estados-animal/tipos`);
  }

  getStatusByType(tipoNombre: string): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/reproduction/estados-animal/tipos/${tipoNombre}/estados`);
  }

  getAnimalWithStatus(filters?: { cod_finca?: number; sexo?: string }): Observable<ApiResponse<any[]>> {
    let params = new HttpParams();
    if (filters?.cod_finca) params = params.set('cod_finca', filters.cod_finca.toString());
    if (filters?.sexo) params = params.set('sexo', filters.sexo);
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/reproduction/estados-animal/animales`, { params });
  }

  getEstadosAnimal(animalId: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/reproduction/estados-animal/animal/${animalId}`);
  }

  getAnimalHistory(animalId: number, tipo?: string): Observable<ApiResponse<any>> {
    let params = new HttpParams();
    if (tipo) params = params.set('tipo', tipo);
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/reproduction/estados-animal/animal/${animalId}/historial`, { params });
  }

  changeAnimalStatus(data: { animal_id: number; tipo_estado: string; nuevo_estado: string; comments?: string }): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/reproduction/estados-animal/cambiar`, data);
  }

  bulkUpdateStatus(data: { animal_ids: number[]; tipo_estado: string; nuevo_estado: string; comments?: string }): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/reproduction/estados-animal/cambiar-masivo`, data);
  }

  // =====================================================
  // DIAGNÓSTICO DE PREÑEZ
  // =====================================================

  getHembrasParaDiagnostico(filters?: {
    cod_finca?: number;
    busqueda?: string;
    fecha_inicio?: string;
    fecha_fin?: string;
    per_page?: number;
    page?: number;
  }): Observable<ApiResponse<DiagnosticoResponse>> {
    let params = new HttpParams();
    if (filters?.cod_finca) params = params.set('cod_finca', filters.cod_finca.toString());
    if (filters?.busqueda) params = params.set('busqueda', filters.busqueda);
    if (filters?.fecha_inicio) params = params.set('fecha_inicio', filters.fecha_inicio);
    if (filters?.fecha_fin) params = params.set('fecha_fin', filters.fecha_fin);
    if (filters?.per_page) params = params.set('per_page', filters.per_page.toString());
    if (filters?.page) params = params.set('page', filters.page.toString());
    return this.http.get<ApiResponse<DiagnosticoResponse>>(`${this.apiUrl}/reproduction/diagnostico-prenez`, { params });
  }

  getHembrasPendientesDiagnostico(filters?: {
    cod_finca?: number;
    busqueda?: string;
    fecha_inicio?: string;
    fecha_fin?: string;
    per_page?: number;
    page?: number;
  }): Observable<ApiResponse<DiagnosticoResponse>> {
    let params = new HttpParams();
    if (filters?.cod_finca) params = params.set('cod_finca', filters.cod_finca.toString());
    if (filters?.busqueda) params = params.set('busqueda', filters.busqueda);
    if (filters?.fecha_inicio) params = params.set('fecha_inicio', filters.fecha_inicio);
    if (filters?.fecha_fin) params = params.set('fecha_fin', filters.fecha_fin);
    if (filters?.per_page) params = params.set('per_page', filters.per_page.toString());
    if (filters?.page) params = params.set('page', filters.page.toString());
    return this.http.get<ApiResponse<DiagnosticoResponse>>(`${this.apiUrl}/reproduction/diagnostico-prenez/pendientes`, { params });
  }

  registrarDiagnosticoPrenez(data: { temporada_monta_hembra_id: number; resultado: 'PREÑADA' | 'VACIA' }): Observable<ApiResponse<TemporadaMontaHembra>> {
    return this.http.post<ApiResponse<TemporadaMontaHembra>>(`${this.apiUrl}/reproduction/diagnostico-prenez`, data);
  }

  registrarDiagnosticoMasivo(diagnosticos: { temporada_monta_hembra_id: number; resultado: 'PREÑADA' | 'VACIA' }[]): Observable<ApiResponse<TemporadaMontaHembra[]>> {
    return this.http.post<ApiResponse<TemporadaMontaHembra[]>>(`${this.apiUrl}/reproduction/diagnostico-prenez/masivo`, { diagnosticos });
  }
}
