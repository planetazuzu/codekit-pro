/**
 * Pagination hook for managing paginated data
 */

import { useState, useMemo } from "react";

export interface UsePaginationOptions {
  /** Initial page number (1-indexed) */
  initialPage?: number;
  /** Items per page */
  pageSize?: number;
  /** Total number of items */
  totalItems?: number;
}

export interface PaginationState {
  /** Current page number (1-indexed) */
  currentPage: number;
  /** Items per page */
  pageSize: number;
  /** Total number of items */
  totalItems: number;
  /** Total number of pages */
  totalPages: number;
  /** Starting index of current page */
  startIndex: number;
  /** Ending index of current page */
  endIndex: number;
  /** Whether there's a next page */
  hasNextPage: boolean;
  /** Whether there's a previous page */
  hasPreviousPage: boolean;
}

export interface PaginationControls {
  /** Go to next page */
  nextPage: () => void;
  /** Go to previous page */
  previousPage: () => void;
  /** Go to specific page */
  goToPage: (page: number) => void;
  /** Set page size */
  setPageSize: (size: number) => void;
  /** Reset to first page */
  reset: () => void;
}

/**
 * Hook for managing pagination state
 */
export function usePagination(options: UsePaginationOptions = {}) {
  const {
    initialPage = 1,
    pageSize: initialPageSize = 10,
    totalItems: initialTotalItems = 0,
  } = options;

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [totalItems, setTotalItems] = useState(initialTotalItems);

  const paginationState = useMemo<PaginationState>(() => {
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const clampedPage = Math.max(1, Math.min(currentPage, totalPages));
    const startIndex = (clampedPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalItems);

    return {
      currentPage: clampedPage,
      pageSize,
      totalItems,
      totalPages,
      startIndex,
      endIndex,
      hasNextPage: clampedPage < totalPages,
      hasPreviousPage: clampedPage > 1,
    };
  }, [currentPage, pageSize, totalItems]);

  const controls: PaginationControls = useMemo(
    () => ({
      nextPage: () => {
        if (paginationState.hasNextPage) {
          setCurrentPage((prev) => prev + 1);
        }
      },
      previousPage: () => {
        if (paginationState.hasPreviousPage) {
          setCurrentPage((prev) => prev - 1);
        }
      },
      goToPage: (page: number) => {
        const validPage = Math.max(1, Math.min(page, paginationState.totalPages));
        setCurrentPage(validPage);
      },
      setPageSize: (size: number) => {
        setPageSize(size);
        setCurrentPage(1); // Reset to first page when changing page size
      },
      reset: () => {
        setCurrentPage(initialPage);
      },
    }),
    [paginationState.hasNextPage, paginationState.hasPreviousPage, paginationState.totalPages, initialPage]
  );

  /**
   * Get paginated slice of data
   */
  const paginate = <T>(data: T[]): T[] => {
    return data.slice(paginationState.startIndex, paginationState.endIndex);
  };

  return {
    ...paginationState,
    ...controls,
    paginate,
    setTotalItems,
  };
}

