/**
 * Shared API response types
 * Ensures consistency across client and server
 */

/**
 * Standard API response wrapper
 */
export type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

/**
 * Paginated API response
 */
export type PaginatedResponse<T> = ApiResponse<T[]> & {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

/**
 * Error response structure
 */
export type ApiErrorResponse = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

/**
 * Success response structure
 */
export type ApiSuccessResponse<T> = {
  success: true;
  data: T;
  message?: string;
};

/**
 * Union type for all API responses
 */
export type ApiResult<T> = ApiSuccessResponse<T> | ApiErrorResponse;


