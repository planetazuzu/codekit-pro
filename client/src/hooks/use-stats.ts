/**
 * Stats hook - Lightweight hook for dashboard statistics
 * Uses /api/stats endpoint that returns only counts (not full data)
 */

import { useQuery } from "@tanstack/react-query";
import { get } from "@/services/api";

export interface Stats {
  prompts: number;
  snippets: number;
  links: number;
  guides: number;
}

export function useStats() {
  return useQuery<Stats>({
    queryKey: ["/api/stats"],
    queryFn: async () => {
      try {
        const response = await get<Stats>("/api/stats");
        return response.data;
      } catch (error) {
        // Si falla, devolver valores por defecto en lugar de lanzar error
        console.warn("Error fetching stats, using defaults:", error);
        return {
          prompts: 0,
          snippets: 0,
          links: 0,
          guides: 0,
        };
      }
    },
    staleTime: 30000, // Cache for 30 seconds
    refetchOnWindowFocus: false,
    retry: 1, // Solo reintentar una vez
    retryDelay: 1000, // Esperar 1 segundo antes de reintentar
    // No bloquear render si falla
    throwOnError: false,
  });
}

