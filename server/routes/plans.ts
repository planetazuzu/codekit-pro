/**
 * Plans routes
 * Handles plan-related endpoints
 */

import type { Express } from "express";
import { apiLimiter } from "../middleware/rate-limit.middleware";
import { requireUserAuth } from "../middleware/user-auth.middleware";
import * as plansController from "../controllers/plans.controller";

export function registerPlansRoutes(app: Express): void {
  // Public route: Get all available plans
  app.get("/api/plans", apiLimiter, plansController.getPlans);
  
  // Protected route: Get current user's plan info
  app.get("/api/plans/me", apiLimiter, requireUserAuth, plansController.getMyPlan);
}


