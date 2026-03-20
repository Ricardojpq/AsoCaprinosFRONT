export interface PerfilModuloUser {
  id_modulo: number;
  puede_ver: boolean;
  puede_crear: boolean;
  puede_editar: boolean;
  puede_eliminar: boolean;
  vista_inicio: number;
  modulo?: {
    id: number;
    modulo: string;
    vista: string;
    padre_id: number | null;
  };
}

export interface User {
  // Datos básicos del usuario
  id: number;
  name: string;
  email: string;
  perfil_id: number;
  id_perfil_usuario?: number;
  perfil_name?: string;
  token_expires_at?: string;
  
  // Flags de tipo de usuario
  is_super_admin?: boolean;
  is_admin_finca?: boolean;
  is_usuario_basico?: boolean;
  
  // Relaciones
  perfil?: {
    id_perfil: number;
    descripcion: string;
    perfil_modulos?: PerfilModuloUser[];
  };
  
  // Multi-tenant: fincas asignadas al usuario
  fincas?: Array<{
    cod_finca: number;
    nomb_finca: string;
    es_principal?: boolean;
  }>;
  fincas_ids?: number[];
  
  // Permisos de páginas (legacy, usar perfil.perfil_modulos)
  permisos?: { [page: string]: { ver: boolean; crear: boolean; editar: boolean; eliminar: boolean } };
}