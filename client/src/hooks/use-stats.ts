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
        // Add timeout to prevent hanging
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        try {
          const response = await get<Stats>("/api/stats");
          clearTimeout(timeoutId);
          return response.data || DEFAULT_STATS;
        } catch (fetchError) {
          clearTimeout(timeoutId);
          
          // If aborted, it's a timeout
          if (fetchError instanceof Error && fetchError.name === "AbortError") {
            console.warn("Stats fetch timed out, using defaults");
            return DEFAULT_STATS;
          }
          
          throw fetchError;
        }
      } catch (error) {
        // Si falla, devolver valores por defecto en lugar de lanzar error
        console.warn("Error fetching stats, using defaults:", error);
        return DEFAULT_STATS;
      }
    },
    staleTime: 30000, // Cache for 30 seconds
    refetchOnWindowFocus: false,
    retry: 1, // Solo reintentar una vez
    retryDelay: 1000, // Esperar 1 segundo antes de reintentar
    // No bloquear render si falla - CRITICAL for mobile
    throwOnError: false,
    // Always return default stats, even if query fails
    placeholderData: DEFAULT_STATS,
  });
}

