import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post } from "@/services/api";

export interface AnalyticsStats {
  byPage: Array<{ page: string; count: number }>;
  byEntityType: Array<{ entityType: string; count: number }>;
  byDate: Array<{ date: string; count: number }>;
  topPages: Array<{ page: string; count: number }>;
}

export function useAnalyticsStats(days: number = 30) {
  return useQuery<AnalyticsStats>({
    queryKey: ["analytics", "stats", days],
    queryFn: async () => {
      const response = await get<AnalyticsStats>(`/api/analytics/stats?days=${days}`);
      return response.data;
    },
  });
}

export function useTrackView() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      page: string;
      entityType?: string;
      entityId?: string;
    }) => {
      const response = await post("/api/analytics/view", data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate stats queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}

