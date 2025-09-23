// Re-export interfaces from core DTOs to maintain backward compatibility
export type { 
  BaseEntity as BaseCatalogEntity,
  BaseFilters 
} from '../../core/models/DTOs/base-entity';

export type { 
  LaravelPaginationResponse,
  PaginationLink,
  LaravelApiResponse as ApiResponse,
  LaravelSingleItemResponse as SingleItemResponse 
} from '../../core/models/DTOs/laravel-response';
