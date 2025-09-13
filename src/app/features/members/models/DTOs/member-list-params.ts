export interface MemberListParamsDto {
  ced_socio?: string;
  cod_finca?: number;
  estatus_socio?: string;
  is_active?: boolean;
  per_page?: 10 | 25 | 50 | 100;
  sort_by?: 'ced_socio' | 'cod_finca' | 'estatus_socio' | 'created_at' | 'updated_at';
  sort_dir?: 'asc' | 'desc';
  page?: number;
}
