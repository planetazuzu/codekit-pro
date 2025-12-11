/**
 * Centralized API client with proper typing
 */

import { APIError, NetworkError, isAPIError } from "@/lib/errors";

export type HTTPMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export interface APIRequestOptions {
  method: HTTPMethod;
  url: string;
  data?: unknown;
  headers?: Record<string, string>;
}

export interface APIResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
}

/**
 * Typed API request function
 */
export async function apiRequest<T = unknown>(
  method: HTTPMethod,
  url: string,
  data?: unknown
): Promise<APIResponse<T>> {
  try {
    const options: RequestInit = {
      method,
      headers: data ? { "Content-Type": "application/json" } : {},
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    };

    const response = await fetch(url, options);

    if (!response.ok) {
      let errorMessage = response.statusText;
      let errorDetails: unknown;

      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
        errorDetails = errorData;
      } catch {
        // If response is not JSON, use status text
      }

      throw new APIError(
        errorMessage,
        response.status,
        response.status.toString(),
        errorDetails
      );
    }

    const contentType = response.headers.get("content-type");

    if (!contentType?.includes("application/json")) {
      // For non-JSON responses, return null
      return {
        data: null as T,
        status: response.status,
        statusText: response.statusText,
      };
    }

    const responseData = await response.json();

    // Handle new backend response format: { success: true, data: ... } or { success: false, error: ... }
    if (typeof responseData === "object" && responseData !== null) {
      const apiResponse = responseData as { success?: boolean; data?: T; error?: { message: string; code?: string; details?: unknown } };
      
      if (apiResponse.success === false) {
        throw new APIError(
          apiResponse.error?.message || response.statusText,
          response.status,
          response.status.toString(),
          { code: apiResponse.error?.code, details: apiResponse.error?.details }
        );
      }

      if (apiResponse.success === true && "data" in apiResponse) {
        return {
          data: apiResponse.data as T,
          status: response.status,
          statusText: response.statusText,
        };
      }
    }

    // Fallback for old format or unexpected format
    return {
      data: responseData as T,
      status: response.status,
      statusText: response.statusText,
    };
  } catch (error) {
    if (isAPIError(error)) {
      throw error;
    }

    // Network errors
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new NetworkError("No se pudo conectar al servidor");
    }

    throw new NetworkError(
      error instanceof Error ? error.message : "Error desconocido"
    );
  }
}

/**
 * GET request helper
 */
export function get<T = unknown>(url: string): Promise<APIResponse<T>> {
  return apiRequest<T>("GET", url);
}

/**
 * POST request helper
 */
export function post<T = unknown>(
  url: string,
  data?: unknown
): Promise<APIResponse<T>> {
  return apiRequest<T>("POST", url, data);
}

/**
 * PUT request helper
 */
export function put<T = unknown>(
  url: string,
  data?: unknown
): Promise<APIResponse<T>> {
  return apiRequest<T>("PUT", url, data);
}

/**
 * DELETE request helper
 */
export function del<T = unknown>(url: string): Promise<APIResponse<T>> {
  return apiRequest<T>("DELETE", url);
}

/**
 * PATCH request helper
 */
export function patch<T = unknown>(
  url: string,
  data?: unknown
): Promise<APIResponse<T>> {
  return apiRequest<T>("PATCH", url, data);
}

