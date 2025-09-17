/**
 * Laravel pagination link structure
 */
export interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

/**
 * Laravel pagination response structure
 */
export interface LaravelPaginationResponse<T> {
  current_page: number;
  data: T[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: PaginationLink[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

/**
 * Laravel API response structure for list endpoints
 */
export interface LaravelApiResponse<T> {
  status: 'success' | 'error';
  message: T; // For list endpoints, this contains the pagination data
  data: string; // Success/error message
}

/**
 * Laravel API response structure for single item endpoints
 */
export interface LaravelSingleItemResponse<T> {
  status: 'success' | 'error';
  message: string;
  data: T;
}

/**
 * Simplified response interface for components
 */
export interface CatalogListResponse<T> {
  data: T[];
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
  from: number;
  to: number;
}
