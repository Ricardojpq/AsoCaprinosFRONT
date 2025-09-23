/**
 * Pais DTO
 */
export interface PaisDto {
  cod_pais: number;
  nom_pais: string;
  siglas_pais: string;
  capital_pais: string;
  is_active: boolean;
  created_by: number;
  updated_by: number | null;
  is_deleted: boolean;
  created_at: string;
  updated_at: string | null;
  deleted_at: string | null;
}

/**
 * Estado DTO
 */
export interface EstadoDto {
  cod_estado: number;
  nom_estado: string;
  siglas_estado: string | null;
  cod_pais: number;
  capital_estado: string;
  is_active: boolean;
  created_by: number;
  updated_by: number | null;
  is_deleted: boolean;
  created_at: string;
  updated_at: string | null;
  deleted_at: string | null;
}

/**
 * Municipio DTO
 */
export interface MunicipioDto {
  cod_municipio: number;
  cod_estado: number;
  nom_municipio: string;
  capital_municipio: string;
  is_active: boolean;
  created_by: number;
  updated_by: number | null;
  is_deleted: boolean;
  created_at: string;
  updated_at: string | null;
  deleted_at: string | null;
}

/**
 * Ciudad DTO
 */
export interface CiudadDto {
  cod_ciudad: number;
  nom_ciudad: string;
  estado_ciudad: string;
  municipio_ciudad: string;
  is_active: boolean;
  created_by: number;
  updated_by: number | null;
  is_deleted: boolean;
  created_at: string;
  updated_at: string | null;
  deleted_at: string | null;
}

/**
 * Propietario DTO
 */
export interface PropietarioDto {
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
  is_active: boolean;
  created_by: number;
  updated_by: number | null;
  is_deleted: boolean;
  created_at: string;
  updated_at: string | null;
  deleted_at: string | null;
}

/**
 * Finca DTO - Complete structure from backend
 */
export interface FincaDto {
  cod_finca: number;
  cod_empresa: number;
  cod_municipio: number;
  cod_estado: number;
  cod_ciudad: number;
  ide_finca: string;
  direccion: string;
  nomb_finca: string;
  tlf: string;
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
  imagen: string;
  estatus_finca: string;
  is_active: boolean;
  created_by: number;
  updated_by: number | null;
  is_deleted: boolean;
  created_at: string;
  updated_at: string | null;
  deleted_at: string | null;
  
  // Relaciones
  pais: PaisDto;
  estado: EstadoDto;
  municipio: MunicipioDto;
  ciudad: CiudadDto;
  propietario: PropietarioDto;
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
