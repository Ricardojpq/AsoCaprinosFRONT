export interface MemberListParamsDto {
  ced_socio?: string;
  cod_finca?: number;
  estatus_socio?: 'A' | 'I';
  nom_persona?: string;
  ape_persona?: string;
  per_page?: 10 | 25 | 50 | 100;
  sort_by?: 'ced_socio' | 'cod_finca' | 'estatus_socio' | 'created_at' | 'updated_at';
  sort_dir?: 'asc' | 'desc';
}
