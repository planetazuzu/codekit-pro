/**
 * Stats hook - Lightweight hook for dashboard statistics
 * Uses /api/stats endpoint that returns only counts (not full data)
 * 
 * CRITICAL: This hook never throws errors - always returns default values
 * to prevent blocking the dashboard render
 */

import { useQuery } from "@tanstack/react-query";
import { get } from "@/services/api";

export interface Stats {
  prompts: number;
  snippets: number;
  links: number;
  guides: number;
}

const DEFAULT_STATS: Stats = {
  prompts: 0,
  snippets: 0,
  links: 0,
  guides: 0,
};

export function useStats() {
  return useQuery<Stats>({
    queryKey: ["/api/stats"],
    queryFn: async () => {
      try {
        // Use Promise.race to implement timeout since get() doesn't accept AbortSignal
        const statsPromise = get<Stats>("/api/stats").then(response => response.data || DEFAULT_STATS);
        
        const timeoutPromise = new Promise<Stats>((_, reject) => {
          setTimeout(() => reject(new Error("Stats fetch timeout")), 5000); // 5 second timeout (shorter for mobile)
        });

        return await Promise.race([statsPromise, timeoutPromise]);
      } catch (error) {
        // Si falla o timeout, devolver valores por defecto en lugar de lanzar error
        console.warn("Error fetching stats, using defaults:", error);
        return DEFAULT_STATS;
      }
    },
    staleTime: 30000, // Cache for 30 seconds
    refetchOnWindowFocus: false,
    retry: false, // No retry - if it fails, use defaults
    // No bloquear render si falla - CRITICAL for mobile
    throwOnError: false,
    // Always return default stats immediately, even if query is pending or fails
    placeholderData: DEFAULT_STATS,
    // Use initialData to ensure immediate render
    initialData: DEFAULT_STATS,
    // Don't refetch on mount if we have cached data
    refetchOnMount: "always", // But still try to fetch fresh data
  });
}

