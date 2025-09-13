export interface Usuario {
  id_usuario: number;
  nombre_usuario: string;
  apellido_usuario: string;
  email: string;
  id_perfil_usuario: number;
  cod_finca?: number | null;
  is_active: boolean;
  created_by?: number | null;
  updated_by?: number | null;
  is_deleted: boolean;
  created_at?: string;
  updated_at?: string;
  
  // Computed properties
  nombre_completo?: string;
  
  // Relationships
  perfil?: any; // Will be defined when Perfil model is created
  finca?: any;  // Will be defined when Finca model is created
}

export interface UsuarioDto {
  id_usuario?: number;
  nombre_usuario: string;
  apellido_usuario: string;
  email: string;
  password?: string;
  id_perfil_usuario: number;
  cod_finca?: number | null;
  is_active?: boolean;
  created_by?: number | null;
  updated_by?: number | null;
  is_deleted?: boolean;
}

export interface UsuarioCreateDto {
  nombre_usuario: string;
  apellido_usuario: string;
  email: string;
  password: string;
  id_perfil_usuario: number;
  cod_finca?: number | null;
  is_active?: boolean;
}

export interface UsuarioUpdateDto {
  nombre_usuario?: string;
  apellido_usuario?: string;
  email?: string;
  password?: string;
  id_perfil_usuario?: number;
  cod_finca?: number | null;
  is_active?: boolean;
}
