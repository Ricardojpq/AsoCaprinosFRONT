// Catalog models for Animal-related entities

export interface Raza {
  cod_raza: number;
  descripcion: string;
  is_active: boolean;
  created_by?: number | null;
  updated_by?: number | null;
  is_deleted: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Color {
  cod_color: number;
  descripcion: string;
  is_active: boolean;
  created_by?: number | null;
  updated_by?: number | null;
  is_deleted: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface TipoPelo {
  cod_tipo_pelo: number;
  descripcion: string;
  is_active: boolean;
  created_by?: number | null;
  updated_by?: number | null;
  is_deleted: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CondicionCorporal {
  cod_cond_corporal: number;
  descripcion: string;
  is_active: boolean;
  created_by?: number | null;
  updated_by?: number | null;
  is_deleted: boolean;
  created_at?: string;
  updated_at?: string;
}

// DTOs for catalog entities
export interface RazaDto {
  cod_raza?: number;
  descripcion: string;
  is_active?: boolean;
}

export interface ColorDto {
  cod_color?: number;
  descripcion: string;
  is_active?: boolean;
}

export interface TipoPeloDto {
  cod_tipo_pelo?: number;
  descripcion: string;
  is_active?: boolean;
}

export interface CondicionCorporalDto {
  cod_cond_corporal?: number;
  descripcion: string;
  is_active?: boolean;
}

// List response DTOs
export interface RazaListResponseDto {
  status: string;
  message: string;
  data: Raza[];
}

export interface ColorListResponseDto {
  status: string;
  message: string;
  data: Color[];
}

export interface TipoPeloListResponseDto {
  status: string;
  message: string;
  data: TipoPelo[];
}

export interface CondicionCorporalListResponseDto {
  status: string;
  message: string;
  data: CondicionCorporal[];
}
