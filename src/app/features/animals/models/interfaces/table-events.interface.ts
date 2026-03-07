export interface PageEvent {
  first: number;
  rows: number;
  page: number;
  pageCount: number;
}

export interface SortEvent {
  field: string;
  order: 'asc' | 'desc';
}

export interface LazyLoadEvent {
  first?: number;
  rows?: number;
  sortField?: string;
  sortOrder?: number;
  filters?: any;
  globalFilter?: any;
}

export interface TableColumn {
  field: string;
  header: string;
  sortable?: boolean;
  width?: string;
}
