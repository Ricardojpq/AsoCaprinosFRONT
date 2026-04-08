export interface SelectOption<T = any> {
  label: string;
  value: T;
}

export interface CatalogOptions {
  sex: SelectOption<string>[];
  status: SelectOption<string>[];
  origin: SelectOption<string>[];
  conceptionType: SelectOption<string>[];
  birthType: SelectOption<string>[];
  geneticMaterial: SelectOption<string>[];
  importProtocol: SelectOption<string>[];
  bloodlinePurity: SelectOption<string>[];
  breeds: SelectOption<number>[];
  colors: SelectOption<number>[];
  hairTypes: SelectOption<number>[];
  earInfo: SelectOption<string>[];
  hornInfo: SelectOption<string>[];
  registryType: SelectOption<string>[];
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
