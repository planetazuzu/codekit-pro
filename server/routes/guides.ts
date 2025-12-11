/**
 * Guides routes
 */

import type { Express } from "express";
import { z } from "zod";
import { validateParams } from "../middleware/validation.middleware";
import { apiLimiter } from "../middleware/rate-limit.middleware";
import { optionalUserAuth } from "../middleware/user-auth.middleware";
import { checkLimit, requireActivePlan } from "../middleware/plan-limits.middleware";
import * as guidesController from "../controllers/guides.controller";

const idParamSchema = z.object({
  id: z.string().min(1),
});

export function registerGuidesRoutes(app: Express): void {
  // GET routes: optional auth (filter by userId if authenticated)
  app.get("/api/guides", apiLimiter, optionalUserAuth, guidesController.getGuides);
  app.get("/api/guides/:id", apiLimiter, optionalUserAuth, validateParams(idParamSchema), guidesController.getGuide);
  
  // POST/PUT/DELETE routes: require auth and check limits
  app.post("/api/guides", apiLimiter, requireActivePlan, checkLimit("guides"), guidesController.createGuide);
  app.put("/api/guides/:id", apiLimiter, validateParams(idParamSchema), guidesController.updateGuide);
  app.delete("/api/guides/:id", apiLimiter, validateParams(idParamSchema), guidesController.deleteGuide);
}

