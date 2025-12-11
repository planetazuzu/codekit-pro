/**
 * Prompts hooks - Refactored to use useResourceCRUD
 * This eliminates code duplication and ensures consistency
 */

import { useResourceCRUD } from "./api/use-resource";
import type { Prompt, InsertPrompt, UpdatePrompt } from "@shared/schema";

// Re-export types for convenience
export type { Prompt, InsertPrompt as CreatePrompt, UpdatePrompt };

// Create CRUD hooks using the generic resource hook
const promptsCRUD = useResourceCRUD<Prompt, InsertPrompt, UpdatePrompt>({
  basePath: "/api/prompts",
  queryKey: "prompts",
});

// Export individual hooks for backward compatibility
export const usePrompts = promptsCRUD.useList;
export const usePrompt = promptsCRUD.useItem;
export const useCreatePrompt = promptsCRUD.useCreate;
export const useUpdatePrompt = promptsCRUD.useUpdate;
export const useDeletePrompt = promptsCRUD.useDelete;

