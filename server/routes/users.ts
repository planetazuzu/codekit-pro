/**
 * User routes
 * Registration, login, and profile management
 */

import type { Express } from "express";
import {
  registerUser,
  loginUser,
  getCurrentUser,
  updateCurrentUser,
} from "../controllers/users.controller";
import { requireUserAuth } from "../middleware/user-auth.middleware";
import { authLimiter, apiLimiter } from "../middleware/rate-limit.middleware";

export function registerUsersRoutes(app: Express): void {
  // Public routes (rate limited)
  app.post("/api/users/register", authLimiter, registerUser);
  app.post("/api/users/login", authLimiter, loginUser);

  // Protected routes (require authentication)
  app.get("/api/users/me", apiLimiter, requireUserAuth, getCurrentUser);
  app.put("/api/users/me", apiLimiter, requireUserAuth, updateCurrentUser);
}

