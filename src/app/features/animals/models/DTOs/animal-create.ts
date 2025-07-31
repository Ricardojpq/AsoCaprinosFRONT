export interface AnimalCreateDto {
  cod_finca: string;
  cod_animal: string;
  nomb_animal: string;
  sexo_animal: string;
  fec_nacim?: string;
  peso_al_nacer?: string;
  fec_ingreso?: string;
  estatus?: string;
  peso_actual?: string;
  cod_raza?: string;
  cod_color?: string;
  tatuaje?: string;
  observac?: string;
  foto?: string | null;
} 