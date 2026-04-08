// Simple Certificate model for CRUD operations (matches backend Certificate model)
export interface Certificate {
  id?: number;
  cod_animal?: string;
  cod_finca?: string;
  cod_criador?: string;
  cod_propietario?: string;
  cod_clasificador?: string;
  fecha_emision?: string;
  numero_certificado?: string;
  comments?: string;
  is_active?: boolean;
  created_by?: string;
  updated_by?: string;
  is_deleted?: boolean;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;

  // Basic relationships (loaded with Certificate model)
  animal?: {
    cod_finca?: number;
    cod_animal?: string;
    nomb_animal?: string;
    sexo_animal?: string;
    fec_nacim?: string;
    estatus?: string;
    cod_finca_actual?: number;
    finca?: {
      cod_finca?: number;
      nomb_finca?: string;
      direccion?: string;
      tlf?: string;
      rif?: string;
    };
    finca_actual?: {
      cod_finca?: number;
      nomb_finca?: string;
      direccion?: string;
      tlf?: string;
      rif?: string;
    };
  };
  finca_criador?: {
    cod_finca?: number;
    nomb_finca?: string;
    direccion?: string;
    tlf?: string;
    rif?: string;
  };
  finca_propietario?: {
    cod_finca?: number;
    nomb_finca?: string;
    direccion?: string;
    tlf?: string;
    rif?: string;
  };
  clasificador?: {
    ced_clasificador?: string;
    cod_clasificador?: string;
    stat_clasificador?: string;
    persona?: {
      ced_persona?: string;
      nom_persona?: string;
      ape_persona?: string;
      tlf_persona?: string;
      cel_persona?: string;
      email_persona?: string;
    };
  };
}

// Complex DTO for complete certificate information (only for getCompleteInfo endpoint)
export interface CertificateDto {
  id?: number;
  cod_animal?: string;
  cod_finca?: string;
  cod_criador?: string;
  cod_propietario?: string;
  cod_clasificador?: string;
  fecha_emision?: string;
  numero_certificado?: string;
  comments?: string;

  // Información completa del animal
  animal?: AnimalInfoDto;

  // Información de genealogía
  genealogy?: GenealogyDto;

  // Información del criador
  criador?: FincaInfoDto;

  // Información del propietario
  propietario?: FincaInfoDto;

  // Información del clasificador
  clasificador?: ClasificadorInfoDto;

  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AnimalInfoDto {
  cod_animal?: string;
  cod_finca?: string;
  nomb_animal?: string;
  sexo_animal?: string;
  fec_nacim?: string;
  peso_al_nacer?: number;
  peso_actual?: number;
  tatuaje?: string;
  tat_oreja_izq?: string;
  tat_oreja_der?: string;
  tat_cola?: string;
  id_electronico?: string;
  origen?: string;
  porcen_sangre?: string;
  nomb_sangre?: string;
  estatus?: string;
  num_reg?: string; // Número de registro del animal
  raza?: RazaDto;
  color?: ColorDto;
  tipo_pelo?: TipoPeloDto;
  info_orejas?: string;
  info_cuernos?: string;
  tipo_registro?: string;
  aretes?: string;
  reg_intl?: string;
  puntuacion?: number;
}

export interface GenealogyDto {
  padre?: AnimalInfoDto;
  madre?: AnimalInfoDto;
  abuelo_paterno?: AnimalInfoDto;
  abuela_paterna?: AnimalInfoDto;
  abuelo_materno?: AnimalInfoDto;
  abuela_materna?: AnimalInfoDto;
}

export interface FincaInfoDto {
  cod_finca?: string;
  nomb_finca?: string;
  direccion?: string;
  tlf?: string;
  rif?: string;
  fec_inicio?: string;
  hierro?: string;
  tipo_ganaderia?: string;
  tipo_sistema?: string;
  ced_propietario?: string;
  cel_propietrio?: string;
  email_propietario?: string;
  persona_contacto?: string;
  cel_contacto?: string;
  email_contacto?: string;
  abr_finca?: string;
  propietario?: PersonaDto;
}

export interface SocioInfoDto {
  ced_socio?: string;
  cod_finca?: string;
  estatus_socio?: string;
  persona?: PersonaDto;
  finca?: FincaDto;
}

export interface ClasificadorInfoDto {
  ced_clasificador?: string;
  cod_clasificador?: string;
  fec_inicio_clasif?: string;
  nro_visitas?: number;
  nro_certif_po?: number;
  nro_certif_pr?: number;
  stat_clasificador?: string;
  persona?: PersonaDto;
}

export interface PersonaDto {
  ced_persona?: string;
  nom_persona?: string;
  ape_persona?: string;
  sexo_persona?: string;
  fnac_persona?: string;
  tlf_persona?: string;
  cel_persona?: string;
  dir_persona?: string;
  email_persona?: string;
  nac_persona?: string;
}

export interface FincaDto {
  cod_finca?: string;
  nom_finca?: string;
  dir_finca?: string;
  tlf_finca?: string;
  area_finca?: number;
  tipo_finca?: string;
}

export interface RazaDto {
  cod_raza?: string;
  nom_raza?: string;
  desc_raza?: string;
}

export interface ColorDto {
  cod_color?: string;
  nom_color?: string;
  desc_color?: string;
}

export interface TipoPeloDto {
  cod_tipo_pelo?: string;
  nom_tipo_pelo?: string;
  desc_tipo_pelo?: string;
}

// Interface para la tabla de certificados
export interface CertificateTableData {
  id?: number;
  numero_certificado?: string;
  cod_animal?: string;
  nomb_animal?: string;
  cod_criador?: string;
  nombre_criador?: string;
  cod_propietario?: string;
  nombre_propietario?: string;
  cod_clasificador?: string;
  nombre_clasificador?: string;
  fecha_emision?: string;
  is_active?: boolean;
}

// Interface para crear certificados (simplificada)
export interface CreateCertificateDto {
  cod_animal: string;
  ced_clasificador: string;
  comments?: string;
}

// Interface para crear/editar certificados (legacy)
export interface CertificateFormData {
  id?: number;
  cod_animal: string;
  cod_finca: string;
  cod_criador: string;
  cod_propietario: string;
  cod_clasificador: string;
  fecha_emision: string;
  comments?: string;
}

