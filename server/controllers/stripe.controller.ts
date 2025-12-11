/**
 * Stripe Controller
 * Handles Stripe-related API endpoints
 */

import type { Request, Response, NextFunction } from "express";
import { getStorage } from "../storage/index";
import {
  createCustomer,
  createCheckoutSession,
  createBillingPortalSession,
  cancelSubscription,
  resumeSubscription,
  updateSubscription,
  listPrices,
  verifyWebhookSignature,
  getSubscription,
} from "../services/stripe.service";
import type Stripe from "stripe";
import { sendSuccess, sendError, sendUnauthorized } from "../utils/response";
import { logger } from "../utils/logger";
import { env } from "../config/env";

/**
 * Create or get Stripe customer for current user
 * POST /api/stripe/customer
 */
export async function createOrGetCustomer(
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

    // If user already has a Stripe customer ID, return it
    if (user.stripeCustomerId) {
      sendSuccess(res, {
        customerId: user.stripeCustomerId,
        message: "Customer already exists",
      });
      return;
    }

    // Create new Stripe customer
    const customer = await createCustomer(user.email || "", user.username, {
      userId: user.id,
      username: user.username,
    });

    // Update user with Stripe customer ID
    await storage.updateUser({
      id: user.id,
      stripeCustomerId: customer.id,
    });

    logger.info(`Stripe customer created for user: ${user.username}`);

    sendSuccess(res, {
      customerId: customer.id,
      message: "Customer created successfully",
    });
  } catch (error: any) {
    logger.error("Error creating/getting Stripe customer:", error);
    if (error.message?.includes("Stripe is not configured")) {
      sendError(res, "Stripe is not configured", 503, "STRIPE_NOT_CONFIGURED");
      return;
    }
    next(error);
  }
}

/**
 * Create checkout session for subscription
 * POST /api/stripe/checkout
 */
export async function createCheckout(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      sendUnauthorized(res, "Authentication required");
      return;
    }

    const { priceId } = req.body;

    if (!priceId || typeof priceId !== "string") {
      sendError(res, "priceId is required", 400, "MISSING_PRICE_ID");
      return;
    }

    const storage = getStorage();
    const user = await storage.getUser(req.user.id);

    if (!user) {
      sendError(res, "User not found", 404, "USER_NOT_FOUND");
      return;
    }

    // Ensure user has Stripe customer ID
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await createCustomer(user.email || "", user.username, {
        userId: user.id,
        username: user.username,
      });
      customerId = customer.id;
      await storage.updateUser({
        id: user.id,
        stripeCustomerId: customerId,
      });
    }

    // Create checkout session
    const apiUrl = env.API_URL || `http://localhost:${env.PORT}`;
    const successUrl = `${apiUrl}/api/stripe/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${apiUrl}/api/stripe/cancel`;

    const session = await createCheckoutSession(
      customerId,
      priceId,
      successUrl,
      cancelUrl,
      {
        userId: user.id,
      }
    );

    sendSuccess(res, {
      sessionId: session.id,
      url: session.url,
    });
  } catch (error: any) {
    logger.error("Error creating checkout session:", error);
    if (error.message?.includes("Stripe is not configured")) {
      sendError(res, "Stripe is not configured", 503, "STRIPE_NOT_CONFIGURED");
      return;
    }
    next(error);
  }
}

/**
 * Create billing portal session
 * POST /api/stripe/billing-portal
 */
export async function createBillingPortal(
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

    if (!user || !user.stripeCustomerId) {
      sendError(res, "No Stripe customer found. Please create a subscription first.", 404, "NO_CUSTOMER");
      return;
    }

    const apiUrl = env.API_URL || `http://localhost:${env.PORT}`;
    const returnUrl = `${apiUrl}/dashboard`;

    const session = await createBillingPortalSession(user.stripeCustomerId, returnUrl);

    sendSuccess(res, {
      url: session.url,
    });
  } catch (error: any) {
    logger.error("Error creating billing portal session:", error);
    if (error.message?.includes("Stripe is not configured")) {
      sendError(res, "Stripe is not configured", 503, "STRIPE_NOT_CONFIGURED");
      return;
    }
    next(error);
  }
}

/**
 * Cancel subscription
 * POST /api/stripe/subscription/cancel
 */
export async function cancelUserSubscription(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      sendUnauthorized(res, "Authentication required");
      return;
    }

    const { immediately } = req.body;
    const storage = getStorage();
    const user = await storage.getUser(req.user.id);

    if (!user || !user.stripeSubscriptionId) {
      sendError(res, "No active subscription found", 404, "NO_SUBSCRIPTION");
      return;
    }

    await cancelSubscription(user.stripeSubscriptionId, immediately === true);

    // Update user subscription status
    await storage.updateUser({
      id: user.id,
      subscriptionStatus: immediately ? "canceled" : "cancel_at_period_end",
    });

    logger.info(`Subscription canceled for user: ${user.username}`);

    sendSuccess(res, {
      message: immediately ? "Subscription canceled immediately" : "Subscription will cancel at period end",
    });
  } catch (error: any) {
    logger.error("Error canceling subscription:", error);
    if (error.message?.includes("Stripe is not configured")) {
      sendError(res, "Stripe is not configured", 503, "STRIPE_NOT_CONFIGURED");
      return;
    }
    next(error);
  }
}

/**
 * Resume subscription
 * POST /api/stripe/subscription/resume
 */
export async function resumeUserSubscription(
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

    if (!user || !user.stripeSubscriptionId) {
      sendError(res, "No subscription found", 404, "NO_SUBSCRIPTION");
      return;
    }

    await resumeSubscription(user.stripeSubscriptionId);

    // Update user subscription status
    await storage.updateUser({
      id: user.id,
      subscriptionStatus: "active",
    });

    logger.info(`Subscription resumed for user: ${user.username}`);

    sendSuccess(res, {
      message: "Subscription resumed successfully",
    });
  } catch (error: any) {
    logger.error("Error resuming subscription:", error);
    if (error.message?.includes("Stripe is not configured")) {
      sendError(res, "Stripe is not configured", 503, "STRIPE_NOT_CONFIGURED");
      return;
    }
    next(error);
  }
}

/**
 * Get available plans/prices
 * GET /api/stripe/plans
 */
export async function getPlans(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const prices = await listPrices(true);

    const plans = prices.map((price) => ({
      id: price.id,
      productId: price.product,
      amount: price.unit_amount,
      currency: price.currency,
      interval: price.recurring?.interval,
      intervalCount: price.recurring?.interval_count,
      nickname: price.nickname,
      metadata: price.metadata,
    }));

    sendSuccess(res, plans);
  } catch (error: any) {
    logger.error("Error getting plans:", error);
    if (error.message?.includes("Stripe is not configured")) {
      sendError(res, "Stripe is not configured", 503, "STRIPE_NOT_CONFIGURED");
      return;
    }
    next(error);
  }
}

/**
 * Handle Stripe webhook
 * POST /api/stripe/webhook
 */
export async function handleWebhook(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const signature = req.headers["stripe-signature"] as string;

    if (!signature) {
      sendError(res, "Missing stripe-signature header", 400, "MISSING_SIGNATURE");
      return;
    }

    const event = verifyWebhookSignature(req.body, signature);
    const storage = getStorage();

    logger.info(`Stripe webhook received: ${event.type}`);

    // Handle different event types
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === "subscription" && session.subscription) {
          const subscription = await getSubscription(session.subscription as string);
          const userId = session.metadata?.userId;

          if (userId) {
            await storage.updateUser({
              id: userId,
              stripeSubscriptionId: subscription.id,
              subscriptionStatus: subscription.status,
              subscriptionEndsAt: subscription.current_period_end
                ? new Date(subscription.current_period_end * 1000)
                : undefined,
            });

            logger.info(`Subscription activated for user: ${userId}`);
          }
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Find user by Stripe customer ID
        // Note: This requires adding a method to find user by stripeCustomerId
        // For now, we'll update based on subscription metadata or customer metadata
        logger.info(`Subscription updated: ${subscription.id}`);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Find and update user
        logger.info(`Subscription deleted: ${subscription.id}`);
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        logger.info(`Payment succeeded for invoice: ${invoice.id}`);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        logger.info(`Payment failed for invoice: ${invoice.id}`);
        break;
      }

      default:
        logger.info(`Unhandled webhook event type: ${event.type}`);
    }

    // Acknowledge receipt
    res.json({ received: true });
  } catch (error: any) {
    logger.error("Error handling webhook:", error);
    if (error.message?.includes("Stripe is not configured")) {
      sendError(res, "Stripe is not configured", 503, "STRIPE_NOT_CONFIGURED");
      return;
    }
    next(error);
  }
}


