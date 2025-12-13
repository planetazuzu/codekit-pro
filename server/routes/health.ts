/**
 * Health check route
 */

import { Router, Request, Response } from "express";
import { logger } from "../utils/logger";

const router = Router();

/**
 * GET /api/health
 * Health check endpoint
 */
router.get("/", (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
    });
  } catch (error: any) {
    logger.error("Health check error:", error);
    res.status(500).json({
      success: false,
      status: "unhealthy",
      error: error.message,
    });
  }
});

export { router as healthRouter };

