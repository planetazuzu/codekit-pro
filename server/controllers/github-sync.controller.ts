/**
 * GitHub Sync Controller
 * Endpoints para sincronización bidireccional con GitHub
 */

import type { Request, Response } from "express";
import { sendSuccess, sendError } from "../utils/response";
import {
  syncAllFromGitHub,
  pushAllToGitHub,
  syncPromptsFromGitHub,
  syncSnippetsFromGitHub,
  syncLinksFromGitHub,
  syncGuidesFromGitHub,
  pushPromptsToGitHub,
  pushSnippetsToGitHub,
  pushLinksToGitHub,
  pushGuidesToGitHub,
} from "../services/github-sync.service";
import { env } from "../config/env";
import { logger } from "../utils/logger";

/**
 * Check GitHub sync configuration
 */
export async function getSyncStatus(req: Request, res: Response): Promise<void> {
  try {
    const isConfigured = !!(
      env.GITHUB_TOKEN &&
      env.GITHUB_REPO_OWNER &&
      env.GITHUB_REPO_NAME
    );

    sendSuccess(res, {
      configured: isConfigured,
      enabled: env.GITHUB_SYNC_ENABLED,
      repo: isConfigured
        ? `${env.GITHUB_REPO_OWNER}/${env.GITHUB_REPO_NAME}`
        : null,
      missing: {
        token: !env.GITHUB_TOKEN,
        owner: !env.GITHUB_REPO_OWNER,
        repo: !env.GITHUB_REPO_NAME,
      },
    });
  } catch (error) {
    logger.error("Error getting sync status:", error);
    sendError(res, "Error getting sync status", 500, "SYNC_STATUS_ERROR");
  }
}

/**
 * Sync all resources from GitHub
 */
export async function syncFromGitHub(req: Request, res: Response): Promise<void> {
  try {
    if (!env.GITHUB_TOKEN || !env.GITHUB_REPO_OWNER || !env.GITHUB_REPO_NAME) {
      sendError(
        res,
        "GitHub sync not configured. Please set GITHUB_TOKEN, GITHUB_REPO_OWNER, and GITHUB_REPO_NAME",
        400,
        "GITHUB_NOT_CONFIGURED"
      );
      return;
    }

    const result = await syncAllFromGitHub();

    sendSuccess(res, {
      message: "Sync from GitHub completed",
      results: result,
      summary: {
        prompts: { created: result.prompts.created, updated: result.prompts.updated, errors: result.prompts.errors.length },
        snippets: { created: result.snippets.created, updated: result.snippets.updated, errors: result.snippets.errors.length },
        links: { created: result.links.created, updated: result.links.updated, errors: result.links.errors.length },
        guides: { created: result.guides.created, updated: result.guides.updated, errors: result.guides.errors.length },
      },
    });
  } catch (error) {
    logger.error("Error syncing from GitHub:", error);
    sendError(
      res,
      `Error syncing from GitHub: ${error instanceof Error ? error.message : String(error)}`,
      500,
      "SYNC_FROM_GITHUB_ERROR"
    );
  }
}

/**
 * Push all resources to GitHub
 */
export async function pushToGitHub(req: Request, res: Response): Promise<void> {
  try {
    if (!env.GITHUB_TOKEN || !env.GITHUB_REPO_OWNER || !env.GITHUB_REPO_NAME) {
      sendError(
        res,
        "GitHub sync not configured. Please set GITHUB_TOKEN, GITHUB_REPO_OWNER, and GITHUB_REPO_NAME",
        400,
        "GITHUB_NOT_CONFIGURED"
      );
      return;
    }

    const result = await pushAllToGitHub();

    sendSuccess(res, {
      message: "Push to GitHub completed",
      results: result,
    });
  } catch (error) {
    logger.error("Error pushing to GitHub:", error);
    sendError(
      res,
      `Error pushing to GitHub: ${error instanceof Error ? error.message : String(error)}`,
      500,
      "PUSH_TO_GITHUB_ERROR"
    );
  }
}

/**
 * Sync specific resource type from GitHub
 */
export async function syncResourceFromGitHub(req: Request, res: Response): Promise<void> {
  try {
    const { type } = req.params;

    if (!env.GITHUB_TOKEN || !env.GITHUB_REPO_OWNER || !env.GITHUB_REPO_NAME) {
      sendError(
        res,
        "GitHub sync not configured",
        400,
        "GITHUB_NOT_CONFIGURED"
      );
      return;
    }

    let result;
    switch (type) {
      case "prompts":
        result = await syncPromptsFromGitHub();
        break;
      case "snippets":
        result = await syncSnippetsFromGitHub();
        break;
      case "links":
        result = await syncLinksFromGitHub();
        break;
      case "guides":
        result = await syncGuidesFromGitHub();
        break;
      default:
        sendError(res, `Invalid resource type: ${type}`, 400, "INVALID_RESOURCE_TYPE");
        return;
    }

    sendSuccess(res, {
      message: `Sync ${type} from GitHub completed`,
      result,
    });
  } catch (error) {
    logger.error(`Error syncing ${req.params.type} from GitHub:`, error);
    sendError(
      res,
      `Error syncing ${req.params.type}: ${error instanceof Error ? error.message : String(error)}`,
      500,
      "SYNC_RESOURCE_ERROR"
    );
  }
}

/**
 * Push specific resource type to GitHub
 */
export async function pushResourceToGitHub(req: Request, res: Response): Promise<void> {
  try {
    const { type } = req.params;

    if (!env.GITHUB_TOKEN || !env.GITHUB_REPO_OWNER || !env.GITHUB_REPO_NAME) {
      sendError(
        res,
        "GitHub sync not configured",
        400,
        "GITHUB_NOT_CONFIGURED"
      );
      return;
    }

    let result;
    switch (type) {
      case "prompts":
        result = await pushPromptsToGitHub();
        break;
      case "snippets":
        result = await pushSnippetsToGitHub();
        break;
      case "links":
        result = await pushLinksToGitHub();
        break;
      case "guides":
        result = await pushGuidesToGitHub();
        break;
      default:
        sendError(res, `Invalid resource type: ${type}`, 400, "INVALID_RESOURCE_TYPE");
        return;
    }

    sendSuccess(res, {
      message: `Push ${type} to GitHub completed`,
      result,
    });
  } catch (error) {
    logger.error(`Error pushing ${req.params.type} to GitHub:`, error);
    sendError(
      res,
      `Error pushing ${req.params.type}: ${error instanceof Error ? error.message : String(error)}`,
      500,
      "PUSH_RESOURCE_ERROR"
    );
  }
}

