/**
 * Barrel export for shared types and schemas
 * This is the single source of truth for all types used across frontend and backend
 */

// Export shared type definitions
export type {
  AffiliateProgramStatus,
  AffiliateProgramPriority,
  AffiliateProgramIntegrationType,
} from "./types";

export {
  isAffiliateProgramStatus,
  isAffiliateProgramPriority,
  isAffiliateProgramIntegrationType,
} from "./types";

// Export all types from schema
export type {
  User,
  InsertUser,
  Prompt,
  InsertPrompt,
  UpdatePrompt,
  Snippet,
  InsertSnippet,
  UpdateSnippet,
  Link,
  InsertLink,
  UpdateLink,
  Guide,
  InsertGuide,
  UpdateGuide,
  View,
  InsertView,
  Affiliate,
  InsertAffiliate,
  UpdateAffiliate,
  AffiliateClick,
  InsertAffiliateClick,
  AffiliateProgram,
  InsertAffiliateProgram,
  UpdateAffiliateProgram,
} from "./schema";

// Export all schemas
export {
  users,
  insertUserSchema,
  prompts,
  insertPromptSchema,
  updatePromptSchema,
  snippets,
  insertSnippetSchema,
  updateSnippetSchema,
  links,
  insertLinkSchema,
  updateLinkSchema,
  guides,
  insertGuideSchema,
  updateGuideSchema,
  views,
  insertViewSchema,
  affiliates,
  insertAffiliateSchema,
  updateAffiliateSchema,
  affiliateClicks,
  insertAffiliateClickSchema,
  affiliatePrograms,
  insertAffiliateProgramSchema,
  updateAffiliateProgramSchema,
} from "./schema";

