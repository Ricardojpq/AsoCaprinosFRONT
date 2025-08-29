/**
 * Configuración para la búsqueda de animales
 * Permite configurar fácilmente los campos de búsqueda y sus parámetros
 */
export interface SearchField {
  name: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'number';
  placeholder?: string;
  options?: Array<{ label: string; value: any }>;
  minLength?: number;
  maxLength?: number;
}

export interface SearchConfig {
  minSearchLength: number;
  debounceTime: number;
  searchFields: SearchField[];
  defaultSortField: string;
  defaultSortOrder: 'asc' | 'desc';
}

/**
 * Configuración actual para la búsqueda de animales
 */
export const ANIMAL_SEARCH_CONFIG: SearchConfig = {
  minSearchLength: 3,
  debounceTime: 500,
  defaultSortField: 'nomb_animal',
  defaultSortOrder: 'asc',
  searchFields: [
    {
      name: 'search',
      label: 'Búsqueda General',
      type: 'text',
      placeholder: 'Buscar por código o nombre...',
      minLength: 3
    },
    {
      name: 'sexo_animal',
      label: 'Sexo',
      type: 'select',
      options: [
        { label: 'Macho', value: 'M' },
        { label: 'Hembra', value: 'H' }
      ]
    },
    {
      name: 'estatus',
      label: 'Estado',
      type: 'select',
      options: [
        { label: 'Activo', value: 'A' },
        { label: 'Vendido', value: 'Vendido' },
        { label: 'Retirado', value: 'Retirado' },
        { label: 'Enfermo', value: 'Enfermo' }
      ]
    }
  ]
};

/**
 * Función helper para obtener la configuración de un campo de búsqueda
 */
export function getSearchFieldConfig(fieldName: string): SearchField | undefined {
  return ANIMAL_SEARCH_CONFIG.searchFields.find(field => field.name === fieldName);
}

/**
 * Función helper para validar si un término de búsqueda cumple con los requisitos mínimos
 */
export function isValidSearchTerm(term: string): boolean {
  return term.length >= ANIMAL_SEARCH_CONFIG.minSearchLength || term.length === 0;
} 