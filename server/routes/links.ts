/**
 * Links routes
 */

import type { Express } from "express";
import { z } from "zod";
import { validateParams } from "../middleware/validation.middleware";
import { apiLimiter } from "../middleware/rate-limit.middleware";
import { optionalUserAuth } from "../middleware/user-auth.middleware";
import { checkLimit, requireActivePlan } from "../middleware/plan-limits.middleware";
import * as linksController from "../controllers/links.controller";

const idParamSchema = z.object({
  id: z.string().min(1),
});

export function registerLinksRoutes(app: Express): void {
  // GET routes: optional auth (filter by userId if authenticated)
  app.get("/api/links", apiLimiter, optionalUserAuth, linksController.getLinks);
  app.get("/api/links/:id", apiLimiter, optionalUserAuth, validateParams(idParamSchema), linksController.getLink);
  
  // POST/PUT/DELETE routes: require auth and check limits
  app.post("/api/links", apiLimiter, requireActivePlan, checkLimit("links"), linksController.createLink);
  app.put("/api/links/:id", apiLimiter, validateParams(idParamSchema), linksController.updateLink);
  app.delete("/api/links/:id", apiLimiter, validateParams(idParamSchema), linksController.deleteLink);
}

