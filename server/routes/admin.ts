/**
 * Admin routes
 * Administrative endpoints for system management
 */

import { Router } from "express";
import { initializeData } from "../init-data";
import { logger } from "../utils/logger";

const router = Router();

/**
 * POST /api/admin/reinitialize-data
 * Force reinitialize static data (prompts, snippets, guides, etc.)
 */
router.post("/reinitialize-data", async (req, res) => {
  try {
    logger.info("Manual data reinitialization requested");
    
    await initializeData();
    
    res.json({
      success: true,
      message: "Data reinitialized successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error("Error reinitializing data", { error });
    res.status(500).json({
      success: false,
      error: "Failed to reinitialize data",
      message: error.message,
    });
  }
});

export default router;
