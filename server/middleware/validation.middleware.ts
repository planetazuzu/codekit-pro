/**
 * Validation middleware using Zod schemas
 */

import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { ValidationError } from "../services/error.service";
import { sendValidationError } from "../utils/response";

/**
 * Create validation middleware for request body
 */
export function validateBody<T>(schema: z.ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const result = schema.safeParse(req.body);

      if (!result.success) {
        const errors: Record<string, string[]> = {};
        
        result.error.errors.forEach((error) => {
          const path = error.path.join(".");
          if (!errors[path]) {
            errors[path] = [];
          }
          errors[path].push(error.message);
        });

        sendValidationError(res, "Validation failed", errors);
        return;
      }

      // Replace req.body with validated data
      req.body = result.data;
      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Create validation middleware for request query
 */
export function validateQuery<T>(schema: z.ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const result = schema.safeParse(req.query);

      if (!result.success) {
        const errors: Record<string, string[]> = {};
        
        result.error.errors.forEach((error) => {
          const path = error.path.join(".");
          if (!errors[path]) {
            errors[path] = [];
          }
          errors[path].push(error.message);
        });

        sendValidationError(res, "Query validation failed", errors);
        return;
      }

      // Replace req.query with validated data
      req.query = result.data as unknown as Request["query"];
      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Create validation middleware for request params
 */
export function validateParams<T>(schema: z.ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const result = schema.safeParse(req.params);

      if (!result.success) {
        const errors: Record<string, string[]> = {};
        
        result.error.errors.forEach((error) => {
          const path = error.path.join(".");
          if (!errors[path]) {
            errors[path] = [];
          }
          errors[path].push(error.message);
        });

        sendValidationError(res, "Params validation failed", errors);
        return;
      }

      // Replace req.params with validated data
      req.params = result.data as unknown as Request["params"];
      next();
    } catch (error) {
      next(error);
    }
  };
}

