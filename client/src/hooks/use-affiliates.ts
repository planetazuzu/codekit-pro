/**
 * Hooks for managing affiliates
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post, put, del } from "@/services/api";
import type { Affiliate, InsertAffiliate, UpdateAffiliate } from "@shared/schema";

// Re-export types for convenience
export type { Affiliate, InsertAffiliate as CreateAffiliate, UpdateAffiliate };

export function useAffiliates() {
  return useQuery<Affiliate[]>({
    queryKey: ["/api/affiliates"],
    queryFn: async () => {
      const response = await get<Affiliate[]>("/api/affiliates");
      return response.data;
    },
  });
}

export function useAffiliate(id: string) {
  return useQuery<Affiliate>({
    queryKey: [`/api/affiliates/${id}`],
    enabled: !!id,
    queryFn: async () => {
      const response = await get<Affiliate>(`/api/affiliates/${id}`);
      return response.data;
    },
  });
}

export function useCreateAffiliate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: InsertAffiliate) => {
      const response = await post<Affiliate>("/api/affiliates", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/affiliates"] });
    },
  });
}

export function useUpdateAffiliate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: UpdateAffiliate) => {
      const { id, ...updateData } = data;
      const response = await put<Affiliate>(`/api/affiliates/${id}`, updateData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/affiliates"] });
    },
  });
}

export function useDeleteAffiliate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await del(`/api/affiliates/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/affiliates"] });
    },
  });
}

export function useTrackAffiliateClick() {
  return useMutation({
    mutationFn: async (id: string) => {
      await post(`/api/affiliates/${id}/click`, {});
    },
  });
}

export function useAffiliateStats(id?: string) {
  const affiliateId = id || "all";
  
  return useQuery({
    queryKey: ["/api/affiliates/stats", affiliateId],
    queryFn: async () => {
      const response = await get<{
        totalClicks: number;
        clicksByDay: Array<{ date: string; count: number }>;
      }>(`/api/affiliates/stats/${affiliateId}`);
      return response.data;
    },
  });
}

