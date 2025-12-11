/**
 * Plan Configuration
 * Defines available plans, their limits, and features
 */

export type PlanType = "free" | "pro" | "enterprise";

export interface PlanLimits {
  prompts: number; // Max number of prompts
  snippets: number; // Max number of snippets
  links: number; // Max number of links
  guides: number; // Max number of guides
  storageMB: number; // Max storage in MB
  apiCallsPerMonth: number; // Max API calls per month
}

export interface PlanFeatures {
  aiTools: boolean; // Access to AI-powered tools
  advancedAnalytics: boolean; // Advanced analytics dashboard
  apiAccess: boolean; // API access
  customBranding: boolean; // Custom branding
  prioritySupport: boolean; // Priority support
  exportData: boolean; // Export data
  importData: boolean; // Import data
  affiliateTracking: boolean; // Advanced affiliate tracking
  seoGeneration: boolean; // SEO content generation
  automationRules: number; // Number of automation rules allowed
}

export interface Plan {
  id: PlanType;
  name: string;
  description: string;
  price: number; // Monthly price in cents
  priceId?: string; // Stripe Price ID
  limits: PlanLimits;
  features: PlanFeatures;
}

/**
 * Available plans configuration
 */
export const PLANS: Record<PlanType, Plan> = {
  free: {
    id: "free",
    name: "Free",
    description: "Perfect for getting started",
    price: 0,
    limits: {
      prompts: 10,
      snippets: 10,
      links: 20,
      guides: 5,
      storageMB: 10,
      apiCallsPerMonth: 100,
    },
    features: {
      aiTools: false,
      advancedAnalytics: false,
      apiAccess: false,
      customBranding: false,
      prioritySupport: false,
      exportData: true,
      importData: true,
      affiliateTracking: false,
      seoGeneration: false,
      automationRules: 0,
    },
  },
  pro: {
    id: "pro",
    name: "Pro",
    description: "For power users and professionals",
    price: 999, // $9.99/month
    limits: {
      prompts: 100,
      snippets: 100,
      links: 500,
      guides: 50,
      storageMB: 1000,
      apiCallsPerMonth: 10000,
    },
    features: {
      aiTools: true,
      advancedAnalytics: true,
      apiAccess: true,
      customBranding: false,
      prioritySupport: false,
      exportData: true,
      importData: true,
      affiliateTracking: true,
      seoGeneration: true,
      automationRules: 10,
    },
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    description: "For teams and businesses",
    price: 4999, // $49.99/month
    limits: {
      prompts: -1, // Unlimited
      snippets: -1, // Unlimited
      links: -1, // Unlimited
      guides: -1, // Unlimited
      storageMB: 10000,
      apiCallsPerMonth: 100000,
    },
    features: {
      aiTools: true,
      advancedAnalytics: true,
      apiAccess: true,
      customBranding: true,
      prioritySupport: true,
      exportData: true,
      importData: true,
      affiliateTracking: true,
      seoGeneration: true,
      automationRules: -1, // Unlimited
    },
  },
};

/**
 * Get plan configuration by ID
 */
export function getPlan(planId: PlanType | string): Plan | undefined {
  return PLANS[planId as PlanType];
}

/**
 * Check if a plan has a specific feature
 */
export function hasFeature(planId: PlanType | string, feature: keyof PlanFeatures): boolean {
  const plan = getPlan(planId);
  if (!plan) {
    return false;
  }
  return plan.features[feature] === true;
}

/**
 * Check if a value is within plan limits
 * Returns true if unlimited (-1) or within limit
 */
export function isWithinLimit(
  planId: PlanType | string,
  limitType: keyof PlanLimits,
  currentValue: number
): boolean {
  const plan = getPlan(planId);
  if (!plan) {
    return false;
  }
  const limit = plan.limits[limitType];
  if (limit === -1) {
    return true; // Unlimited
  }
  return currentValue < limit;
}

/**
 * Get remaining limit for a plan
 * Returns -1 if unlimited, or remaining count
 */
export function getRemainingLimit(
  planId: PlanType | string,
  limitType: keyof PlanLimits,
  currentValue: number
): number {
  const plan = getPlan(planId);
  if (!plan) {
    return 0;
  }
  const limit = plan.limits[limitType];
  if (limit === -1) {
    return -1; // Unlimited
  }
  return Math.max(0, limit - currentValue);
}

/**
 * Check if plan upgrade is available
 */
export function canUpgrade(fromPlan: PlanType, toPlan: PlanType): boolean {
  const planOrder: PlanType[] = ["free", "pro", "enterprise"];
  const fromIndex = planOrder.indexOf(fromPlan);
  const toIndex = planOrder.indexOf(toPlan);
  return toIndex > fromIndex;
}

/**
 * Get all available plans
 */
export function getAllPlans(): Plan[] {
  return Object.values(PLANS);
}

/**
 * Get plan limits summary
 */
export function getPlanLimitsSummary(planId: PlanType | string): {
  limits: PlanLimits;
  features: PlanFeatures;
} | null {
  const plan = getPlan(planId);
  if (!plan) {
    return null;
  }
  return {
    limits: plan.limits,
    features: plan.features,
  };
}


