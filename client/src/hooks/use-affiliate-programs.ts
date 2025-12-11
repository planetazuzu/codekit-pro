/**
 * Hooks for managing affiliate programs tracker
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post, put, del } from "@/services/api";
import type { AffiliateProgram, InsertAffiliateProgram, UpdateAffiliateProgram } from "@shared/schema";

// Re-export types for convenience
export type { AffiliateProgram, InsertAffiliateProgram as CreateAffiliateProgram, UpdateAffiliateProgram };

interface AffiliateProgramsFilters {
  category?: string;
  status?: string;
  priority?: string;
  search?: string;
}

export function useAffiliatePrograms(filters?: AffiliateProgramsFilters) {
  const queryParams = new URLSearchParams();
  if (filters?.category) queryParams.append("category", filters.category);
  if (filters?.status) queryParams.append("status", filters.status);
  if (filters?.priority) queryParams.append("priority", filters.priority);
  if (filters?.search) queryParams.append("search", filters.search);

  const queryString = queryParams.toString();
  const url = `/api/affiliate-programs${queryString ? `?${queryString}` : ""}`;

  return useQuery<AffiliateProgram[]>({
    queryKey: ["/api/affiliate-programs", filters],
    queryFn: async () => {
      const response = await get<AffiliateProgram[]>(url);
      return response.data;
    },
  });
}

export function useAffiliateProgram(id: string) {
  return useQuery<AffiliateProgram>({
    queryKey: [`/api/affiliate-programs/${id}`],
    enabled: !!id,
    queryFn: async () => {
      const response = await get<AffiliateProgram>(`/api/affiliate-programs/${id}`);
      return response.data;
    },
  });
}

export function useAffiliateProgramsStats() {
  return useQuery({
    queryKey: ["/api/affiliate-programs/stats"],
    queryFn: async () => {
      const response = await get<{
        total: number;
        byStatus: Record<string, number>;
        byPriority: Record<string, number>;
        byCategory: Record<string, number>;
        totalClicks: number;
        totalRevenue: number;
        thisWeekRequests: number;
        thisWeekApprovals: number;
      }>("/api/affiliate-programs/stats");
      return response.data;
    },
  });
}

export function useCreateAffiliateProgram() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: InsertAffiliateProgram) => {
      const response = await post<AffiliateProgram>("/api/affiliate-programs", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/affiliate-programs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/affiliate-programs/stats"] });
    },
  });
}

export function useUpdateAffiliateProgram() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: UpdateAffiliateProgram) => {
      const { id, ...updateData } = data;
      const response = await put<AffiliateProgram>(`/api/affiliate-programs/${id}`, updateData);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/affiliate-programs"] });
      queryClient.invalidateQueries({ queryKey: [`/api/affiliate-programs/${variables.id}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/affiliate-programs/stats"] });
    },
  });
}

export function useDeleteAffiliateProgram() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await del(`/api/affiliate-programs/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/affiliate-programs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/affiliate-programs/stats"] });
    },
  });
}

export function useSyncAffiliateProgram() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await post<{ program: AffiliateProgram; syncResult: any }>(
        `/api/affiliate-programs/${id}/sync`,
        {}
      );
      return response.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["/api/affiliate-programs"] });
      queryClient.invalidateQueries({ queryKey: [`/api/affiliate-programs/${id}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/affiliate-programs/stats"] });
    },
  });
}

export function useSyncAllAffiliatePrograms() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const response = await post<{
        total: number;
        success: number;
        failed: number;
        results: Array<{ programId: string; success: boolean; clicks?: number; revenue?: number; error?: string }>;
      }>("/api/affiliate-programs/sync/all", {});
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/affiliate-programs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/affiliate-programs/stats"] });
    },
  });
}

