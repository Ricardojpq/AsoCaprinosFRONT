export interface PedigreeMetric {
  clave: string;
  etiqueta: string;
  valor: string | number | null;
}

export type PedigreeEstado = 'EN_FINCA' | 'VENDIDO' | 'FALLECIDO' | 'EXTERNO';

export interface PedigreeNode {
  id: number | null;
  cod_finca: number;
  cod_animal: string;
  nomb_animal: string | null;
  sexo: 'M' | 'H' | null;
  fec_nacim: string | null;
  nomb_raza: string | null;
  estado: PedigreeEstado;
  coef_consanguinidad: number | null;
  cod_padre: string | null;
  cod_finca_padre: number | null;
  cod_madre: string | null;
  cod_finca_madre: number | null;
  es_externo: boolean;
  has_more: boolean;
  metricas: PedigreeMetric[];
  padre?: PedigreeNode | null;
  madre?: PedigreeNode | null;
}

export interface UpdateInbreedingPayload {
  coef_consanguinidad: number;
}
