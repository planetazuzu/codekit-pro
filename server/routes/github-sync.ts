/**
 * GitHub Sync routes
 */

import type { Express } from "express";
import { requireAdminAuth } from "../middleware/auth.middleware";
import { adminLimiter } from "../middleware/rate-limit.middleware";
import * as githubSyncController from "../controllers/github-sync.controller";

export function registerGitHubSyncRoutes(app: Express): void {
  // All routes require admin authentication
  app.use("/api/admin/github", requireAdminAuth);
  
  // Get sync status (no rate limit)
  app.get("/api/admin/github/status", githubSyncController.getSyncStatus);
  
  // Sync all resources from GitHub
  app.post("/api/admin/github/sync", adminLimiter, githubSyncController.syncFromGitHub);
  
  // Push all resources to GitHub
  app.post("/api/admin/github/push", adminLimiter, githubSyncController.pushToGitHub);
  
  // Sync specific resource type from GitHub
  app.post("/api/admin/github/sync/:type", adminLimiter, githubSyncController.syncResourceFromGitHub);
  
  // Push specific resource type to GitHub
  app.post("/api/admin/github/push/:type", adminLimiter, githubSyncController.pushResourceToGitHub);
}

