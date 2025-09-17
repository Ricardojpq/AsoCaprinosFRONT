/**
 * Interface genérica para opciones de select/dropdown
 */
export interface SelectOption<T = any> {
  label: string;
  value: T;
  disabled?: boolean;
}

/**
 * Interface específica para opciones de catálogos
 */
export interface CatalogSelectOption {
  label: string;
  value: number;
  disabled?: boolean;
}

/**
 * Interface para opciones de enum (string values)
 */
export interface EnumSelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}
