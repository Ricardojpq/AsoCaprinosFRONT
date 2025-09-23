export interface MemberDto {
  ced_socio: string;
  cod_finca: number;
  estatus_socio?: string;
  fec_ingreso?: string;
  observaciones?: string;
  is_active: boolean;
  created_by?: number;
  updated_by?: number;
  is_deleted: boolean;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
  
  // Campos de persona (para formulario)
  nom_persona?: string;
  ape_persona?: string;
  tel_persona?: string;
  email_persona?: string;
  dir_persona?: string;
  sexo_persona?: string;
  fec_nacim?: string;
  
  // Relationships
  persona?: {
    ced_persona: string;
    cod_estado?: number;
    cod_municipio?: number;
    cod_ciudad?: number;
    ape_persona?: string;
    nom_persona?: string;
    nac_persona?: string;
    sexo_persona?: string;
    fnac_persona?: string;
    edad_persona?: number;
    tlf_persona?: string;
    cel_persona?: string;
    dir_persona?: string;
    email_persona?: string;
    foto_persona?: number;
    estatus_persona?: string;
    es_socio?: boolean;
    num_ced_e?: number;
    es_veteri?: boolean;
    es_personal?: boolean;
    es_empleado?: boolean;
    cod_pais?: number;
    es_externo?: boolean;
    imagen?: string;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
  };
  
  finca?: {
    cod_finca: number;
    nomb_finca: string;
    direccion?: string;
    tlf?: string;
    email_propietario?: string;
    is_active: boolean;
  };
}
