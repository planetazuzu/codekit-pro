/**
 * Webhook routes for CI/CD integration
 * Allows GitHub Actions or other services to trigger deployments
 */

import { Router } from "express";
import { logger } from "../utils/logger";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import { fileURLToPath } from "url";

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "../..");

const router = Router();

/**
 * Verify webhook secret
 */
function verifyWebhookSecret(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  const expectedSecret = process.env.WEBHOOK_SECRET;

  if (!expectedSecret) {
    logger.warn("WEBHOOK_SECRET not configured, webhook endpoint disabled");
    return res.status(503).json({ error: "Webhook not configured" });
  }

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid authorization header" });
  }

  const token = authHeader.substring(7);
  if (token !== expectedSecret) {
    logger.warn("Invalid webhook secret attempted");
    return res.status(403).json({ error: "Invalid webhook secret" });
  }

  next();
}

/**
 * POST /api/webhooks/deploy
 * Trigger deployment from webhook
 */
router.post("/deploy", verifyWebhookSecret, async (req, res) => {
  try {
    const { ref, commit, repository, pusher } = req.body;

    logger.info("Deployment webhook triggered", {
      ref,
      commit: commit?.substring(0, 7),
      repository,
      pusher,
    });

    // Only deploy from main/master branch
    if (ref !== "refs/heads/main" && ref !== "refs/heads/master") {
      return res.json({
        success: true,
        message: "Skipped deployment (not main/master branch)",
        ref,
      });
    }

    // Run deployment script
    const deployScript = path.join(projectRoot, "scripts", "deploy-auto.sh");

    logger.info("Executing deployment script...");

    const { stdout, stderr } = await execAsync(`bash ${deployScript}`, {
      cwd: projectRoot,
      env: {
        ...process.env,
        DEPLOY_COMMIT: commit,
        DEPLOY_REF: ref,
        DEPLOY_USER: pusher,
      },
    });

    if (stdout) logger.info("Deployment output:", stdout);
    if (stderr) logger.warn("Deployment warnings:", stderr);

    res.json({
      success: true,
      message: "Deployment triggered successfully",
      commit: commit?.substring(0, 7),
      ref,
    });
  } catch (error: any) {
    logger.error("Deployment webhook error:", error);
    res.status(500).json({
      success: false,
      error: "Deployment failed",
      message: error.message,
    });
  }
});

/**
 * GET /api/webhooks/status
 * Check webhook configuration status
 */
router.get("/status", (req, res) => {
  const isConfigured = !!process.env.WEBHOOK_SECRET;
  res.json({
    configured: isConfigured,
    message: isConfigured
      ? "Webhook endpoint is configured"
      : "WEBHOOK_SECRET not set, webhook disabled",
  });
});

export default router;

