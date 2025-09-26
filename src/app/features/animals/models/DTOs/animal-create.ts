export interface AnimalCreateDto {
  // Required fields
  cod_finca: number;
  cod_animal: string;
  nomb_animal: string;
  sexo_animal: string;
  cod_raza: number;
  cod_color: number;
  cod_tipo_pelo: number;
  
  // Optional basic information
  cod_ini_porsan_pa?: number;
  cod_ini_porsan_ma?: number;
  cod_vaquera?: number;
  cod_corral?: number;
  cod_lote_corral?: number;
  cod_finca_padre?: number;
  cod_padre?: number;
  cod_potrero?: number;
  cod_lote_potrero?: number;
  cod_finca_madre?: number;
  cod_madre?: number;
  cod_finca_embrion?: number;
  cod_embrion?: number;
  cod_asociacion?: string;
  id_finca?: string;
  id_electronico?: string;
  origen?: string;
  cod_criador?: number;
  id_creador?: number;
  tatuaje?: string;
  fec_nacim?: string;
  peso_al_nacer?: number;
  fec_ingreso?: string;
  estatus?: string;
  porcen_sangre?: number;
  nomb_sangre?: string;
  fec_ult_peso?: string;
  peso_actual?: number;
  fec_destete?: string;
  peso_destete?: number;
  origen_id_aso?: number;
  cod_cond_corporal?: number;
  fec_registro?: string;
  reproductor?: string;
  fec_prox_revision?: string;
  fecha_clasificacion?: string;
  clasificacion_defin?: number;
  nro_registro_cla?: string;
  caracteristicas?: string;
  observac?: string;
  foto?: number;
  
  // Additional fields
  numero_interno?: number;
  codigo_interno?: string;
  codigo_unico?: string;
  peso_destete_75?: number;
  peso_destete_150?: number;
  tipo_concepcion?: string;
  cod_finca_actual?: number;
  p_sangre?: string;
  estatus_ubicacion?: string;
  estatus_condicion?: string;
  tatuaje_oreja_izq?: string;
  tatuaje_oreja_der?: string;
  tatuaje_cola?: string;
  tipo_parto?: string;
  pezones_supernumerarios?: string;
  
  // Pigmentation fields
  pigmen_boca?: boolean;
  pigmen_nariz?: boolean;
  pigmen_ojos?: boolean;
  pigmen_orejas?: boolean;
  pigmen_area_perianal?: boolean;
  pigmen_vulva?: boolean;
  pigmen_total?: boolean;
  
  // Additional info
  nro_raf?: number;
  codigo_raf?: string;
  protocolo_imp?: string;
  tipo_material_gen?: string;
  imagen?: string;
  
  // Campos adicionales de padre
  cri_padre?: string; // criador del padre
  nro_reg_padre?: string; // nro_registro_cla del padre
  cod_aso_padre?: string; // cod_asociacion del padre
  padre_aso?: string; // old_aso del padre
  pru_aso_padre?: string; // pru_aso del padre
  
  // Campos adicionales de madre
  cri_madre?: string; // criador de la madre
  nro_reg_madre?: string; // nro_registro_cla de la madre
  cod_aso_madre?: string; // cod_asociacion de la madre
  madre_aso?: string; // old_aso de la madre
  pru_aso_madre?: string; // pru_aso de la madre
  
  // Nuevos campos añadidos
  info_orejas?: string;
  info_cuernos?: string;
  tipo_registro?: string;
  aretes?: string;
  reg_intl?: string;
  
  // Base entity fields
  is_active?: boolean;
}