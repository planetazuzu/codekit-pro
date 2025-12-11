/**
 * Centralized validation service using Zod schemas
 */

import { z } from "zod";
import { ValidationError } from "./error.service";
import {
  insertUserSchema,
  updateUserSchema,
  insertPromptSchema,
  updatePromptSchema,
  insertSnippetSchema,
  updateSnippetSchema,
  insertLinkSchema,
  updateLinkSchema,
  insertGuideSchema,
  updateGuideSchema,
  insertAffiliateSchema,
  updateAffiliateSchema,
  insertAffiliateProgramSchema,
  updateAffiliateProgramSchema,
} from "@shared/schema";

/**
 * Validate data against schema
 */
export function validate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): T {
  const result = schema.safeParse(data);

  if (!result.success) {
    const errors: Record<string, string[]> = {};
    
    result.error.errors.forEach((error) => {
      const path = error.path.join(".");
      if (!errors[path]) {
        errors[path] = [];
      }
      errors[path].push(error.message);
    });

    throw new ValidationError("Validation failed", undefined, errors);
  }

  return result.data;
}

/**
 * Validate user data
 */
export function validateUser(data: unknown) {
  return validate(insertUserSchema, data);
}

/**
 * Validate user update data
 */
export function validateUserUpdate(data: unknown) {
  return validate(updateUserSchema, data);
}

/**
 * Validate prompt data
 */
export function validatePrompt(data: unknown) {
  return validate(insertPromptSchema, data);
}

/**
 * Validate prompt update data
 */
export function validatePromptUpdate(data: unknown) {
  return validate(updatePromptSchema, data);
}

/**
 * Validate snippet data
 */
export function validateSnippet(data: unknown) {
  return validate(insertSnippetSchema, data);
}

/**
 * Validate snippet update data
 */
export function validateSnippetUpdate(data: unknown) {
  return validate(updateSnippetSchema, data);
}

/**
 * Validate link data
 */
export function validateLink(data: unknown) {
  return validate(insertLinkSchema, data);
}

/**
 * Validate link update data
 */
export function validateLinkUpdate(data: unknown) {
  return validate(updateLinkSchema, data);
}

/**
 * Validate guide data
 */
export function validateGuide(data: unknown) {
  return validate(insertGuideSchema, data);
}

/**
 * Validate guide update data
 */
export function validateGuideUpdate(data: unknown) {
  return validate(updateGuideSchema, data);
}

/**
 * Validate affiliate data
 */
export function validateAffiliate(data: unknown) {
  return validate(insertAffiliateSchema, data);
}

/**
 * Validate affiliate update data
 */
export function validateAffiliateUpdate(data: unknown) {
  return validate(updateAffiliateSchema, data);
}

/**
 * Validate affiliate program data
 */
export function validateAffiliateProgram(data: unknown) {
  return validate(insertAffiliateProgramSchema, data);
}

/**
 * Validate affiliate program update data
 */
export function validateAffiliateProgramUpdate(data: unknown) {
  return validate(updateAffiliateProgramSchema, data);
}

