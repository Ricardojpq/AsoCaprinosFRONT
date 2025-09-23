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
 * Based on real backend response structure
 */
export interface LaravelApiResponse<T> {
  status: 'success' | 'error';
  message: string; // Success/error message
  data: LaravelPaginationResponse<T>; // Pagination data
}

/**
 * Laravel API response structure for single item endpoints
 */
export interface LaravelSingleItemResponse<T> {
  status: 'success' | 'error';
  message: string;
  data: T;
}