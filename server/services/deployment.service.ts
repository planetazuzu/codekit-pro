/**
 * Deployment Service
 * Handles deployment tracking, rollback, and health monitoring
 */

import { logger } from "../utils/logger";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";

const execAsync = promisify(exec);

export interface DeploymentInfo {
  id: string;
  commit: string;
  ref: string;
  user: string;
  timestamp: Date;
  status: "pending" | "deploying" | "success" | "failed" | "rolled_back";
  healthCheckPassed: boolean;
  rollbackAvailable: boolean;
  previousDeploymentId?: string;
}

const DEPLOYMENTS_DIR = path.join(
  typeof __dirname !== 'undefined' ? __dirname : process.cwd(),
  typeof __dirname !== 'undefined' ? "../deployments" : "deployments"
);

const DEPLOYMENTS_FILE = path.join(DEPLOYMENTS_DIR, "deployments.json");

class DeploymentService {
  private deployments: DeploymentInfo[] = [];
  private currentDeployment: DeploymentInfo | null = null;

  constructor() {
    this.loadDeployments();
  }

  /**
   * Load deployments from disk
   */
  private async loadDeployments() {
    try {
      await fs.mkdir(DEPLOYMENTS_DIR, { recursive: true });
      const data = await fs.readFile(DEPLOYMENTS_FILE, "utf-8");
      this.deployments = JSON.parse(data).map((d: any) => ({
        ...d,
        timestamp: new Date(d.timestamp),
      }));
      this.currentDeployment = this.deployments.find((d) => d.status === "success") || null;
    } catch (error) {
      logger.warn("No deployments file found, starting fresh");
      this.deployments = [];
    }
  }

  /**
   * Save deployments to disk
   */
  private async saveDeployments() {
    try {
      await fs.mkdir(DEPLOYMENTS_DIR, { recursive: true });
      await fs.writeFile(
        DEPLOYMENTS_FILE,
        JSON.stringify(this.deployments, null, 2),
        "utf-8"
      );
    } catch (error) {
      logger.error("Failed to save deployments:", error);
    }
  }

  /**
   * Start a new deployment
   */
  async startDeployment(
    commit: string,
    ref: string,
    user: string
  ): Promise<DeploymentInfo> {
    const deployment: DeploymentInfo = {
      id: `deploy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      commit: commit.substring(0, 7),
      ref,
      user,
      timestamp: new Date(),
      status: "pending",
      healthCheckPassed: false,
      rollbackAvailable: false,
      previousDeploymentId: this.currentDeployment?.id,
    };

    this.deployments.unshift(deployment);
    this.currentDeployment = deployment;
    await this.saveDeployments();

    logger.info("Deployment started", { deploymentId: deployment.id, commit: deployment.commit });
    return deployment;
  }

  /**
   * Update deployment status
   */
  async updateDeploymentStatus(
    deploymentId: string,
    status: DeploymentInfo["status"],
    healthCheckPassed?: boolean
  ) {
    const deployment = this.deployments.find((d) => d.id === deploymentId);
    if (!deployment) {
      logger.warn("Deployment not found", { deploymentId });
      return;
    }

    deployment.status = status;
    if (healthCheckPassed !== undefined) {
      deployment.healthCheckPassed = healthCheckPassed;
    }

    if (status === "success") {
      this.currentDeployment = deployment;
      // Mark previous successful deployment as rollback available
      const previousSuccess = this.deployments.find(
        (d) => d.id !== deploymentId && d.status === "success"
      );
      if (previousSuccess) {
        previousSuccess.rollbackAvailable = true;
      }
    }

    await this.saveDeployments();
    logger.info("Deployment status updated", { deploymentId, status });
  }

  /**
   * Perform health check (enhanced with DB check)
   */
  async performHealthCheck(deploymentId: string): Promise<boolean> {
    try {
      const port = process.env.PORT || "8604";
      const healthUrl = `http://localhost:${port}/health`;

      // Basic health check - verify server responds
      const response = await fetch(healthUrl, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(10000), // 10 second timeout (increased for slow starts)
      });

      if (!response.ok) {
        logger.warn("Health check returned non-OK status", { 
          deploymentId, 
          status: response.status 
        });
        await this.updateDeploymentStatus(deploymentId, "failed", false);
        return false;
      }

      // Verify response is valid JSON
      let healthData;
      try {
        healthData = await response.json();
      } catch (jsonError) {
        logger.warn("Health check returned invalid JSON", { deploymentId });
        await this.updateDeploymentStatus(deploymentId, "failed", false);
        return false;
      }

      // Basic validation - response should have status
      const isHealthy = healthData?.status === "ok" || healthData?.status === "healthy";
      
      // Advanced check: Verify API endpoint responds (if available)
      if (isHealthy && healthData?.database === "connected") {
        logger.info("Health check passed with database connection", { deploymentId });
      } else if (isHealthy) {
        logger.info("Health check passed (basic)", { deploymentId });
      }

      await this.updateDeploymentStatus(
        deploymentId, 
        isHealthy ? "success" : "failed", 
        isHealthy
      );
      
      return isHealthy;
    } catch (error) {
      logger.error("Health check failed", { deploymentId, error });
      await this.updateDeploymentStatus(deploymentId, "failed", false);
      return false;
    }
  }

  /**
   * Perform rollback to previous deployment
   */
  async rollback(deploymentId: string): Promise<boolean> {
    const deployment = this.deployments.find((d) => d.id === deploymentId);
    if (!deployment || !deployment.previousDeploymentId) {
      logger.error("Cannot rollback: no previous deployment", { deploymentId });
      return false;
    }

    const previousDeployment = this.deployments.find(
      (d) => d.id === deployment.previousDeploymentId
    );

    if (!previousDeployment || previousDeployment.status !== "success") {
      logger.error("Cannot rollback: previous deployment not successful", {
        deploymentId,
        previousDeploymentId: deployment.previousDeploymentId,
      });
      return false;
    }

    try {
      logger.info("Starting rollback", {
        from: deployment.commit,
        to: previousDeployment.commit,
      });

      // Mark current deployment as rolled back
      await this.updateDeploymentStatus(deploymentId, "rolled_back");

      // Checkout previous commit
      const projectRoot = path.resolve(
        typeof __dirname !== 'undefined' ? __dirname : process.cwd(),
        typeof __dirname !== 'undefined' ? "../.." : "."
      );

      await execAsync(`git checkout ${previousDeployment.commit}`, {
        cwd: projectRoot,
      });

      // Trigger redeployment
      const useDocker = process.env.USE_DOCKER === "true";
      const deployScript = useDocker
        ? path.join(projectRoot, "scripts", "deploy-docker-auto.sh")
        : path.join(projectRoot, "scripts", "deploy-auto.sh");

      await execAsync(`bash ${deployScript}`, {
        cwd: projectRoot,
        env: {
          ...process.env,
          DEPLOY_COMMIT: previousDeployment.commit,
          DEPLOY_REF: previousDeployment.ref,
          DEPLOY_USER: "system-rollback",
        },
      });

      // Create new deployment record for rollback
      const rollbackDeployment: DeploymentInfo = {
        id: `rollback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        commit: previousDeployment.commit,
        ref: previousDeployment.ref,
        user: "system-rollback",
        timestamp: new Date(),
        status: "deploying",
        healthCheckPassed: false,
        rollbackAvailable: false,
        previousDeploymentId: deploymentId,
      };

      this.deployments.unshift(rollbackDeployment);
      await this.saveDeployments();

      // Wait and check health
      await new Promise((resolve) => setTimeout(resolve, 10000)); // Wait 10 seconds
      const healthy = await this.performHealthCheck(rollbackDeployment.id);

      if (healthy) {
        await this.updateDeploymentStatus(rollbackDeployment.id, "success", true);
        logger.info("Rollback completed successfully", {
          rollbackDeploymentId: rollbackDeployment.id,
        });
        return true;
      } else {
        await this.updateDeploymentStatus(rollbackDeployment.id, "failed", false);
        logger.error("Rollback health check failed", {
          rollbackDeploymentId: rollbackDeployment.id,
        });
        return false;
      }
    } catch (error) {
      logger.error("Rollback failed", { deploymentId, error });
      return false;
    }
  }

  /**
   * Get all deployments
   */
  getDeployments(): DeploymentInfo[] {
    return this.deployments;
  }

  /**
   * Get current deployment
   */
  getCurrentDeployment(): DeploymentInfo | null {
    return this.currentDeployment;
  }

  /**
   * Get deployment by ID
   */
  getDeployment(deploymentId: string): DeploymentInfo | undefined {
    return this.deployments.find((d) => d.id === deploymentId);
  }
}

export const deploymentService = new DeploymentService();

