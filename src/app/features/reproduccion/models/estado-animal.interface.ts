export interface TipoEstado {
  id: number;
  nombre: string;
  descripcion?: string;
  is_active: boolean;
}

export interface EstadoCatalogo {
  id: number;
  tipo_estado_id: number;
  nombre: string;
  descripcion?: string;
  orden: number;
  color?: string;
  tipo_estado?: TipoEstado;
  is_active: boolean;
}

export interface HistorialEstadoAnimal {
  id: number;
  animal_id: number;
  tipo_estado_id: number;
  estado_id: number;
  fecha_inicio: string;
  fecha_fin?: string;
  observaciones?: string;
  tipo_estado?: TipoEstado;
  estado?: EstadoCatalogo;
  animal?: any;
}

export interface Parametro {
  id: number;
  nombre: string;
  descripcion?: string;
  valor: string;
  tipo_dato: 'string' | 'integer' | 'decimal' | 'boolean' | 'date';
  categoria?: string;
  is_active: boolean;
}

// Constantes para tipos de estado
export const TIPOS_ESTADO = {
  ETAPA_EVOLUTIVA: 'ETAPA_EVOLUTIVA',
  ESTATUS_REPRODUCTIVO: 'ESTATUS_REPRODUCTIVO',
  ESTATUS_PRODUCTIVO: 'ESTATUS_PRODUCTIVO',
  ESTATUS_GENERAL: 'ESTATUS_GENERAL'
} as const;

// Constantes para estados reproductivos
export const ESTADOS_REPRODUCTIVOS = {
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

// Constantes para etapas evolutivas
export const ETAPAS_EVOLUTIVAS = {
  CRIA: 'CRIA',
  CORDERO: 'CORDERO',
  CORDERA: 'CORDERA',
  BORREGO: 'BORREGO',
  BORREGA: 'BORREGA',
  CARNERO: 'CARNERO',
  OVEJA: 'OVEJA'
} as const;
