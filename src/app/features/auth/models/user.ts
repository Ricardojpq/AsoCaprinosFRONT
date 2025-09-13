export interface User {
  id_usuario: number;
  nombre_usuario: string;
  apellido_usuario: string;
  email: string;
  id_perfil_usuario: number;
  cod_finca?: number | null;
  is_active: boolean;
  
  // Computed properties
  nombre_completo: string;
  
  // Relationships
  perfil?: {
    id_perfil: number;
    descripcion: string;
  };
  finca?: {
    cod_finca: number;
    nomb_finca: string;
  };
}