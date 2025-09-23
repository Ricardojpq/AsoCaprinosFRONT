// ============= BASE INTERFACES =============

import { BaseEntity } from '../../../core/models/DTOs/base-entity';
import { LaravelApiResponse, LaravelSingleItemResponse } from '../../../core/models/DTOs';

export interface BasePoliticalEntity extends BaseEntity {
  // BaseEntity ya incluye todos estos campos, solo agregamos los específicos si es necesario
}

export interface PoliticalDivisionQueryParams {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_dir?: 'asc' | 'desc';
}


// ============= PAÍS =============

export interface PaisDto extends BasePoliticalEntity {
  cod_pais: number;
  nom_pais: string;
  siglas_pais?: string;
  capital_pais?: string;
  // Relaciones opcionales
  estados?: EstadoDto[];
}

export interface PaisCreateDto {
  cod_pais: number;
  nom_pais: string;
  siglas_pais?: string;
  capital_pais?: string;
}

export interface PaisUpdateDto {
  nom_pais?: string;
  siglas_pais?: string;
  capital_pais?: string;
}

export interface PaisQueryParams extends PoliticalDivisionQueryParams {
  nom_pais?: string;
  siglas_pais?: string;
  sort_by?: 'cod_pais' | 'nom_pais' | 'siglas_pais';
}

// ============= ESTADO =============

export interface EstadoDto extends BasePoliticalEntity {
  cod_estado: number;
  nom_estado: string;
  siglas_estado?: string;
  cod_pais: number;
  capital_estado?: string;
  // Relaciones opcionales
  pais?: PaisDto;
  municipios?: MunicipioDto[];
}

export interface EstadoCreateDto {
  cod_estado: number;
  nom_estado: string;
  siglas_estado?: string;
  cod_pais: number;
  capital_estado?: string;
}

export interface EstadoUpdateDto {
  nom_estado?: string;
  siglas_estado?: string;
  cod_pais?: number;
  capital_estado?: string;
}

export interface EstadoQueryParams extends PoliticalDivisionQueryParams {
  nom_estado?: string;
  cod_pais?: number;
  sort_by?: 'cod_estado' | 'nom_estado' | 'cod_pais';
}

// ============= MUNICIPIO =============

export interface MunicipioDto extends BasePoliticalEntity {
  cod_municipio: number;
  nom_municipio: string;
  cod_estado: number;
  capital_municipio?: string;
  // Relaciones opcionales
  estado?: EstadoDto;
  parroquias?: ParroquiaDto[];
  ciudades?: CiudadDto[];
}

export interface MunicipioCreateDto {
  cod_municipio: number;
  nom_municipio: string;
  cod_estado: number;
  capital_municipio?: string;
}

export interface MunicipioUpdateDto {
  nom_municipio?: string;
  cod_estado?: number;
  capital_municipio?: string;
}

export interface MunicipioQueryParams extends PoliticalDivisionQueryParams {
  nom_municipio?: string;
  cod_estado?: number;
  sort_by?: 'cod_municipio' | 'nom_municipio' | 'cod_estado';
}

// ============= PARROQUIA =============

export interface ParroquiaDto extends BasePoliticalEntity {
  cod_parroquia: number;
  nom_parroquia: string;
  cod_municipio: number;
  // Relaciones opcionales
  municipio?: MunicipioDto;
}

export interface ParroquiaCreateDto {
  cod_parroquia: number;
  nom_parroquia: string;
  cod_municipio: number;
}

export interface ParroquiaUpdateDto {
  nom_parroquia?: string;
  cod_municipio?: number;
}

export interface ParroquiaQueryParams extends PoliticalDivisionQueryParams {
  nom_parroquia?: string;
  cod_municipio?: number;
  sort_by?: 'cod_parroquia' | 'nom_parroquia' | 'cod_municipio';
}

// ============= CIUDAD =============

export interface CiudadDto extends BasePoliticalEntity {
  cod_ciudad: number;
  nom_ciudad: string;
  estado_ciudad?: string;
  municipio_ciudad?: string;
}

export interface CiudadCreateDto {
  cod_ciudad: number;
  nom_ciudad: string;
  estado_ciudad?: string;
  municipio_ciudad?: string;
}

export interface CiudadUpdateDto {
  nom_ciudad?: string;
  estado_ciudad?: string;
  municipio_ciudad?: string;
}

export interface CiudadQueryParams extends PoliticalDivisionQueryParams {
  cod_municipio?: number;
  nom_ciudad?: string;
  estado_ciudad?: string;
  municipio_ciudad?: string;
  sort_by?: 'cod_ciudad' | 'nom_ciudad' | 'estado_ciudad' | 'municipio_ciudad';
}

// ============= OPCIONES PARA DROPDOWNS =============

export interface PoliticalDivisionSelectOption {
  label: string;
  value: number;
  code?: string;
}

// ============= TIPOS DE ENTIDADES =============

export type PoliticalDivisionEntity = 'paises' | 'estados' | 'municipios' | 'parroquias' | 'ciudades';

export interface TabConfig {
  key: PoliticalDivisionEntity;
  label: string;
  icon: string;
  hasCreate: boolean;
  hasUpdate: boolean;
  hasDelete: boolean;
}
