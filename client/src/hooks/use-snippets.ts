/**
 * Snippets hooks - Refactored to use useResourceCRUD
 * This eliminates code duplication and ensures consistency
 */

import { useResourceCRUD } from "./api/use-resource";
import type { Snippet, InsertSnippet, UpdateSnippet } from "@shared/schema";

// Re-export types for convenience
export type { Snippet, InsertSnippet as CreateSnippet, UpdateSnippet };

// Create CRUD hooks using the generic resource hook
const snippetsCRUD = useResourceCRUD<Snippet, InsertSnippet, UpdateSnippet>({
  basePath: "/api/snippets",
  queryKey: "snippets",
});

// Export individual hooks for backward compatibility
export const useSnippets = snippetsCRUD.useList;
export const useSnippet = snippetsCRUD.useItem;
export const useCreateSnippet = snippetsCRUD.useCreate;
export const useUpdateSnippet = snippetsCRUD.useUpdate;
export const useDeleteSnippet = snippetsCRUD.useDelete;

