/**
 * Guides hooks - Refactored to use useResourceCRUD
 * This eliminates code duplication and ensures consistency
 */

import { useResourceCRUD } from "./api/use-resource";
import type { Guide, InsertGuide, UpdateGuide } from "@shared/schema";

// Re-export types for convenience
export type { Guide, InsertGuide as CreateGuide, UpdateGuide };

// Create CRUD hooks using the generic resource hook
const guidesCRUD = useResourceCRUD<Guide, InsertGuide, UpdateGuide>({
  basePath: "/api/guides",
  queryKey: "guides",
});

// Export individual hooks for backward compatibility
export const useGuides = guidesCRUD.useList;
export const useGuide = guidesCRUD.useItem;
export const useCreateGuide = guidesCRUD.useCreate;
export const useUpdateGuide = guidesCRUD.useUpdate;
export const useDeleteGuide = guidesCRUD.useDelete;

