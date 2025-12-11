/**
 * Shared constants for the application
 * Centralizes magic strings and configuration values
 */

// User IDs
export const USER_IDS = {
  SYSTEM: "system",
} as const;

// Content status values
export const CONTENT_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
} as const;

export type ContentStatus = typeof CONTENT_STATUS[keyof typeof CONTENT_STATUS];

// User plans
export const USER_PLANS = {
  FREE: "free",
  PRO: "pro",
  ENTERPRISE: "enterprise",
} as const;

export type UserPlan = typeof USER_PLANS[keyof typeof USER_PLANS];

// Content types for moderation
export const CONTENT_TYPES = {
  PROMPT: "prompt",
  SNIPPET: "snippet",
  LINK: "link",
  GUIDE: "guide",
} as const;

export type ContentType = typeof CONTENT_TYPES[keyof typeof CONTENT_TYPES];


