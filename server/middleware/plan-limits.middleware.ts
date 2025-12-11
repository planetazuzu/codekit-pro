/**
 * Plan Limits Middleware
 * Checks if user's plan allows the requested action
 */

import type { Request, Response, NextFunction } from "express";
import { getStorage } from "../storage/index";
import { getPlan, isWithinLimit, hasFeature, getRemainingLimit } from "../config/plans";
import { sendError, sendForbidden } from "../utils/response";
import { logger } from "../utils/logger";

/**
 * Middleware to check if user has reached limit for a resource type
 */
export function checkLimit(limitType: "prompts" | "snippets" | "links" | "guides") {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        sendError(res, "Authentication required", 401, "UNAUTHORIZED");
        return;
      }

      const storage = getStorage();
      const user = await storage.getUser(req.user.id);

      if (!user) {
        sendError(res, "User not found", 404, "USER_NOT_FOUND");
        return;
      }

      const plan = getPlan(user.plan || "free");
      if (!plan) {
        sendError(res, "Invalid plan", 400, "INVALID_PLAN");
        return;
      }

      // Get current count
      let currentCount = 0;
      switch (limitType) {
        case "prompts":
          const prompts = await storage.getPrompts(user.id);
          currentCount = prompts.length;
          break;
        case "snippets":
          const snippets = await storage.getSnippets(user.id);
          currentCount = snippets.length;
          break;
        case "links":
          const links = await storage.getLinks(user.id);
          currentCount = links.length;
          break;
        case "guides":
          const guides = await storage.getGuides(user.id);
          currentCount = guides.length;
          break;
      }

      // Check if within limit
      if (!isWithinLimit(user.plan || "free", limitType, currentCount)) {
        const remaining = getRemainingLimit(user.plan || "free", limitType, currentCount);
        const limit = plan.limits[limitType];
        
        sendForbidden(
          res,
          `Plan limit reached. You have ${limit === -1 ? "unlimited" : limit} ${limitType} allowed. ` +
          `Please upgrade your plan to create more ${limitType}.`
        );
        return;
      }

      next();
    } catch (error) {
      logger.error(`Error checking ${limitType} limit:`, error);
      next(error);
    }
  };
}

/**
 * Middleware to check if user has a specific feature
 */
export function requireFeature(feature: keyof import("../config/plans").PlanFeatures) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, "Authentication required", 401, "UNAUTHORIZED");
      return;
    }

    if (!hasFeature(req.user.plan || "free", feature)) {
      const plan = getPlan(req.user.plan || "free");
      sendForbidden(
        res,
        `This feature requires a higher plan. Your current plan (${plan?.name || "Free"}) does not include ${feature}. ` +
        `Please upgrade to access this feature.`
      );
      return;
    }

    next();
  };
}

/**
 * Middleware to check if user's plan is active (not expired)
 */
export async function requireActivePlan(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      sendError(res, "Authentication required", 401, "UNAUTHORIZED");
      return;
    }

    const storage = getStorage();
    const user = await storage.getUser(req.user.id);

    if (!user) {
      sendError(res, "User not found", 404, "USER_NOT_FOUND");
      return;
    }

    // Free plan is always active
    if (user.plan === "free") {
      next();
      return;
    }

    // Check if subscription is active
    if (user.subscriptionStatus === "active") {
      // Check if subscription hasn't expired
      if (user.subscriptionEndsAt && user.subscriptionEndsAt < new Date()) {
        // Subscription expired, downgrade to free
        await storage.updateUser({
          id: user.id,
          plan: "free",
          subscriptionStatus: "expired",
        });

        sendForbidden(
          res,
          "Your subscription has expired. Please renew your subscription to continue using premium features."
        );
        return;
      }

      next();
      return;
    }

    // Subscription not active
    if (user.subscriptionStatus === "canceled" || user.subscriptionStatus === "past_due") {
      sendForbidden(
        res,
        "Your subscription is not active. Please update your payment method or renew your subscription."
      );
      return;
    }

    // Default: allow access (grace period)
    next();
  } catch (error) {
    logger.error("Error checking active plan:", error);
    next(error);
  }
}

/**
 * Get user's plan limits info
 * Adds plan info to req object
 */
export async function attachPlanInfo(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (req.user) {
      const storage = getStorage();
      const user = await storage.getUser(req.user.id);

      if (user) {
        const plan = getPlan(user.plan || "free");
        
        // Attach plan info to request
        (req as any).planInfo = {
          plan: plan,
          limits: plan?.limits,
          features: plan?.features,
          subscriptionStatus: user.subscriptionStatus,
          subscriptionEndsAt: user.subscriptionEndsAt,
        };
      }
    }

    next();
  } catch (error) {
    logger.error("Error attaching plan info:", error);
    next(error);
  }
}


