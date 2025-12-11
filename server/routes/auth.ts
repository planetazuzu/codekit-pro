/**
 * Authentication routes
 */

import type { Express } from "express";
import {
  handleAdminLogin,
  handleAdminLogout,
  handleAdminCheck,
} from "../middleware/auth.middleware";
import { authLimiter } from "../middleware/rate-limit.middleware";

export function registerAuthRoutes(app: Express): void {
  // Admin login (rate limited to prevent brute force)
  app.post("/api/auth/admin/login", authLimiter, handleAdminLogin);
  
  // Admin logout (no rate limit needed)
  app.post("/api/auth/admin/logout", handleAdminLogout);
  
  // Check admin authentication status (no rate limit needed)
  app.get("/api/auth/admin/check", handleAdminCheck);
}

