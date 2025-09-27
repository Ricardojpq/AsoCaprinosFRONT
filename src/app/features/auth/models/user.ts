export interface User {
  // Datos básicos del usuario
  id: number;
  name: string;
  email: string;
  perfil_id: number;
  perfil_name?: string;
  cod_finca?: number | null;
  token_expires_at?: string;
  
  // Relaciones
  perfil?: {
    id_perfil: number;
    descripcion: string;
  };
  finca?: {
    cod_finca: number;
    nomb_finca: string;
  };
  
  // Métodos de utilidad
  hasRole?(role: string | number): boolean;
  hasAnyRole?(roles: string[] | number[]): boolean;
  isSuperAdmin?(): boolean;
}