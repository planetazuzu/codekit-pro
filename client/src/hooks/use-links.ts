/**
 * Links hooks - Refactored to use useResourceCRUD
 * This eliminates code duplication and ensures consistency
 */

import { useResourceCRUD } from "./api/use-resource";
import type { Link, InsertLink, UpdateLink } from "@shared/schema";

// Re-export types for convenience
export type { Link, InsertLink as CreateLink, UpdateLink };

// Create CRUD hooks using the generic resource hook
const linksCRUD = useResourceCRUD<Link, InsertLink, UpdateLink>({
  basePath: "/api/links",
  queryKey: "links",
});

// Export individual hooks for backward compatibility
export const useLinks = linksCRUD.useList;
export const useLink = linksCRUD.useItem;
export const useCreateLink = linksCRUD.useCreate;
export const useUpdateLink = linksCRUD.useUpdate;
export const useDeleteLink = linksCRUD.useDelete;

