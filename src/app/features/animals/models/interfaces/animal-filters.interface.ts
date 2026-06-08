export interface AnimalFilters {
  sexo_animal?: 'H' | 'M';
  estatus?: 'A' | 'I';
  cod_finca?: number;
  cod_raza?: number;
  cod_color?: number;
  cod_tipo_pelo?: number;
  cod_corral?: number;
  origen?: 'N' | 'I' | 'C';
  search?: string;
  sort_by?: string;
  sort_dir?: 'asc' | 'desc';
  peso_min?: number;
  peso_max?: number;
  edad_min_dias?: number;
  edad_max_dias?: number;
  reproductor?: 'S' | 'N';
}

export interface AnimalSearchConfig {
  minSearchLength: number;
  debounceTime: number;
}
