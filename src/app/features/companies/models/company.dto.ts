import { BaseEntity } from '../../../core/models/DTOs';

export interface EmpresaDto extends BaseEntity {
  cod_empresa: number;
  cod_estado: number;
  cod_municipio: number;
  cod_ciudad: number;
  nom_empresa: string;
  rif_empresa: string;
  tlf_empresa?: string;
  fax_empresa?: string;
  dir_empresa?: string;
  email?: string;
  ced_presidente?: string;
  
  // Relaciones
  estado?: {
    cod_estado: number;
    nom_estado: string;
    siglas_estado?: string;
    cod_pais: number;
    capital_estado: string;
    is_active: boolean;
    created_by?: number;
    updated_by?: number;
    is_deleted: boolean;
    created_at: string;
    updated_at?: string;
    deleted_at?: string;
  };
  municipio?: {
    cod_municipio: number;
    cod_estado: number;
    nom_municipio: string;
    capital_municipio: string;
    is_active: boolean;
    created_by?: number;
    updated_by?: number;
    is_deleted: boolean;
    created_at: string;
    updated_at?: string;
    deleted_at?: string;
  };
  ciudad?: {
    cod_ciudad: number;
    nom_ciudad: string;
    estado_ciudad: string;
    municipio_ciudad: string;
    is_active: boolean;
    created_by?: number;
    updated_by?: number;
    is_deleted: boolean;
    created_at: string;
    updated_at?: string;
    deleted_at?: string;
  };
  presidente?: {
    ced_persona: string;
    cod_estado?: number;
    cod_municipio?: number;
    cod_ciudad?: number;
    ape_persona: string;
    nom_persona: string;
    nac_persona: string;
    sexo_persona: string;
    fnac_persona?: string;
    edad_persona?: number;
    tlf_persona?: string;
    cel_persona?: string;
    dir_persona?: string;
    email_persona?: string;
    foto_persona?: string;
    estatus_persona: string;
    es_socio: boolean;
    num_ced_e?: string;
    es_veteri?: boolean;
    es_personal?: boolean;
    es_empleado?: boolean;
    cod_pais?: number;
    es_externo?: boolean;
    imagen?: string;
    is_active: boolean;
    created_by?: number;
    updated_by?: number;
    is_deleted: boolean;
    created_at: string;
    updated_at?: string;
    deleted_at?: string;
  };
}

export interface CreateEmpresaDto {
  cod_estado: number;
  cod_municipio: number;
  cod_ciudad: number;
  nom_empresa: string;
  rif_empresa: string;
  tlf_empresa?: string;
  fax_empresa?: string;
  dir_empresa?: string;
  email?: string;
  ced_presidente?: string;
  is_active?: boolean;
}

export interface UpdateEmpresaDto {
  cod_estado?: number;
  cod_municipio?: number;
  cod_ciudad?: number;
  nom_empresa?: string;
  rif_empresa?: string;
  tlf_empresa?: string;
  fax_empresa?: string;
  dir_empresa?: string;
  email?: string;
  ced_presidente?: string;
  is_active?: boolean;
}

export interface EmpresaFilters {
  nom_empresa?: string;
  rif_empresa?: string;
  cod_estado?: number;
  cod_municipio?: number;
  cod_ciudad?: number;
  email?: string;
  nombre_presidente?: string;
  is_active?: boolean;
  sort_by?: string;
  sort_dir?: 'asc' | 'desc';
}
