/**
 * Affiliates routes
 * Admin routes for managing affiliates
 */

import type { Express } from "express";
import { z } from "zod";
import { validateParams } from "../middleware/validation.middleware";
import { requireAdminAuth } from "../middleware/auth.middleware";
import { adminLimiter, affiliateClickLimiter } from "../middleware/rate-limit.middleware";
import * as affiliatesController from "../controllers/affiliates.controller";
import * as affiliateDashboardController from "../controllers/affiliate-dashboard.controller";

const idParamSchema = z.object({
  id: z.string().min(1),
});

export function registerAffiliatesRoutes(app: Express): void {
  // CRUD operations (admin only)
  app.get("/api/affiliates", adminLimiter, requireAdminAuth, affiliatesController.getAffiliates);
  app.get("/api/affiliates/stats/:id", adminLimiter, requireAdminAuth, validateParams(idParamSchema), affiliatesController.getAffiliateStats);
  app.get("/api/affiliates/:id", adminLimiter, requireAdminAuth, validateParams(idParamSchema), affiliatesController.getAffiliate);
  app.post("/api/affiliates", adminLimiter, requireAdminAuth, affiliatesController.createAffiliate);
  app.put("/api/affiliates/:id", adminLimiter, requireAdminAuth, validateParams(idParamSchema), affiliatesController.updateAffiliate);
  app.delete("/api/affiliates/:id", adminLimiter, requireAdminAuth, validateParams(idParamSchema), affiliatesController.deleteAffiliate);
  
  // Click tracking (public endpoint - no auth required, but rate limited)
  app.post("/api/affiliates/:id/click", affiliateClickLimiter, validateParams(idParamSchema), affiliatesController.trackAffiliateClick);
  
  // Revenue dashboard (admin only)
  app.get("/api/affiliates/dashboard", adminLimiter, requireAdminAuth, affiliateDashboardController.getRevenueDashboard);
  app.get("/api/affiliates/dashboard/program/:id", adminLimiter, requireAdminAuth, validateParams(idParamSchema), affiliateDashboardController.getProgramAnalytics);
}
