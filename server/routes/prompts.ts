/**
 * Prompts routes
 */

import type { Express } from "express";
import { z } from "zod";
import { validateParams } from "../middleware/validation.middleware";
import { apiLimiter } from "../middleware/rate-limit.middleware";
import { optionalUserAuth } from "../middleware/user-auth.middleware";
import { checkLimit, requireActivePlan } from "../middleware/plan-limits.middleware";
import * as promptsController from "../controllers/prompts.controller";

const idParamSchema = z.object({
  id: z.string().min(1),
});

export function registerPromptsRoutes(app: Express): void {
  // GET routes: optional auth (filter by userId if authenticated)
  app.get("/api/prompts", apiLimiter, optionalUserAuth, promptsController.getPrompts);
  app.get("/api/prompts/:id", apiLimiter, optionalUserAuth, validateParams(idParamSchema), promptsController.getPrompt);
  
  // POST/PUT/DELETE routes: require auth and check limits
  app.post("/api/prompts", apiLimiter, requireActivePlan, checkLimit("prompts"), promptsController.createPrompt);
  app.put("/api/prompts/:id", apiLimiter, validateParams(idParamSchema), promptsController.updatePrompt);
  app.delete("/api/prompts/:id", apiLimiter, validateParams(idParamSchema), promptsController.deletePrompt);
}

