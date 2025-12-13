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
      const response = await get<Stats>("/api/stats");
      return response.data;
    },
    staleTime: 30000, // Cache for 30 seconds
    refetchOnWindowFocus: false,
  });
}

