/**
 * Base interface for entities with audit fields
 */
export interface BaseEntity {
  is_active: boolean;
  created_by?: number | string;
  updated_by?: number | string;
  is_deleted: boolean;
  created_at: string;
  updated_at?: string;
  deleted_at?: string;
}

/**
 * Base interface for filters
 */
export interface BaseFilters {
  is_active?: boolean;
  sort_by?: string;
  sort_dir?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
}
