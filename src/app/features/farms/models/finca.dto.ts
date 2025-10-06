import { BaseEntity } from '../../../core/models/DTOs/base-entity';

/**
 * Nested DTOs for geographic relationships
 */
export interface PaisDto extends BaseEntity {
  cod_pais: number;
  nom_pais: string;
  siglas_pais: string;
  capital_pais: string;
}

export interface EstadoDto extends BaseEntity {
  cod_estado: number;
  nom_estado: string;
  siglas_estado: string | null;
  cod_pais: number;
  capital_estado: string;
}

export interface MunicipioDto extends BaseEntity {
  cod_municipio: number;
  cod_estado: number;
  nom_municipio: string;
  capital_municipio: string;
}

export interface CiudadDto extends BaseEntity {
  cod_ciudad: number;
  nom_ciudad: string;
  estado_ciudad: string;
  municipio_ciudad: string;
}

export interface PropietarioDto extends BaseEntity {
  ced_persona: string;
  cod_estado: number | null;
  cod_municipio: number | null;
  cod_ciudad: number | null;
  ape_persona: string;
  nom_persona: string;
  nac_persona: string;
  sexo_persona: string;
  fnac_persona: string | null;
  edad_persona: number | null;
  tlf_persona: string | null;
  cel_persona: string | null;
  dir_persona: string | null;
  email_persona: string | null;
  foto_persona: string | null;
  estatus_persona: string;
  es_socio: boolean;
  num_ced_e: string | null;
  es_veteri: boolean | null;
  es_personal: boolean | null;
  es_empleado: boolean | null;
  cod_pais: number | null;
  es_externo: boolean | null;
  imagen: string | null;
}

/**
 * DTO for Propietario in Finca relationship
 */
export interface PropietarioFincaDto {
  ced_propietario: string;
  propietario_principal: boolean;
  nombre_completo?: string; // Nombre completo del propietario (solo para UI)
}

/**
 * Main Finca DTO matching backend response
 */
export interface FincaDto extends BaseEntity {
  cod_finca: number;
  cod_empresa: number;
  cod_municipio: number;
  cod_estado: number;
  cod_ciudad: number;
  ide_finca: string;
  direccion: string;
  nomb_finca: string;
  tlf: string | null;
  rif: string | null;
  fec_inicio: string;
  fec_actualizacion: string;
  hierro: string | null;
  tipo_ganaderia: string | null;
  tipo_sistema: string | null;
  banco_semen: string | null;
  nro_sec_exp: string | null;
  dir_export: string | null;
  dir_import: string | null;
  formato_export: string | null;
  ced_propietario: string;
  cel_propietrio: string | null;
  email_propietario: string | null;
  persona_contacto: string | null;
  cel_contacto: string | null;
  email_contacto: string | null;
  previa_sigmav: string | null;
  tipo_criador: string | null;
  es_socio: boolean | null;
  cod_pais: number;
  ide_criador_externo: string | null;
  fec_ult_celo: string | null;
  fec_ult_servicio: string | null;
  fec_ult_diagnostico: string | null;
  fec_ult_parto: string | null;
  fec_ult_prog_monta: string | null;
  predio_estado: string | null;
  predio_municipio: string | null;
  predio_parroquia: string | null;
  abr_finca: string | null;
  id_criador: string | null;
  imagen: string | null;
  estatus_finca: string;

  // Nested relationships
  pais?: PaisDto;
  estado?: EstadoDto;
  municipio?: MunicipioDto;
  ciudad?: CiudadDto;
  propietario?: PropietarioDto; // Deprecated - mantener por compatibilidad
  propietarios?: PropietarioDto[]; // Nueva relación múltiple
}

/**
 * DTO for creating new Finca
 */
export interface CreateFincaDto {
  cod_empresa: number;
  cod_municipio: number;
  cod_estado: number;
  cod_ciudad: number;
  ide_finca: string;
  direccion: string;
  nomb_finca: string;
  tlf?: string;
  rif?: string;
  fec_inicio: string;
  fec_actualizacion?: string;
  hierro?: string;
  tipo_ganaderia?: string;
  tipo_sistema?: string;
  banco_semen?: string;
  nro_sec_exp?: string;
  dir_export?: string;
  dir_import?: string;
  formato_export?: string;
  ced_propietario?: string; // Deprecated - mantener por compatibilidad
  cel_propietrio?: string;
  email_propietario?: string;
  propietarios?: PropietarioFincaDto[]; // Nueva estructura de propietarios
  persona_contacto?: string;
  cel_contacto?: string;
  email_contacto?: string;
  previa_sigmav?: string;
  tipo_criador?: string;
  es_socio?: boolean;
  cod_pais: number;
  ide_criador_externo?: string;
  predio_estado?: string;
  predio_municipio?: string;
  predio_parroquia?: string;
  abr_finca?: string;
  id_criador?: string;
  imagen?: string;
  estatus_finca?: string;
}

/**
 * DTO for updating existing Finca
 */
export interface UpdateFincaDto {
  cod_empresa?: number;
  cod_municipio?: number;
  cod_estado?: number;
  cod_ciudad?: number;
  ide_finca?: string;
  direccion?: string;
  nomb_finca?: string;
  tlf?: string;
  rif?: string;
  fec_actualizacion?: string;
  hierro?: string;
  tipo_ganaderia?: string;
  tipo_sistema?: string;
  banco_semen?: string;
  nro_sec_exp?: string;
  dir_export?: string;
  dir_import?: string;
  formato_export?: string;
  ced_propietario?: string; // Deprecated
  cel_propietrio?: string;
  email_propietario?: string;
  propietarios?: PropietarioFincaDto[]; // Nueva estructura de propietarios
  persona_contacto?: string;
  cel_contacto?: string;
  email_contacto?: string;
  previa_sigmav?: string;
  tipo_criador?: string;
  es_socio?: boolean;
  cod_pais?: number;
  ide_criador_externo?: string;
  predio_estado?: string;
  predio_municipio?: string;
  predio_parroquia?: string;
  abr_finca?: string;
  id_criador?: string;
  imagen?: string;
  estatus_finca?: string;
}

/**
 * Query parameters for filtering Fincas
 */
export interface FincaQueryParams {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_dir?: 'asc' | 'desc';
  nom_finca?: string;
  cod_estado?: number;
  cod_municipio?: number;
  cod_ciudad?: number;
  ced_propietario?: string;
  estatus_finca?: string;
  search?: string;
}

/**
 * Simplified Finca DTO for selection tables
 */
export interface FincaSelectionDto {
  cod_finca: number;
  ide_finca: string;
  nomb_finca: string;
  estado: string;
  municipio: string;
  ciudad: string;
  propietario: string;
}

/**
 * Filters interface for Finca table
 */
export interface FincaFilters {
  nom_finca?: string;
  cod_estado?: number;
  cod_municipio?: number;
  cod_ciudad?: number;
  ced_propietario?: string;
  estatus_finca?: string;
}
