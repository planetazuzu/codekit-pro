/**
 * Webhook routes for CI/CD integration
 * Allows GitHub Actions or other services to trigger deployments
 */

import { Router } from "express";
import { logger } from "../utils/logger";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";

const execAsync = promisify(exec);
// En CommonJS (formato de compilación), __dirname está disponible automáticamente
// Usamos process.cwd() como fallback si __dirname no está disponible
const projectRoot = path.resolve(
  typeof __dirname !== 'undefined' ? __dirname : process.cwd(),
  typeof __dirname !== 'undefined' ? "../.." : "."
);

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
    const { ref, commit, repository, pusher, workflow, run_id } = req.body;

    logger.info("Deployment webhook triggered", {
      ref,
      commit: commit?.substring(0, 7),
      repository,
      pusher,
      workflow,
      run_id,
    });

    // Only deploy from main/master branch
    if (ref !== "refs/heads/main" && ref !== "refs/heads/master") {
      return res.json({
        success: true,
        message: "Skipped deployment (not main/master branch)",
        ref,
      });
    }

    // Detectar si estamos usando Docker
    const useDocker = process.env.USE_DOCKER === "true" || 
                      (await execAsync("command -v docker > /dev/null 2>&1 && echo 'yes' || echo 'no'")).stdout.trim() === "yes";

    // Seleccionar script de despliegue
    const deployScript = useDocker 
      ? path.join(projectRoot, "scripts", "deploy-docker-auto.sh")
      : path.join(projectRoot, "scripts", "deploy-auto.sh");

    logger.info(`Executing deployment script: ${deployScript} (Docker: ${useDocker})`);

    // Responder inmediatamente para evitar timeout
    res.json({
      success: true,
      message: "Deployment triggered successfully",
      commit: commit?.substring(0, 7),
      ref,
      docker: useDocker,
    });

    // Ejecutar despliegue en background
    execAsync(`bash ${deployScript}`, {
      cwd: projectRoot,
      env: {
        ...process.env,
        DEPLOY_COMMIT: commit,
        DEPLOY_REF: ref,
        DEPLOY_USER: pusher,
        DEPLOY_WORKFLOW: workflow,
        DEPLOY_RUN_ID: run_id,
      },
    }).then(({ stdout, stderr }) => {
      if (stdout) logger.info("Deployment output:", stdout);
      if (stderr) logger.warn("Deployment warnings:", stderr);
      logger.info("Deployment completed successfully");
    }).catch((error) => {
      logger.error("Deployment error:", error);
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

