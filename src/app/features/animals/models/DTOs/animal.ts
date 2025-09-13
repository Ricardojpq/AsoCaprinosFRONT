export interface AnimalDto {
  // Primary Keys
  cod_finca: number;
  cod_animal: string;
  
  // Criador and Propietario information
  criador?: FincaInfo;
  propietario?: FincaInfo;
  raza_info?: RazaInfo;
  
  // Basic Information
  cod_ini_porsan_pa?: number;
  cod_ini_porsan_ma?: number;
  cod_color: number;
  cod_tipo_pelo: number;
  cod_vaquera?: number;
  cod_corral?: number;
  cod_lote_corral?: number;
  cod_finca_padre?: number;
  cod_padre?: number;
  cod_raza: number;
  cod_potrero?: number;
  cod_lote_potrero?: number;
  cod_finca_madre?: number;
  cod_madre?: number;
  cod_finca_embrion?: number;
  cod_embrion?: number;
  cod_asociacion?: number;
  id_finca?: string;
  id_electronico?: string;
  nomb_animal: string;
  origen?: string;
  cod_criador?: number;
  id_creador?: number;
  tatuaje?: string;
  sexo_animal: string;
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
  
  // Genetic Indices
  ind_genetico?: number;
  prom_genetico?: number;
  ind_determinacion?: number;
  ind_genetico_hijas?: number;
  ind_genetico_fincas?: number;
  ind_genetico_lactancias?: number;
  ind_pesos?: number;
  ind_det_pesos?: number;
  ind_pesos_hijas?: number;
  ind_pesos_fincas?: number;
  ind_pesos_pesadas?: number;
  ind_precocidad?: number;
  ind_det_precocidad?: number;
  ind_precocidad_hijas?: number;
  ind_precocidad_fincas?: number;
  ind_precocidad_pesadas?: number;
  ind_alz?: number;
  ind_det_alz?: number;
  ind_fv?: number;
  ind_det_fv?: number;
  ind_ac?: number;
  ind_det_ac?: number;
  ind_aut?: number;
  ind_det_aut?: number;
  ind_ng?: number;
  ind_det_ng?: number;
  ind_ap?: number;
  ind_det_ap?: number;
  ind_iud?: number;
  ind_det_iud?: number;
  ind_pu?: number;
  ind_det_pu?: number;
  ind_npu?: number;
  ind_det_npu?: number;
  ind_spd?: number;
  ind_det_spd?: number;
  ind_pt?: number;
  ind_det_pt?: number;
  ind_an?: number;
  ind_det_an?: number;
  ind_iut?: number;
  ind_det_iut?: number;
  ind_lmu?: number;
  ind_det_lmu?: number;
  ind_lp?: number;
  ind_det_lp?: number;
  ind_pc?: number;
  ind_det_pc?: number;
  
  // Additional Fields
  id_pro?: number;
  numero_interno?: number;
  codigo_interno?: string;
  codigo_unico?: string;
  peso_destete_75?: number;
  peso_destete_150?: number;
  tipo_concepcion?: string;
  cod_finca_actual?: number;
  p_sangre?: number;
  estatus_ubicacion?: string;
  estatus_condicion?: string;
  tatuaje_oreja_izq?: string;
  tatuaje_oreja_der?: string;
  tatuaje_cola?: string;
  fec_egreso?: string;
  alerta_peso?: string;
  var_padre?: string;
  var_madre?: string;
  var_receptora?: string;
  cri_padre?: string;
  cri_madre?: string;
  nro_reg_madre?: string;
  nro_reg_padre?: string;
  info_extra_reg?: string;
  cod_aso_padre?: string;
  cod_aso_madre?: string;
  cod_pre_clasif?: number;
  fec_pre_clasif?: string;
  var_1?: string;
  var_2?: string;
  tipo_parto?: string;
  pezones_supernumerarios?: string;
  estatus_clasif?: string;
  
  // Additional fields for registration form
  material_genetico?: string;
  protocolo_importacion?: string;
  peso_al_destete?: number;
  codigo_aso?: string;
  comp_racial?: number;
  porc_racial?: number;
  precio_con_igv?: number;
  stock_minimo?: number;
  
  // Pigmentation Fields
  pigmen_boca?: boolean;
  pigmen_nariz?: boolean;
  pigmen_ojos?: boolean;
  pigmen_orejas?: boolean;
  pigmen_area_perianal?: boolean;
  pigmen_vulva?: boolean;
  nro_raf?: number;
  codigo_raf?: string;
  protocolo_imp?: string;
  tipo_material_gen?: string;
  old_aso?: string;
  pru_aso?: string;
  padre_aso?: string;
  madre_aso?: string;
  pru_aso_padre?: string;
  pru_aso_madre?: string;
  pigmen_total?: boolean;
  imagen?: string;
  
  // Base Entity Fields
  is_active?: boolean;
  created_by?: number;
  updated_by?: number;
  is_deleted?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface FincaInfo {
  cod_finca?: string;
  nomb_finca?: string;
  persona?: PersonaInfo;
}

export interface PersonaInfo {
  nomb_persona?: string;
  apell_persona?: string;
}

export interface RazaInfo {
  cod_raza?: string;
  nomb_raza?: string;
}