/**
 * Base interface for all catalog entities with audit fields
 */
export interface BaseCatalogEntity {
  is_active: number;
  created_by: number;
  updated_by?: number | null;
  is_deleted: number;
  created_at: string;
  updated_at?: string | null;
  deleted_at?: string | null;
}

/**
 * Color catalog DTO
 */
export interface ColorDto extends BaseCatalogEntity {
  cod_color: number;
  nomb_color: string;
  foto_color?: number | null;
  imagen?: string | null;
}

/**
 * Raza (Breed) catalog DTO
 */
export interface RazaDto extends BaseCatalogEntity {
  cod_raza: number;
  descripcion: string;
}

/**
 * Condicion Corporal (Physical Condition) catalog DTO
 */
export interface CondicionCorporalDto extends BaseCatalogEntity {
  cod_condicion_corporal: number;
  descripcion: string;
}

/**
 * Tipo Pelo (Hair Type) catalog DTO
 */
export interface TipoPeloDto extends BaseCatalogEntity {
  cod_tipo_pelo: number;
  nomb_tipo_pelo: string;
  foto_tipo_pelo?: number | null;
}

// Create DTOs
export interface ColorCreateDto {
  nomb_color: string;
  foto_color?: number;
  imagen?: string;
}

export interface RazaCreateDto {
  descripcion: string;
}

export interface CondicionCorporalCreateDto {
  descripcion: string;
}

export interface TipoPeloCreateDto {
  nomb_tipo_pelo: string;
  foto_tipo_pelo?: number;
}

// Update DTOs
export interface ColorUpdateDto {
  nomb_color?: string;
  foto_color?: number;
  imagen?: string;
}

export interface RazaUpdateDto {
  descripcion?: string;
}

export interface CondicionCorporalUpdateDto {
  descripcion?: string;
}

export interface TipoPeloUpdateDto {
  nomb_tipo_pelo?: string;
  foto_tipo_pelo?: number;
}
