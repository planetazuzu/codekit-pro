/**
 * Snippets routes
 */

import type { Express } from "express";
import { z } from "zod";
import { validateParams } from "../middleware/validation.middleware";
import { apiLimiter } from "../middleware/rate-limit.middleware";
import { optionalUserAuth } from "../middleware/user-auth.middleware";
import { checkLimit, requireActivePlan } from "../middleware/plan-limits.middleware";
import * as snippetsController from "../controllers/snippets.controller";

const idParamSchema = z.object({
  id: z.string().min(1),
});

export function registerSnippetsRoutes(app: Express): void {
  // GET routes: optional auth (filter by userId if authenticated)
  app.get("/api/snippets", apiLimiter, optionalUserAuth, snippetsController.getSnippets);
  app.get("/api/snippets/:id", apiLimiter, optionalUserAuth, validateParams(idParamSchema), snippetsController.getSnippet);
  
  // POST/PUT/DELETE routes: require auth and check limits
  app.post("/api/snippets", apiLimiter, requireActivePlan, checkLimit("snippets"), snippetsController.createSnippet);
  app.put("/api/snippets/:id", apiLimiter, validateParams(idParamSchema), snippetsController.updateSnippet);
  app.delete("/api/snippets/:id", apiLimiter, validateParams(idParamSchema), snippetsController.deleteSnippet);
}

