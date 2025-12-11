/**
 * Moderation routes
 */

import { Router } from "express";
import { requireAdminAuth } from "../middleware/auth.middleware";
import * as moderationController from "../controllers/moderation.controller";

const router = Router();

// All moderation routes require admin authentication
router.use(requireAdminAuth);

// Get all pending content
router.get("/pending", moderationController.getPendingContent);

// Approve content
router.post("/approve/:type/:id", moderationController.approveContent);

// Reject content
router.post("/reject/:type/:id", moderationController.rejectContent);

export function registerModerationRoutes(app: Router) {
  app.use("/api/admin/moderation", router);
}

