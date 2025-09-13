export interface Persona {
  ced_persona: string;
  cod_estado?: number | null;
  cod_municipio?: number | null;
  cod_ciudad?: number | null;
  ape_persona?: string | null;
  nom_persona?: string | null;
  nac_persona?: string | null;
  sexo_persona?: string | null;
  fnac_persona?: string | null;
  edad_persona?: number | null;
  tlf_persona?: string | null;
  cel_persona?: string | null;
  dir_persona?: string | null;
  email_persona?: string | null;
  foto_persona?: number | null;
  estatus_persona?: string | null;
  es_socio?: boolean | null;
  num_ced_e?: number | null;
  es_veteri?: boolean | null;
  es_personal?: boolean | null;
  es_empleado?: boolean | null;
  cod_pais?: number | null;
  es_externo?: boolean | null;
  imagen?: string | null;
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
  socios?: Socio[];
  fincasComoPropietario?: Finca[];
}

export interface PersonaDto {
  ced_persona: string;
  cod_estado?: number | null;
  cod_municipio?: number | null;
  cod_ciudad?: number | null;
  ape_persona?: string | null;
  nom_persona?: string | null;
  nac_persona?: string | null;
  sexo_persona?: string | null;
  fnac_persona?: string | null;
  edad_persona?: number | null;
  tlf_persona?: string | null;
  cel_persona?: string | null;
  dir_persona?: string | null;
  email_persona?: string | null;
  foto_persona?: number | null;
  estatus_persona?: string | null;
  es_socio?: boolean | null;
  num_ced_e?: number | null;
  es_veteri?: boolean | null;
  es_personal?: boolean | null;
  es_empleado?: boolean | null;
  cod_pais?: number | null;
  es_externo?: boolean | null;
  imagen?: string | null;
  is_active?: boolean;
  created_by?: number | null;
  updated_by?: number | null;
  is_deleted?: boolean;
}

export interface PersonaCreateDto {
  ced_persona: string;
  ape_persona?: string;
  nom_persona?: string;
  nac_persona?: string;
  sexo_persona?: string;
  fnac_persona?: string;
  tlf_persona?: string;
  cel_persona?: string;
  dir_persona?: string;
  email_persona?: string;
  cod_estado?: number;
  cod_municipio?: number;
  cod_ciudad?: number;
  cod_pais?: number;
  es_socio?: boolean;
  es_veteri?: boolean;
  es_personal?: boolean;
  es_empleado?: boolean;
  es_externo?: boolean;
  is_active?: boolean;
}

export interface PersonaUpdateDto {
  ape_persona?: string;
  nom_persona?: string;
  nac_persona?: string;
  sexo_persona?: string;
  fnac_persona?: string;
  tlf_persona?: string;
  cel_persona?: string;
  dir_persona?: string;
  email_persona?: string;
  cod_estado?: number;
  cod_municipio?: number;
  cod_ciudad?: number;
  cod_pais?: number;
  es_socio?: boolean;
  es_veteri?: boolean;
  es_personal?: boolean;
  es_empleado?: boolean;
  es_externo?: boolean;
  is_active?: boolean;
}

// Geographic entities
export interface Pais {
  cod_pais: number;
  descripcion: string;
  is_active: boolean;
}

export interface Estado {
  cod_estado: number;
  cod_pais: number;
  descripcion: string;
  is_active: boolean;
}

export interface Municipio {
  cod_municipio: number;
  cod_estado: number;
  descripcion: string;
  is_active: boolean;
}

export interface Ciudad {
  cod_ciudad: number;
  cod_municipio: number;
  descripcion: string;
  is_active: boolean;
}

// Forward declarations for relationships
interface Socio {
  ced_socio: string;
  cod_finca: number;
  estatus_socio?: string;
}

interface Finca {
  cod_finca: number;
  nomb_finca: string;
}
