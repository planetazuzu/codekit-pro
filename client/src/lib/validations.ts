/**
 * Re-export validation schemas from shared
 * This ensures frontend and backend use the same validation rules
 */

export {
  insertPromptSchema,
  updatePromptSchema,
  insertSnippetSchema,
  updateSnippetSchema,
  insertLinkSchema,
  updateLinkSchema,
  insertGuideSchema,
  updateGuideSchema,
} from "@shared/schema";

// Additional frontend-specific validations can be added here
import { z } from "zod";

/**
 * URL validation schema
 */
export const urlSchema = z.string().url("Debe ser una URL válida");

/**
 * Email validation schema
 */
export const emailSchema = z.string().email("Debe ser un email válido");

