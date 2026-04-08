import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface StatusType {
  id: number;
  nombre: string;
  descripcion?: string;
}

export interface StatusCatalog {
  id: number;
  nombre: string;
  descripcion?: string;
  tipo_estado_id: number;
  color?: string;
  sexo?: string | null; // M=Macho, H=Hembra, null=Ambos
}

export interface StatusHistory {
  id: number;
  animal_id: number;
  tipo_estado_id: number;
  estado_id: number;
  fecha_inicio: string;
  fecha_fin?: string;
  comments?: string;
  tipo_estado?: StatusType;
  estado?: StatusCatalog;
  duracion_dias?: number;
}

export interface ChangeStatusRequest {
  animal_id: number;
  tipo_estado: string;
  nuevo_estado: string;
  comments?: string;
}

export interface BulkChangeStatusRequest {
  animal_ids: number[];
  tipo_estado: string;
  nuevo_estado: string;
  comments?: string;
}

export interface BulkChangeStatusResponse {
  exitosos: number;
  fallidos: number;
  errores?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AnimalStatusService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}${environment.apiPrefix}/${environment.apiVersion}`;

  /**
   * Obtener todos los tipos de estado disponibles
   */
  getStatusTypes(): Observable<ApiResponse<StatusType[]>> {
    return this.http.get<ApiResponse<StatusType[]>>(`${this.apiUrl}/reproduction/estados-animal/tipos`);
  }

  /**
   * Obtener estados disponibles para un tipo específico
   * @param tipoNombre Nombre del tipo de estado
   * @param sexo Opcional: filtrar por sexo del animal (M/H)
   */
  getStatusByType(tipoNombre: string, sexo?: string): Observable<ApiResponse<StatusCatalog[]>> {
    let params = new HttpParams();
    if (sexo) {
      params = params.set('sexo', sexo);
    }
    return this.http.get<ApiResponse<StatusCatalog[]>>(`${this.apiUrl}/reproduction/estados-animal/tipos/${tipoNombre}/estados`, { params });
  }

  /**
   * Obtener animales con sus estados actuales
   */
  getAnimalWithStatus(filters?: { cod_finca?: number; sexo?: string }): Observable<ApiResponse<any[]>> {
    let params = new HttpParams();
    if (filters?.cod_finca) params = params.set('cod_finca', filters.cod_finca.toString());
    if (filters?.sexo) params = params.set('sexo', filters.sexo);
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/reproduction/estados-animal/animales`, { params });
  }

  /**
   * Obtener estados actuales de un animal específico
   */
  getAnimalStatuses(animalId: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/reproduction/estados-animal/animal/${animalId}`);
  }

  /**
   * Obtener historial de estados de un animal
   */
  getAnimalHistory(animalId: number, tipo?: string): Observable<ApiResponse<StatusHistory[]>> {
    let params = new HttpParams();
    if (tipo) params = params.set('tipo', tipo);
    return this.http.get<ApiResponse<StatusHistory[]>>(`${this.apiUrl}/reproduction/estados-animal/animal/${animalId}/historial`, { params });
  }

  /**
   * Cambiar estado de un animal
   */
  changeStatus(data: ChangeStatusRequest): Observable<ApiResponse<StatusHistory>> {
    return this.http.post<ApiResponse<StatusHistory>>(`${this.apiUrl}/reproduction/estados-animal/cambiar`, data);
  }

  /**
   * Cambiar estado de múltiples animales
   */
  bulkUpdateStatus(data: BulkChangeStatusRequest): Observable<ApiResponse<BulkChangeStatusResponse>> {
    return this.http.post<ApiResponse<BulkChangeStatusResponse>>(`${this.apiUrl}/reproduction/estados-animal/cambiar-masivo`, data);
  }

  /**
   * Obtener fincas disponibles
   */
  getFarms(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/fincas`);
  }

  // =====================================================
  // HELPERS - Métodos de utilidad
  // =====================================================

  /**
   * Obtener el estado actual de un animal para un tipo específico
   */
  getCurrentStatus(animal: any, tipoNombre: string): string {
    if (animal.estados_actuales && animal.estados_actuales[tipoNombre]) {
      return animal.estados_actuales[tipoNombre].estado?.nombre || '-';
    }
    return '-';
  }

  /**
   * Obtener severity para tags según el estado
   */
  getStatusSeverity(estado: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    const severities: Record<string, 'success' | 'info' | 'warn' | 'danger' | 'secondary'> = {
      // Estados generales
      'ACTIVO': 'success',
      'DISPONIBLE': 'success',
      'INACTIVO': 'secondary',
      'VENDIDO': 'secondary',
      'MUERTO': 'danger',
      'FALLECIDO': 'danger',
      'ENFERMO': 'danger',
      'EN_PRESTAMO': 'warn',
      'CUARENTENA': 'warn',
      // Estados reproductivos
      'DESCANSO': 'success',
      'CELO': 'warn',
      'EN_MONTA': 'warn',
      'PREÑADA': 'info',
      'LACTANDO': 'info',
      'PARIDA': 'info',
      'SECA': 'secondary',
      'VACIA': 'secondary',
      'ABORTO': 'danger',
      // Estados productivos
      'REPRODUCTOR': 'success',
      'CEBA': 'info',
      'LECHAL': 'info',
      'DESCARTE': 'secondary'
    };
    return severities[estado] || 'secondary';
  }

  /**
   * Humanizar nombre de tipo de estado
   */
  humanizeTypeName(nombre: string): string {
    const nombres: Record<string, string> = {
      'ESTATUS_GENERAL': 'General',
      'ESTATUS_PRODUCTIVO': 'Productivo',
      'ESTATUS_REPRODUCTIVO': 'Reproductivo',
      'ETAPA_EVOLUTIVA': 'Etapa'
    };
    return nombres[nombre] || nombre.replace(/_/g, ' ').toLowerCase().replace(/^\w/, c => c.toUpperCase());
  }

  /**
   * Transiciones válidas del ciclo reproductivo de la hembra
   */
  getReproductiveTransitions(): Record<string, string[]> {
    return {
      'CELO': ['EN_MONTA'],
      'EN_MONTA': ['PREÑADA', 'VACIA'],
      'PREÑADA': ['LACTANDO', 'PARIDA', 'ABORTO'],
      'PARIDA': ['LACTANDO', 'DESCANSO'],
      'LACTANDO': ['SECA'],
      'SECA': ['DESCANSO'],
      'DESCANSO': ['CELO'],
      'VACIA': ['DESCANSO', 'CELO'],
      'ABORTO': ['DESCANSO']
    };
  }

  /**
   * Obtener transiciones disponibles para un estado reproductivo
   */
  getAvailableTransitions(estadoActual: string): string[] {
    const transitions = this.getReproductiveTransitions();
    return transitions[estadoActual] || [];
  }
}
