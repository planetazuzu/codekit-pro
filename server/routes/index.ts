/**
 * Routes index - Barrel export and main registration
 */

import type { Express } from "express";
import { registerPromptsRoutes } from "./prompts";
import { registerSnippetsRoutes } from "./snippets";
import { registerLinksRoutes } from "./links";
import { registerGuidesRoutes } from "./guides";
import { registerAnalyticsRoutes } from "./analytics";
import { registerAffiliatesRoutes } from "./affiliates";
import { registerShortlinkRoutes } from "./shortlinks";
import { registerAffiliateProgramsRoutes } from "./affiliatePrograms";
import { registerAuthRoutes } from "./auth";
import { registerUsersRoutes } from "./users";
import { registerStripeRoutes } from "./stripe";
import { registerPlansRoutes } from "./plans";
import { registerModerationRoutes } from "./moderation";
import { registerGitHubSyncRoutes } from "./github-sync";
import webhooksRouter from "./webhooks";
import deploymentsRouter from "./deployments";
import deploymentsRouter from "./deployments";

/**
 * Register all routes
 */
export function registerRoutes(app: Express): void {
  // Auth routes (no protection needed)
  registerAuthRoutes(app);
  
  // User routes (registration/login)
  registerUsersRoutes(app);
  
  // Stripe routes (payments/subscriptions)
  registerStripeRoutes(app);
  
  // Plans routes
  registerPlansRoutes(app);
  
  // Public API routes
  registerPromptsRoutes(app);
  registerSnippetsRoutes(app);
  registerLinksRoutes(app);
  registerGuidesRoutes(app);
  registerAnalyticsRoutes(app);
  registerAffiliatesRoutes(app);
  registerShortlinkRoutes(app);
  
  // Protected admin routes
  registerAffiliateProgramsRoutes(app);
  registerModerationRoutes(app);
  registerGitHubSyncRoutes(app);
  
  // Webhook routes (for CI/CD)
  app.use("/api/webhooks", webhooksRouter);
  
  // Deployment routes (for CI/CD management)
  app.use("/api/deployments", deploymentsRouter);
}

