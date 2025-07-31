export interface ApiResponseSuccess<T = any> {
  status: 'success';
  message?: string;
  data?: T;
}

export interface ApiResponseError {
  status: 'error';
  message: string;
  errors?: Record<string, string[]>;
} 