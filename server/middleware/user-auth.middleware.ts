/**
 * User Authentication Middleware
 * Handles user authentication using JWT tokens
 */

import type { Request, Response, NextFunction } from "express";
import { verifyToken, extractTokenFromHeader } from "../utils/auth";
import { getStorage } from "../storage/index";
import { sendUnauthorized, sendError } from "../utils/response";
import { logger } from "../utils/logger";

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        username: string;
        email: string;
        plan: string;
      };
    }
  }
}

/**
 * Middleware to require user authentication
 * Adds user info to req.user if authenticated
 */
export async function requireUserAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);

    if (!token) {
      sendUnauthorized(res, "Authentication token required");
      return;
    }

    const payload = verifyToken(token);

    if (!payload) {
      sendUnauthorized(res, "Invalid or expired token");
      return;
    }

    // Verify user still exists in database
    const storage = getStorage();
    const user = await storage.getUser(payload.userId);

    if (!user) {
      sendUnauthorized(res, "User not found");
      return;
    }

    // Attach user info to request
    req.user = {
      id: user.id,
      username: user.username,
      email: user.email || "",
      plan: user.plan || "free",
    };

    next();
  } catch (error) {
    logger.error("Error in requireUserAuth:", error);
    sendError(res, "Authentication error", 500, "AUTH_ERROR");
  }
}

/**
 * Middleware to optionally authenticate user
 * Adds user info to req.user if token is valid, but doesn't require it
 */
export async function optionalUserAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);

    if (token) {
      const payload = verifyToken(token);

      if (payload) {
        const storage = getStorage();
        const user = await storage.getUser(payload.userId);

        if (user) {
          req.user = {
            id: user.id,
            username: user.username,
            email: user.email || "",
            plan: user.plan || "free",
          };
        }
      }
    }

    next();
  } catch (error) {
    // Don't fail on optional auth errors, just continue
    logger.warn("Error in optionalUserAuth:", error);
    next();
  }
}

/**
 * Middleware to require specific plan (e.g., "pro" or "enterprise")
 */
export function requirePlan(...allowedPlans: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendUnauthorized(res, "Authentication required");
      return;
    }

    if (!allowedPlans.includes(req.user.plan)) {
      sendError(
        res,
        `This feature requires one of the following plans: ${allowedPlans.join(", ")}`,
        403,
        "PLAN_REQUIRED"
      );
      return;
    }

    next();
  };
}

