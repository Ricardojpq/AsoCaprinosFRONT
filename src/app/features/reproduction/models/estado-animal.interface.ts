export interface StatusType {
  id: number;
  nombre: string;
  descripcion?: string;
  is_active: boolean;
}

export interface StatusCatalog {
  id: number;
  tipo_estado_id: number;
  nombre: string;
  descripcion?: string;
  orden: number;
  color?: string;
  tipo_estado?: StatusType;
  is_active: boolean;
}

export interface AnimalStatusHistory {
  id: number;
  animal_id: number;
  tipo_estado_id: number;
  estado_id: number;
  fecha_inicio: string;
  fecha_fin?: string;
  observaciones?: string;
  tipo_estado?: StatusType;
  estado?: StatusCatalog;
  animal?: any;
}

export interface Parameter {
  id: number;
  nombre: string;
  descripcion?: string;
  valor: string;
  tipo_dato: 'string' | 'integer' | 'decimal' | 'boolean' | 'date';
  categoria?: string;
  is_active: boolean;
}

// Constantes para tipos de estado
export const STATUS_TYPES = {
  ETAPA_EVOLUTIVA: 'ETAPA_EVOLUTIVA',
  ESTATUS_REPRODUCTIVO: 'ESTATUS_REPRODUCTIVO',
  ESTATUS_PRODUCTIVO: 'ESTATUS_PRODUCTIVO',
  ESTATUS_GENERAL: 'ESTATUS_GENERAL'
} as const;

// Constantes para estados reproductivos
export const REPRODUCTIVE_STATUSES = {
  DESCANSO: 'DESCANSO',
  CELO: 'CELO',
  EN_MONTA: 'EN_MONTA',
  VACIA: 'VACIA',
  PRENADA: 'PREÑADA',
  PARIDA: 'PARIDA',
  ABORTO: 'ABORTO',
  LACTANDO: 'LACTANDO',
  SECA: 'SECA'
} as const;

// Constantes para etapas evolutivas (NOMENCLATURA CAPRINA - GAP-001)
export const EVOLUTIONARY_STAGES = {
  CRIA: 'CRIA',
  // Macho
  CABRITO: 'CABRITO',
  CABRITON: 'CABRITON',
  CHIVO: 'CHIVO',
  // Hembra
  CABRITA: 'CABRITA',
  CABRITONA: 'CABRITONA',
  CABRA: 'CABRA',
} as const;
