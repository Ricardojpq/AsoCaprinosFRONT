export interface Parto {
  id: number;
  cod_finca: number;
  fecha: string;
  responsable_id?: string;
  observaciones?: string;
  finca?: any;
  responsable?: any;
  detalles?: PartoDetalle[];
  estadisticas?: PartoEstadisticas;
  created_at?: string;
  updated_at?: string;
}

export interface PartoDetalle {
  id: number;
  parto_id: number;
  hembra_id: number;
  temporada_monta_hembra_id?: number;
  numero_crias: number;
  crias_vivas: number;
  crias_muertas: number;
  hubo_aborto: boolean;
  causa_aborto?: string;
  estado_madre_post_parto: 'NORMAL' | 'COMPLICACIONES' | 'FALLECIDA';
  tipo_parto: 'NATURAL' | 'ASISTIDO' | 'CESAREA';
  observaciones?: string;
  hembra?: any;
  crias?: Cria[];
  created_at?: string;
  updated_at?: string;
}

export interface Cria {
  id: number;
  parto_detalle_id: number;
  animal_id?: number;
  codigo_provisional?: string;
  sexo: 'M' | 'H';
  peso_nacimiento?: number;
  estado_nacimiento: 'VIVO' | 'MUERTO' | 'DEBIL';
  observaciones?: string;
  control_lactancia?: ControlLactancia;
  created_at?: string;
  updated_at?: string;
}

export interface ControlLactancia {
  id: number;
  cria_id: number;
  fecha_inicio: string;
  fecha_fin_calostro?: string;
  fecha_destete?: string;
  peso_destete?: number;
  estado: 'CALOSTRO' | 'LACTANDO' | 'DESTETADO';
  observaciones?: string;
  dias_calostro?: number;
  dias_lactancia?: number;
  dias_totales?: number;
  created_at?: string;
  updated_at?: string;
}

export interface PartoEstadisticas {
  total_partos: number;
  total_hembras: number;
  total_crias: number;
  crias_vivas: number;
  crias_muertas: number;
  abortos: number;
  promedio_crias_por_parto: number;
  tasa_mortalidad: number;
}

export interface LactanciaEstadisticas {
  en_calostro: number;
  lactando: number;
  destetados: number;
  total: number;
}

export interface CreatePartoRequest {
  cod_finca: number;
  fecha: string;
  responsable_id?: string;
  observaciones?: string;
  detalles: CreatePartoDetalleRequest[];
}

export interface CreatePartoDetalleRequest {
  hembra_id: number;
  temporada_monta_hembra_id?: number;
  tipo_parto?: 'NATURAL' | 'ASISTIDO' | 'CESAREA';
  hubo_aborto?: boolean;
  causa_aborto?: string;
  estado_madre_post_parto?: 'NORMAL' | 'COMPLICACIONES' | 'FALLECIDA';
  observaciones?: string;
  crias?: CreateCriaRequest[];
}

export interface CreateCriaRequest {
  sexo: 'M' | 'H';
  peso_nacimiento?: number;
  estado_nacimiento?: 'VIVO' | 'MUERTO' | 'DEBIL';
  observaciones?: string;
}
