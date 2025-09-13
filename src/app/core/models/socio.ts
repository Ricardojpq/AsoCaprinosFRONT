export interface Socio {
  ced_socio: string;
  cod_finca: number;
  estatus_socio?: string | null;
  is_active: boolean;
  created_by?: number | null;
  updated_by?: number | null;
  is_deleted: boolean;
  created_at?: string;
  updated_at?: string;
  
  // Relationships
  persona?: Persona;
  finca?: Finca;
}

export interface SocioDto {
  ced_socio: string;
  cod_finca: number;
  estatus_socio?: string | null;
  is_active?: boolean;
  created_by?: number | null;
  updated_by?: number | null;
  is_deleted?: boolean;
}

export interface SocioCreateDto {
  ced_socio: string;
  cod_finca: number;
  estatus_socio?: string;
  is_active?: boolean;
}

export interface SocioUpdateDto {
  estatus_socio?: string;
  is_active?: boolean;
}

export interface SocioListResponseDto {
  status: string;
  message: string;
  data: Socio[];
  total?: number;
  per_page?: number;
  current_page?: number;
  last_page?: number;
}

// Forward declarations for relationships
interface Persona {
  ced_persona: string;
  nom_persona?: string;
  ape_persona?: string;
  email_persona?: string;
}

interface Finca {
  cod_finca: number;
  nomb_finca: string;
}
