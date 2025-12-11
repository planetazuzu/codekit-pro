/**
 * Standardized HTTP response helpers
 */

import type { Response } from "express";

export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: unknown;
  };
}

/**
 * Send success response
 */
export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode: number = 200
): Response {
  const response: APIResponse<T> = {
    success: true,
    data,
  };
  return res.status(statusCode).json(response);
}

/**
 * Send error response
 */
export function sendError(
  res: Response,
  message: string,
  statusCode: number = 500,
  code?: string,
  details?: unknown
): Response {
  const response: APIResponse = {
    success: false,
    error: {
      message,
      code,
      details,
    },
  };
  return res.status(statusCode).json(response);
}

/**
 * Send not found response
 */
export function sendNotFound(
  res: Response,
  resource: string,
  id?: string
): Response {
  return sendError(
    res,
    `${resource}${id ? ` with id ${id}` : ""} not found`,
    404,
    "NOT_FOUND"
  );
}

/**
 * Send validation error response
 */
export function sendValidationError(
  res: Response,
  message: string,
  errors?: Record<string, string[]>
): Response {
  return sendError(res, message, 400, "VALIDATION_ERROR", errors);
}

/**
 * Send unauthorized response
 */
export function sendUnauthorized(res: Response, message: string = "Unauthorized"): Response {
  return sendError(res, message, 401, "UNAUTHORIZED");
}

/**
 * Send forbidden response
 */
export function sendForbidden(res: Response, message: string = "Forbidden"): Response {
  return sendError(res, message, 403, "FORBIDDEN");
}

