export interface MemberSearchParamsDto {
  cedula?: string;
  nombre_completo?: string;
  cod_finca?: number;
  estatus?: 'A' | 'I';
}
