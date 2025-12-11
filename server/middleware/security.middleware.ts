/**
 * Security Middleware
 * Implements security headers and protections
 */

import helmet from "helmet";
import { Request, Response, NextFunction } from "express";
import { env } from "../config/env";
import createDOMPurify from "isomorphic-dompurify";

/**
 * Configure Helmet with security headers
 */
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"], // Allow Google Fonts
      styleSrcElem: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"], // Explicit for style elements
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "blob:"], // Vite needs eval and blob in dev
      workerSrc: ["'self'", "blob:"], // Allow Vite workers
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.openai.com", "https://generativelanguage.googleapis.com", "ws://localhost:*", "http://localhost:*"], // Allow Vite HMR
      fontSrc: ["'self'", "data:", "https://fonts.gstatic.com"], // Allow Google Fonts
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false, // Disable for Vite compatibility
  crossOriginResourcePolicy: { policy: "cross-origin" },
});

/**
 * Sanitize input to prevent XSS attacks
 * Uses DOMPurify for robust HTML sanitization
 */
const DOMPurify = createDOMPurify();

export function sanitizeInput(req: Request, res: Response, next: NextFunction): void {
  if (req.body && typeof req.body === "object") {
    const sanitize = (obj: any): any => {
      if (typeof obj === "string") {
        // Use DOMPurify to sanitize HTML content
        // This removes dangerous scripts, event handlers, and other XSS vectors
        return DOMPurify.sanitize(obj, {
          ALLOWED_TAGS: [], // Remove all HTML tags by default (strict mode)
          ALLOWED_ATTR: [], // Remove all attributes
          KEEP_CONTENT: true, // Keep text content but remove tags
        });
      }
      if (Array.isArray(obj)) {
        return obj.map(sanitize);
      }
      if (obj && typeof obj === "object") {
        const sanitized: any = {};
        for (const key in obj) {
          sanitized[key] = sanitize(obj[key]);
        }
        return sanitized;
      }
      return obj;
    };

    req.body = sanitize(req.body);
  }
  next();
}

/**
 * Validate Content-Type header
 */
export function validateContentType(req: Request, res: Response, next: NextFunction): void {
  if (req.method === "POST" || req.method === "PUT" || req.method === "PATCH") {
    const contentType = req.headers["content-type"];
    if (!contentType || !contentType.includes("application/json")) {
      res.status(415).json({
        success: false,
        error: {
          message: "Content-Type must be application/json",
          code: "INVALID_CONTENT_TYPE",
        },
      });
      return;
    }
  }
  next();
}

/**
 * Trust proxy configuration
 * Important for rate limiting and IP detection behind proxies
 */
export function configureTrustProxy(app: any): void {
  // Trust first proxy (for Render.com, Vercel, etc.)
  app.set("trust proxy", 1);
}

