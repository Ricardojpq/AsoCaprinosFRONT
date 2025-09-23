import { BaseCatalogEntity } from '../../../shared/models/base-catalog-entity.interface';

export interface ClasificadorDto extends BaseCatalogEntity {
  ced_clasificador: string;
  cod_clasificador: string;
  fec_inicio_clasif: string;
  nro_visitas: number;
  nro_certif_po: number;
  nro_certif_pr: number;
  nro_const_gp: number;
  nro_reb_base: number;
  stat_clasificador: string;
  
  // Campos de persona (para formulario)
  nom_persona?: string;
  ape_persona?: string;
  tel_persona?: string;
  email_persona?: string;
  fec_nacim?: string;
  sexo_persona?: string;
  dir_persona?: string;
  
  // Relaciones
  persona?: {
    ced_persona: string;
    prim_nombre: string;
    seg_nombre?: string;
    prim_apellido: string;
    seg_apellido?: string;
    nombre_completo?: string;
  };
}

export interface CreateClasificadorDto {
  ced_clasificador: string;
  cod_clasificador: string;
  fec_inicio_clasif: string;
  nro_visitas?: number;
  nro_certif_po?: number;
  nro_certif_pr?: number;
  nro_const_gp?: number;
  nro_reb_base?: number;
  stat_clasificador: string;
  is_active?: boolean;
  
  // Campos de persona (opcionales para crear persona si no existe)
  nom_persona?: string;
  ape_persona?: string;
  tel_persona?: string;
  email_persona?: string;
  fec_nacim?: string;
  sexo_persona?: string;
  dir_persona?: string;
}

export interface UpdateClasificadorDto {
  cod_clasificador?: string;
  fec_inicio_clasif?: string;
  nro_visitas?: number;
  nro_certif_po?: number;
  nro_certif_pr?: number;
  nro_const_gp?: number;
  nro_reb_base?: number;
  stat_clasificador?: string;
  is_active?: boolean;
  
  // Campos de persona (opcionales para actualizar persona)
  nom_persona?: string;
  ape_persona?: string;
  tel_persona?: string;
  email_persona?: string;
  fec_nacim?: string;
  sexo_persona?: string;
  dir_persona?: string;
}

export interface ClasificadorFilters {
  cod_clasificador?: string;
  ced_clasificador?: string;
  nombre_persona?: string;
  stat_clasificador?: string;
  is_active?: boolean;
  sort_by?: string;
  sort_dir?: 'asc' | 'desc';
}
