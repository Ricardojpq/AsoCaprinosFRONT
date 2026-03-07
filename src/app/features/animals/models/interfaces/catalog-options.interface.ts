export interface SelectOption<T = any> {
  label: string;
  value: T;
}

export interface CatalogOptions {
  sexo: SelectOption<string>[];
  estatus: SelectOption<string>[];
  origen: SelectOption<string>[];
  tipoConcepcion: SelectOption<string>[];
  tipoParto: SelectOption<string>[];
  materialGenetico: SelectOption<string>[];
  protocoloImportacion: SelectOption<string>[];
  compRacial: SelectOption<string>[];
  razas: SelectOption<number>[];
  colores: SelectOption<number>[];
  tiposPelo: SelectOption<number>[];
  infoOrejas: SelectOption<string>[];
  infoCuernos: SelectOption<string>[];
  tipoRegistro: SelectOption<string>[];
}

export interface CatalogDto {
  cod_raza?: number;
  cod_color?: number;
  cod_tipo_pelo?: number;
  descripcion: string;
  nomb_raza?: string;
  nomb_color?: string;
  nomb_tipo_pelo?: string;
}
