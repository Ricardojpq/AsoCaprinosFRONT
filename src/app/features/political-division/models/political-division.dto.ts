// ============= BASE INTERFACES =============

export interface BasePoliticalEntity {
  is_active: boolean;
  created_by?: number;
  updated_by?: number;
  is_deleted: boolean;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

export interface PoliticalDivisionQueryParams {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_dir?: 'asc' | 'desc';
}

export interface PoliticalDivisionListResponse<T> {
  status: string;
  message: {
    current_page: number;
    data: T[];
    first_page_url: string;
    from: number;
    last_page: number;
    links: any[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
  };
  data: string;
}

export interface SingleItemResponse<T> {
  status: string;
  message: string;
  data: T;
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
