export interface Perfil {
  id_perfil: number;
  descripcion: string;
  is_active: boolean;
  created_by?: number | null;
  updated_by?: number | null;
  is_deleted: boolean;
  created_at?: string;
  updated_at?: string;
  
  // Relationships
  modulos?: Modulo[];
  usuarios?: any[]; // Will be defined when Usuario model is imported
}

export interface PerfilDto {
  id_perfil?: number;
  descripcion: string;
  is_active?: boolean;
  created_by?: number | null;
  updated_by?: number | null;
  is_deleted?: boolean;
}

export interface PerfilCreateDto {
  descripcion: string;
  is_active?: boolean;
}

export interface PerfilUpdateDto {
  descripcion?: string;
  is_active?: boolean;
}

export interface Modulo {
  id_modulo: number;
  modulo: string;
  descripcion?: string;
  is_active: boolean;
  created_by?: number | null;
  updated_by?: number | null;
  is_deleted: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PerfilModulo {
  id_perfil: number;
  id_modulo: number;
  vista_inicio?: boolean;
}
