import { MemberDto } from './member';

export interface PaginatedMembersDto {
  current_page: number;
  data: MemberDto[];
  per_page: number;
  total: number;
  last_page: number;
  from?: number;
  to?: number;
  first_page_url?: string;
  last_page_url?: string;
  next_page_url?: string | null;
  prev_page_url?: string | null;
}
