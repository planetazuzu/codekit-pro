/**
 * Shared type definitions for affiliate programs
 * These types are used across frontend and backend to ensure type safety
 */

export type AffiliateProgramStatus = 
  | "not_requested" 
  | "pending" 
  | "approved" 
  | "rejected" 
  | "inactive";

export type AffiliateProgramPriority = 
  | "high" 
  | "medium" 
  | "low";

export type AffiliateProgramIntegrationType = 
  | "manual" 
  | "impact" 
  | "partnerstack" 
  | "awin" 
  | "other";

/**
 * Type guard to check if a string is a valid status
 */
export function isAffiliateProgramStatus(
  value: string
): value is AffiliateProgramStatus {
  return [
    "not_requested",
    "pending",
    "approved",
    "rejected",
    "inactive",
  ].includes(value);
}

/**
 * Type guard to check if a string is a valid priority
 */
export function isAffiliateProgramPriority(
  value: string
): value is AffiliateProgramPriority {
  return ["high", "medium", "low"].includes(value);
}

/**
 * Type guard to check if a string is a valid integration type
 */
export function isAffiliateProgramIntegrationType(
  value: string
): value is AffiliateProgramIntegrationType {
  return ["manual", "impact", "partnerstack", "awin", "other"].includes(
    value
  );
}

