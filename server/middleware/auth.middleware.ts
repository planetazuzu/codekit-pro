/**
 * Authentication Middleware
 * Handles admin authentication using persistent sessions
 */

import type { Request, Response, NextFunction } from "express";
import { env } from "../config/env";
import { logger } from "../utils/logger";
import { sendSuccess, sendError, sendUnauthorized } from "../utils/response";

// Extend Express Request to include session
declare module "express-session" {
  interface SessionData {
    adminAuthenticated?: boolean;
    adminLoginTime?: number;
  }
}

/**
 * Admin login handler
 * POST /api/auth/admin/login
 */
export async function handleAdminLogin(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { password } = req.body;

    if (!password) {
      sendError(res, "Password is required", 400, "MISSING_PASSWORD");
      return;
    }

    // Verify password
    if (password !== env.ADMIN_PASSWORD) {
      logger.warn(`Failed admin login attempt from IP: ${req.ip}`);
      sendError(res, "Invalid password", 401, "INVALID_PASSWORD");
      return;
    }

    // Set session
    req.session.adminAuthenticated = true;
    req.session.adminLoginTime = Date.now();

    logger.info(`Admin login successful from IP: ${req.ip}`);

    sendSuccess(res, {
      authenticated: true,
      message: "Login successful",
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Admin logout handler
 * POST /api/auth/admin/logout
 */
export async function handleAdminLogout(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    req.session.destroy((err) => {
      if (err) {
        logger.error("Error destroying session:", err);
        sendError(res, "Failed to logout", 500, "LOGOUT_ERROR");
        return;
      }

      res.clearCookie("codekit.sid");
      sendSuccess(res, {
        authenticated: false,
        message: "Logout successful",
      });
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Check admin authentication status
 * GET /api/auth/admin/check
 */
export async function handleAdminCheck(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const isAuthenticated = req.session?.adminAuthenticated === true;

    sendSuccess(res, {
      authenticated: isAuthenticated,
      loginTime: req.session?.adminLoginTime || null,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Middleware to require admin authentication
 * Use this to protect admin routes
 */
export function requireAdminAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.session?.adminAuthenticated) {
    sendUnauthorized(res, "Admin authentication required");
    return;
  }
  next();
}
