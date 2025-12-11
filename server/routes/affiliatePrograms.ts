/**
 * Affiliate Programs routes
 * Protected admin routes
 */

import type { Express } from "express";
import { z } from "zod";
import { validateParams } from "../middleware/validation.middleware";
import { requireAdminAuth } from "../middleware/auth.middleware";
import { adminLimiter } from "../middleware/rate-limit.middleware";
import * as affiliateProgramsController from "../controllers/affiliatePrograms.controller";

const idParamSchema = z.object({
  id: z.string().min(1),
});

export function registerAffiliateProgramsRoutes(app: Express): void {
  // All affiliate programs routes require admin authentication and rate limiting
  // Get all programs with optional filters
  app.get("/api/affiliate-programs", adminLimiter, requireAdminAuth, affiliateProgramsController.getAffiliatePrograms);
  
  // Get stats
  app.get("/api/affiliate-programs/stats", adminLimiter, requireAdminAuth, affiliateProgramsController.getAffiliateProgramsStats);
  
  // Get single program
  app.get("/api/affiliate-programs/:id", adminLimiter, requireAdminAuth, validateParams(idParamSchema), affiliateProgramsController.getAffiliateProgram);
  
  // Create program
  app.post("/api/affiliate-programs", adminLimiter, requireAdminAuth, affiliateProgramsController.createAffiliateProgram);
  
  // Update program
  app.put("/api/affiliate-programs/:id", adminLimiter, requireAdminAuth, validateParams(idParamSchema), affiliateProgramsController.updateAffiliateProgram);
  
  // Delete program
  app.delete("/api/affiliate-programs/:id", adminLimiter, requireAdminAuth, validateParams(idParamSchema), affiliateProgramsController.deleteAffiliateProgram);
  
  // Sync single program
  app.post("/api/affiliate-programs/:id/sync", adminLimiter, requireAdminAuth, validateParams(idParamSchema), affiliateProgramsController.syncAffiliateProgramEndpoint);
  
  // Sync all programs
  app.post("/api/affiliate-programs/sync/all", adminLimiter, requireAdminAuth, affiliateProgramsController.syncAllAffiliateProgramsEndpoint);
}

