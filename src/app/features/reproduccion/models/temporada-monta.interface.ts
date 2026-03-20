export interface TemporadaMonta {
  id: number;
  cod_finca: number;
  macho_id: number;
  fecha_inicio: string;
  fecha_fin?: string;
  estado: 'ACTIVA' | 'FINALIZADA' | 'CANCELADA';
  observaciones?: string;
  finca?: any;
  macho?: any;
  hembras?: TemporadaMontaHembra[];
  estadisticas?: TemporadaMontaEstadisticas;
  created_at?: string;
  updated_at?: string;
}

export interface TemporadaMontaHembra {
  id: number;
  temporada_monta_id: number;
  hembra_id: number;
  estado_reproduccion: 'EN_MONTA' | 'PREÑADA' | 'VACIA' | 'ABORTO';
  fecha_monta?: string;
  fecha_confirmacion_prenez?: string;
  fecha_parto_estimada?: string;
  observaciones?: string;
  hembra?: any;
  temporada_monta?: TemporadaMonta;
  created_at?: string;
  updated_at?: string;
}

export interface TemporadaMontaEstadisticas {
  total_hembras: number;
  en_monta: number;
  prenadas: number;
  vacias: number;
  abortos: number;
}

export interface CreateTemporadaMontaRequest {
  cod_finca: number;
  macho_id: number;
  fecha_inicio: string;
  observaciones?: string;
}

export interface AgregarHembrasRequest {
  hembras_ids: number[];
}
