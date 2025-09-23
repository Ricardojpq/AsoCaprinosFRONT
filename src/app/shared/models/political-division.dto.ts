import { BaseCatalogEntity } from './base-catalog-entity.interface';

// País
export interface PaisDto extends BaseCatalogEntity {
  cod_pais: number;
  nomb_pais: string;
}

// Estado
export interface EstadoDto extends BaseCatalogEntity {
  cod_estado: number;
  cod_pais: number;
  nomb_estado: string;
  
  // Relaciones
  pais?: PaisDto;
}

// Municipio
export interface MunicipioDto extends BaseCatalogEntity {
  cod_municipio: number;
  cod_estado: number;
  nomb_municipio: string;
  
  // Relaciones
  estado?: EstadoDto;
}

// Ciudad
export interface CiudadDto extends BaseCatalogEntity {
  cod_ciudad: number;
  cod_municipio: number;
  nomb_ciudad: string;
  
  // Relaciones
  municipio?: MunicipioDto;
}

// DTOs para creación
export interface CreatePaisDto {
  cod_pais: number;
  nomb_pais: string;
  is_active?: boolean;
}

export interface CreateEstadoDto {
  cod_estado: number;
  cod_pais: number;
  nomb_estado: string;
  is_active?: boolean;
}

export interface CreateMunicipioDto {
  cod_municipio: number;
  cod_estado: number;
  nomb_municipio: string;
  is_active?: boolean;
}

export interface CreateCiudadDto {
  cod_ciudad: number;
  cod_municipio: number;
  nomb_ciudad: string;
  is_active?: boolean;
}

// DTOs para actualización
export interface UpdatePaisDto {
  nomb_pais?: string;
  is_active?: boolean;
}

export interface UpdateEstadoDto {
  nomb_estado?: string;
  is_active?: boolean;
}

export interface UpdateMunicipioDto {
  nomb_municipio?: string;
  is_active?: boolean;
}

export interface UpdateCiudadDto {
  nomb_ciudad?: string;
  is_active?: boolean;
}

// Filtros
export interface PaisFilters {
  nomb_pais?: string;
  is_active?: boolean;
  sort_by?: string;
  sort_dir?: 'asc' | 'desc';
}

export interface EstadoFilters {
  cod_pais?: number;
  nomb_estado?: string;
  is_active?: boolean;
  sort_by?: string;
  sort_dir?: 'asc' | 'desc';
}

export interface MunicipioFilters {
  cod_estado?: number;
  nomb_municipio?: string;
  is_active?: boolean;
  sort_by?: string;
  sort_dir?: 'asc' | 'desc';
}

export interface CiudadFilters {
  cod_municipio?: number;
  nomb_ciudad?: string;
  is_active?: boolean;
  sort_by?: string;
  sort_dir?: 'asc' | 'desc';
}
