/**
 * Stripe routes
 * Handles Stripe payment and subscription endpoints
 */

import type { Express } from "express";
import { requireUserAuth } from "../middleware/user-auth.middleware";
import { apiLimiter } from "../middleware/rate-limit.middleware";
import * as stripeController from "../controllers/stripe.controller";
import express from "express";

export function registerStripeRoutes(app: Express): void {
  // Webhook endpoint (no auth, no rate limit, raw body required)
  app.post(
    "/api/stripe/webhook",
    express.raw({ type: "application/json" }),
    stripeController.handleWebhook
  );

  // Protected routes (require authentication)
  app.post("/api/stripe/customer", apiLimiter, requireUserAuth, stripeController.createOrGetCustomer);
  app.post("/api/stripe/checkout", apiLimiter, requireUserAuth, stripeController.createCheckout);
  app.post("/api/stripe/billing-portal", apiLimiter, requireUserAuth, stripeController.createBillingPortal);
  app.post("/api/stripe/subscription/cancel", apiLimiter, requireUserAuth, stripeController.cancelUserSubscription);
  app.post("/api/stripe/subscription/resume", apiLimiter, requireUserAuth, stripeController.resumeUserSubscription);
  
  // Public route (get available plans)
  app.get("/api/stripe/plans", apiLimiter, stripeController.getPlans);
}


