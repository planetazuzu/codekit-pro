/**
 * Analytics routes
 * Protected admin routes
 */

import type { Express } from "express";
import { requireAdminAuth } from "../middleware/auth.middleware";
import { analyticsViewLimiter, adminLimiter } from "../middleware/rate-limit.middleware";
import * as analyticsController from "../controllers/analytics.controller";

export function registerAnalyticsRoutes(app: Express): void {
  // Public endpoint for tracking views (rate limited with more permissive limiter)
  app.post("/api/analytics/view", analyticsViewLimiter, analyticsController.createView);
  
  // Protected admin endpoints
  app.get("/api/analytics/stats", adminLimiter, requireAdminAuth, analyticsController.getStats);
  app.get("/api/analytics/views", adminLimiter, requireAdminAuth, analyticsController.getViews);
}

