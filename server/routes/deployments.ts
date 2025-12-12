/**
 * Deployment routes
 * API endpoints for deployment management, rollback, and monitoring
 */

import { Router } from "express";
import { deploymentService } from "../services/deployment.service";
import { notificationService } from "../services/notification.service";
import { logger } from "../utils/logger";

const router = Router();

/**
 * GET /api/deployments
 * Get all deployments
 */
router.get("/", (req, res) => {
  try {
    const deployments = deploymentService.getDeployments();
    res.json({
      success: true,
      data: deployments,
      count: deployments.length,
    });
  } catch (error: any) {
    logger.error("Error fetching deployments", { error });
    res.status(500).json({
      success: false,
      error: "Failed to fetch deployments",
      message: error.message,
    });
  }
});

/**
 * GET /api/deployments/current
 * Get current deployment
 */
router.get("/current", (req, res) => {
  try {
    const deployment = deploymentService.getCurrentDeployment();
    if (!deployment) {
      return res.status(404).json({
        success: false,
        error: "No current deployment found",
      });
    }
    res.json({
      success: true,
      data: deployment,
    });
  } catch (error: any) {
    logger.error("Error fetching current deployment", { error });
    res.status(500).json({
      success: false,
      error: "Failed to fetch current deployment",
      message: error.message,
    });
  }
});

/**
 * GET /api/deployments/:id
 * Get deployment by ID
 */
router.get("/:id", (req, res) => {
  try {
    const { id } = req.params;
    const deployment = deploymentService.getDeployment(id);
    if (!deployment) {
      return res.status(404).json({
        success: false,
        error: "Deployment not found",
      });
    }
    res.json({
      success: true,
      data: deployment,
    });
  } catch (error: any) {
    logger.error("Error fetching deployment", { error });
    res.status(500).json({
      success: false,
      error: "Failed to fetch deployment",
      message: error.message,
    });
  }
});

/**
 * POST /api/deployments/:id/rollback
 * Rollback to previous deployment
 */
router.post("/:id/rollback", async (req, res) => {
  try {
    const { id } = req.params;
    const deployment = deploymentService.getDeployment(id);
    
    if (!deployment) {
      return res.status(404).json({
        success: false,
        error: "Deployment not found",
      });
    }

    // Respond immediately
    res.json({
      success: true,
      message: "Rollback initiated",
      deploymentId: id,
    });

    // Perform rollback in background
    const rollbackSuccess = await deploymentService.rollback(id);
    
    if (rollbackSuccess) {
      await notificationService.notifyDeployment(deployment, "rolled_back");
      logger.info("Rollback completed successfully", { deploymentId: id });
    } else {
      await notificationService.notifyAlert("error", "Rollback Failed", `Failed to rollback deployment ${id}`);
      logger.error("Rollback failed", { deploymentId: id });
    }
  } catch (error: any) {
    logger.error("Error during rollback", { error });
    await notificationService.notifyAlert("error", "Rollback Error", error.message);
    res.status(500).json({
      success: false,
      error: "Rollback failed",
      message: error.message,
    });
  }
});

/**
 * POST /api/deployments/:id/health-check
 * Perform health check for deployment
 */
router.post("/:id/health-check", async (req, res) => {
  try {
    const { id } = req.params;
    const deployment = deploymentService.getDeployment(id);
    
    if (!deployment) {
      return res.status(404).json({
        success: false,
        error: "Deployment not found",
      });
    }

    const isHealthy = await deploymentService.performHealthCheck(id);
    
    res.json({
      success: true,
      healthy: isHealthy,
      deploymentId: id,
    });
  } catch (error: any) {
    logger.error("Error during health check", { error });
    res.status(500).json({
      success: false,
      error: "Health check failed",
      message: error.message,
    });
  }
});

export default router;

