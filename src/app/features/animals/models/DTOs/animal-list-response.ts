import { PaginatedResponse } from '@core/models/DTOs/paginated-response';
import { AnimalDto } from './animal';

export type AnimalListResponse = PaginatedResponse<AnimalDto>; 