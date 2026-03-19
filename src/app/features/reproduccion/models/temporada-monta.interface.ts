export interface TemporadaMonta {
  id: number;
  codFinca: number;
  machoId: number;
  fechaInicio: string;
  fechaFin?: string;
  estado: 'ACTIVA' | 'FINALIZADA' | 'CANCELADA';
  observaciones?: string;
  finca?: any;
  macho?: any;
  hembras?: TemporadaMontaHembra[];
  estadisticas?: TemporadaMontaEstadisticas;
  createdAt?: string;
  updatedAt?: string;
}

export interface TemporadaMontaHembra {
  id: number;
  temporadaMontaId: number;
  hembraId: number;
  estadoReproduccion: 'EN_MONTA' | 'PREÑADA' | 'VACIA' | 'ABORTO';
  fechaMonta?: string;
  fechaConfirmacionPrenez?: string;
  fechaPartoEstimada?: string;
  observaciones?: string;
  hembra?: any;
  temporadaMonta?: TemporadaMonta;
  createdAt?: string;
  updatedAt?: string;
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
