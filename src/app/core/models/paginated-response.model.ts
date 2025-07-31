// Base model for paginated responses
export interface PaginatedResponse<T> {
  currentPage: number;
  data: T[];
  firstPageUrl: string;
  from: number;
  lastPage: number;
  lastPageUrl: string;
  nextPageUrl: string | null;
  path: string;
  perPage: number;
  prevPageUrl: string | null;
  to: number;
  total: number;
  links?: any[];
} 