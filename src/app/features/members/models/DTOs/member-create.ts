export interface MemberCreateDto {
  ced_socio: string;
  cod_finca: number;
  estatus_socio?: string;
  fec_ingreso?: string;
  comments?: string;
  is_active?: boolean;
  
  // Campos de persona (opcionales para crear persona si no existe)
  nom_persona?: string;
  ape_persona?: string;
  tel_persona?: string;
  email_persona?: string;
  dir_persona?: string;
  sexo_persona?: string;
  fec_nacim?: string;
  cod_pais?: number;
  cod_estado?: number;
  cod_municipio?: number;
  cod_ciudad?: number;
}
