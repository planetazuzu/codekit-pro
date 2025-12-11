/**
 * Plans Controller
 * Handles plan-related endpoints
 */

import type { Request, Response, NextFunction } from "express";
import { getStorage } from "../storage/index";
import { getAllPlans, getPlanLimitsSummary, getRemainingLimit } from "../config/plans";
import { sendSuccess, sendError, sendUnauthorized } from "../utils/response";
import { logger } from "../utils/logger";

/**
 * Get all available plans
 * GET /api/plans
 */
export async function getPlans(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const plans = getAllPlans();
    
    // Remove priceId from response (sensitive info)
    const publicPlans = plans.map((plan) => ({
      id: plan.id,
      name: plan.name,
      description: plan.description,
      price: plan.price,
      limits: plan.limits,
      features: plan.features,
    }));

    sendSuccess(res, publicPlans);
  } catch (error) {
    logger.error("Error getting plans:", error);
    next(error);
  }
}

/**
 * Get current user's plan info and usage
 * GET /api/plans/me
 */
export async function getMyPlan(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      sendUnauthorized(res, "Authentication required");
      return;
    }

    const storage = getStorage();
    const user = await storage.getUser(req.user.id);

    if (!user) {
      sendError(res, "User not found", 404, "USER_NOT_FOUND");
      return;
    }

    const planSummary = getPlanLimitsSummary(user.plan || "free");
    
    if (!planSummary) {
      sendError(res, "Invalid plan", 400, "INVALID_PLAN");
      return;
    }

    // Get current usage
    const [prompts, snippets, links, guides] = await Promise.all([
      storage.getPrompts(user.id),
      storage.getSnippets(user.id),
      storage.getLinks(user.id),
      storage.getGuides(user.id),
    ]);

    const usage = {
      prompts: {
        current: prompts.length,
        limit: planSummary.limits.prompts,
        remaining: getRemainingLimit(user.plan || "free", "prompts", prompts.length),
      },
      snippets: {
        current: snippets.length,
        limit: planSummary.limits.snippets,
        remaining: getRemainingLimit(user.plan || "free", "snippets", snippets.length),
      },
      links: {
        current: links.length,
        limit: planSummary.limits.links,
        remaining: getRemainingLimit(user.plan || "free", "links", links.length),
      },
      guides: {
        current: guides.length,
        limit: planSummary.limits.guides,
        remaining: getRemainingLimit(user.plan || "free", "guides", guides.length),
      },
    };

    sendSuccess(res, {
      plan: {
        id: user.plan,
        name: planSummary.limits,
        features: planSummary.features,
      },
      subscription: {
        status: user.subscriptionStatus,
        endsAt: user.subscriptionEndsAt,
        stripeCustomerId: user.stripeCustomerId,
        stripeSubscriptionId: user.stripeSubscriptionId,
      },
      usage,
    });
  } catch (error) {
    logger.error("Error getting user plan:", error);
    next(error);
  }
}


