/**
 * API Response Models
 * 
 * Generic interfaces for API responses from the backend.
 */

/**
 * Generic API Response wrapper
 * Use this when your backend returns a consistent response structure
 */
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
}

/**
 * Paginated Response
 * Use this for endpoints that return paginated data
 */
export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Error Response
 * Standard error response from the backend
 */
export interface ErrorResponse {
  message: string;
  errors?: { [key: string]: string[] };
  statusCode?: number;
}
