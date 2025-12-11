/**
 * Generic filter hook for filtering and sorting data
 */

import { useState, useMemo, useCallback } from "react";

export type SortOrder = "asc" | "desc";

export interface FilterOptions<T> {
  /** Search term for text search */
  searchTerm?: string;
  /** Function to extract searchable text from item */
  getSearchableText?: (item: T) => string;
  /** Selected category filter */
  selectedCategory?: string | null;
  /** Function to get category from item */
  getCategory?: (item: T) => string;
  /** Selected tag filter */
  selectedTag?: string | null;
  /** Function to get tags from item */
  getTags?: (item: T) => string[];
  /** Selected language filter (for snippets) */
  selectedLanguage?: string | null;
  /** Function to get language from item */
  getLanguage?: (item: T) => string;
  /** Custom filter function */
  customFilter?: (item: T) => boolean;
}

export interface SortOptions<T> {
  /** Sort field */
  sortBy: string;
  /** Sort order */
  sortOrder: SortOrder;
  /** Function to get sort value from item */
  getSortValue?: (item: T, field: string) => number | string | Date;
}

export interface UseFilterResult<T> {
  /** Filtered and sorted data */
  filteredData: T[];
  /** Current search term */
  searchTerm: string;
  /** Set search term */
  setSearchTerm: (term: string) => void;
  /** Current selected category */
  selectedCategory: string | null;
  /** Set selected category */
  setSelectedCategory: (category: string | null) => void;
  /** Current selected tag */
  selectedTag: string | null;
  /** Set selected tag */
  setSelectedTag: (tag: string | null) => void;
  /** Current selected language */
  selectedLanguage: string | null;
  /** Set selected language */
  setSelectedLanguage: (language: string | null) => void;
  /** Current sort field */
  sortBy: string;
  /** Set sort field */
  setSortBy: (field: string) => void;
  /** Current sort order */
  sortOrder: SortOrder;
  /** Set sort order */
  setSortOrder: (order: SortOrder) => void;
  /** Toggle sort order */
  toggleSortOrder: () => void;
  /** Reset all filters */
  resetFilters: () => void;
  /** Count of filtered items */
  filteredCount: number;
  /** Count of total items */
  totalCount: number;
}

/**
 * Generic hook for filtering and sorting data
 */
export function useFilter<T>(
  data: T[],
  options: FilterOptions<T> & SortOptions<T> = {}
): UseFilterResult<T> {
  const {
    searchTerm: initialSearchTerm = "",
    getSearchableText,
    selectedCategory: initialCategory = null,
    getCategory,
    selectedTag: initialTag = null,
    getTags,
    selectedLanguage: initialLanguage = null,
    getLanguage,
    customFilter,
    sortBy: initialSortBy = "date",
    sortOrder: initialSortOrder = "desc",
    getSortValue,
  } = options;

  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory);
  const [selectedTag, setSelectedTag] = useState<string | null>(initialTag);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(initialLanguage);
  const [sortBy, setSortBy] = useState(initialSortBy);
  const [sortOrder, setSortOrder] = useState<SortOrder>(initialSortOrder);

  const toggleSortOrder = useCallback(() => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  }, []);

  const resetFilters = useCallback(() => {
    setSearchTerm("");
    setSelectedCategory(null);
    setSelectedTag(null);
    setSelectedLanguage(null);
    setSortBy(initialSortBy);
    setSortOrder(initialSortOrder);
  }, [initialSortBy, initialSortOrder]);

  const filteredData = useMemo(() => {
    let filtered = [...data];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((item) => {
        if (getSearchableText) {
          return getSearchableText(item).toLowerCase().includes(term);
        }
        // Default: try to search in common fields
        const itemStr = JSON.stringify(item).toLowerCase();
        return itemStr.includes(term);
      });
    }

    // Apply category filter
    if (selectedCategory && getCategory) {
      filtered = filtered.filter((item) => getCategory(item) === selectedCategory);
    }

    // Apply tag filter
    if (selectedTag && getTags) {
      filtered = filtered.filter((item) => {
        const tags = getTags(item);
        return tags?.includes(selectedTag);
      });
    }

    // Apply language filter
    if (selectedLanguage && getLanguage) {
      filtered = filtered.filter((item) => getLanguage(item) === selectedLanguage);
    }

    // Apply custom filter
    if (customFilter) {
      filtered = filtered.filter(customFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: number | string | Date;
      let bValue: number | string | Date;

      if (getSortValue) {
        aValue = getSortValue(a, sortBy);
        bValue = getSortValue(b, sortBy);
      } else {
        // Default sorting logic
        const aItem = a as Record<string, unknown>;
        const bItem = b as Record<string, unknown>;
        
        if (sortBy === "date" || sortBy === "createdAt" || sortBy === "updatedAt") {
          aValue = aItem[sortBy] ? new Date(aItem[sortBy] as string).getTime() : 0;
          bValue = bItem[sortBy] ? new Date(bItem[sortBy] as string).getTime() : 0;
        } else {
          aValue = String(aItem[sortBy] || "");
          bValue = String(bItem[sortBy] || "");
        }
      }

      // Compare values
      let comparison = 0;
      if (typeof aValue === "number" && typeof bValue === "number") {
        comparison = aValue - bValue;
      } else if (aValue instanceof Date && bValue instanceof Date) {
        comparison = aValue.getTime() - bValue.getTime();
      } else {
        comparison = String(aValue).localeCompare(String(bValue));
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [
    data,
    searchTerm,
    selectedCategory,
    selectedTag,
    selectedLanguage,
    sortBy,
    sortOrder,
    getSearchableText,
    getCategory,
    getTags,
    getLanguage,
    customFilter,
    getSortValue,
  ]);

  return {
    filteredData,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    selectedTag,
    setSelectedTag,
    selectedLanguage,
    setSelectedLanguage,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    toggleSortOrder,
    resetFilters,
    filteredCount: filteredData.length,
    totalCount: data.length,
  };
}

