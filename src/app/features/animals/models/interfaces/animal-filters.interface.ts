export interface AnimalFilters {
  sexo_animal?: 'H' | 'M';
  estatus?: 'A' | 'I';
  cod_finca?: number;
  cod_raza?: number;
  cod_color?: number;
  cod_tipo_pelo?: number;
  origen?: 'N' | 'I' | 'C';
  search?: string;
  sort_by?: string;
  sort_dir?: 'asc' | 'desc';
}

export interface AnimalSearchConfig {
  minSearchLength: number;
  debounceTime: number;
}
