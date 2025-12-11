/**
 * Centralized error handling middleware
 */

import type { Request, Response, NextFunction } from "express";
import { handleError, AppError } from "../services/error.service";
import { sendError } from "../utils/response";
import { logger } from "../utils/logger";

/**
 * Error handling middleware
 */
export function errorMiddleware(
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const appError = handleError(error);

  // Log error details
  logger.error(`Error in ${req.method} ${req.path}`, {
    statusCode: appError.statusCode,
    code: appError.code,
    message: appError.message,
    details: appError.details,
    stack: process.env.NODE_ENV === "development" ? appError.stack : undefined,
  });

  // Send error response
  sendError(
    res,
    appError.message,
    appError.statusCode,
    appError.code,
    process.env.NODE_ENV === "development" ? appError.details : undefined
  );
}

/**
 * 404 Not Found handler
 */
export function notFoundMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  sendError(res, `Route ${req.originalUrl} not found`, 404, "NOT_FOUND");
}

