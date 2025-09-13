export interface Finca {
  cod_finca: number;
  cod_empresa?: number | null;
  cod_municipio?: number | null;
  cod_estado?: number | null;
  cod_ciudad?: number | null;
  ide_finca?: string | null;
  direccion?: string | null;
  nomb_finca: string;
  tlf?: string | null;
  rif?: string | null;
  fec_inicio?: string | null;
  fec_actualizacion?: string | null;
  hierro?: number | null;
  tipo_ganaderia?: string | null;
  tipo_sistema?: string | null;
  banco_semen?: string | null;
  nro_sec_exp?: number | null;
  dir_export?: string | null;
  dir_import?: string | null;
  formato_export?: string | null;
  ced_propietario?: string | null;
  cel_propietrio?: string | null;
  email_propietario?: string | null;
  persona_contacto?: string | null;
  cel_contacto?: string | null;
  email_contacto?: string | null;
  previa_sigmav?: string | null;
  tipo_criador?: string | null;
  es_socio?: boolean | null;
  cod_pais?: number | null;
  ide_criador_externo?: string | null;
  fec_ult_celo?: string | null;
  fec_ult_servicio?: string | null;
  fec_ult_diagnostico?: string | null;
  fec_ult_parto?: string | null;
  fec_ult_prog_monta?: string | null;
  predio_estado?: string | null;
  predio_municipio?: string | null;
  predio_parroquia?: string | null;
  abr_finca?: string | null;
  id_criador?: number | null;
  imagen?: string | null;
  estatus_finca?: string | null;
  is_active: boolean;
  created_by?: number | null;
  updated_by?: number | null;
  is_deleted: boolean;
  created_at?: string;
  updated_at?: string;
  
  // Relationships
  pais?: Pais;
  estado?: Estado;
  municipio?: Municipio;
  ciudad?: Ciudad;
  propietario?: Persona;
  animales?: Animal[];
  socios?: Socio[];
  usuarios?: Usuario[];
}

export interface FincaDto {
  cod_finca?: number;
  cod_empresa?: number | null;
  cod_municipio?: number | null;
  cod_estado?: number | null;
  cod_ciudad?: number | null;
  ide_finca?: string | null;
  direccion?: string | null;
  nomb_finca: string;
  tlf?: string | null;
  rif?: string | null;
  fec_inicio?: string | null;
  fec_actualizacion?: string | null;
  hierro?: number | null;
  tipo_ganaderia?: string | null;
  tipo_sistema?: string | null;
  banco_semen?: string | null;
  nro_sec_exp?: number | null;
  dir_export?: string | null;
  dir_import?: string | null;
  formato_export?: string | null;
  ced_propietario?: string | null;
  cel_propietrio?: string | null;
  email_propietario?: string | null;
  persona_contacto?: string | null;
  cel_contacto?: string | null;
  email_contacto?: string | null;
  previa_sigmav?: string | null;
  tipo_criador?: string | null;
  es_socio?: boolean | null;
  cod_pais?: number | null;
  ide_criador_externo?: string | null;
  fec_ult_celo?: string | null;
  fec_ult_servicio?: string | null;
  fec_ult_diagnostico?: string | null;
  fec_ult_parto?: string | null;
  fec_ult_prog_monta?: string | null;
  predio_estado?: string | null;
  predio_municipio?: string | null;
  predio_parroquia?: string | null;
  abr_finca?: string | null;
  id_criador?: number | null;
  imagen?: string | null;
  estatus_finca?: string | null;
  is_active?: boolean;
  created_by?: number | null;
  updated_by?: number | null;
  is_deleted?: boolean;
}

export interface FincaCreateDto {
  nomb_finca: string;
  cod_empresa?: number;
  cod_municipio?: number;
  cod_estado?: number;
  cod_ciudad?: number;
  cod_pais?: number;
  ide_finca?: string;
  direccion?: string;
  tlf?: string;
  rif?: string;
  fec_inicio?: string;
  tipo_ganaderia?: string;
  tipo_sistema?: string;
  ced_propietario?: string;
  cel_propietrio?: string;
  email_propietario?: string;
  persona_contacto?: string;
  cel_contacto?: string;
  email_contacto?: string;
  tipo_criador?: string;
  es_socio?: boolean;
  is_active?: boolean;
}

export interface FincaUpdateDto {
  nomb_finca?: string;
  cod_empresa?: number;
  cod_municipio?: number;
  cod_estado?: number;
  cod_ciudad?: number;
  cod_pais?: number;
  ide_finca?: string;
  direccion?: string;
  tlf?: string;
  rif?: string;
  fec_inicio?: string;
  fec_actualizacion?: string;
  tipo_ganaderia?: string;
  tipo_sistema?: string;
  ced_propietario?: string;
  cel_propietrio?: string;
  email_propietario?: string;
  persona_contacto?: string;
  cel_contacto?: string;
  email_contacto?: string;
  tipo_criador?: string;
  es_socio?: boolean;
  estatus_finca?: string;
  is_active?: boolean;
}

export interface FincaListResponseDto {
  status: string;
  message: string;
  data: Finca[];
  total?: number;
  per_page?: number;
  current_page?: number;
  last_page?: number;
}

// Forward declarations for relationships
interface Pais {
  cod_pais: number;
  descripcion: string;
}

interface Estado {
  cod_estado: number;
  descripcion: string;
}

interface Municipio {
  cod_municipio: number;
  descripcion: string;
}

interface Ciudad {
  cod_ciudad: number;
  descripcion: string;
}

interface Persona {
  ced_persona: string;
  nom_persona?: string;
  ape_persona?: string;
}

interface Animal {
  cod_finca: number;
  cod_animal: string;
  nomb_animal: string;
}

interface Socio {
  ced_socio: string;
  cod_finca: number;
}

interface Usuario {
  id_usuario: number;
  nombre_usuario: string;
  apellido_usuario: string;
}
