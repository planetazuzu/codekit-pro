/**
 * Generic resource hook for CRUD operations
 * Reduces code duplication across use-prompts, use-snippets, use-links, use-guides
 */

import { useQuery, useMutation, useQueryClient, type UseQueryOptions, type UseMutationOptions } from "@tanstack/react-query";
import { get, post, put, del, type ApiResponse } from "@/services/api";

export interface ResourceConfig<T, TInsert, TUpdate> {
  /** Base API path (e.g., "/api/prompts") */
  basePath: string;
  /** Query key prefix (e.g., "prompts") */
  queryKey: string;
}

export interface UseResourceOptions<T> {
  /** Enable/disable the query */
  enabled?: boolean;
  /** Additional query options */
  queryOptions?: Omit<UseQueryOptions<T[]>, "queryKey" | "queryFn">;
}

export interface UseResourceItemOptions<T> {
  /** Resource ID */
  id: string;
  /** Enable/disable the query */
  enabled?: boolean;
  /** Additional query options */
  queryOptions?: Omit<UseQueryOptions<T>, "queryKey" | "queryFn">;
}

/**
 * Generic hook for managing a resource collection
 */
export function useResource<T, TInsert, TUpdate>(
  config: ResourceConfig<T, TInsert, TUpdate>,
  options?: UseResourceOptions<T>
) {
  const { basePath, queryKey } = config;
  const { enabled = true, queryOptions } = options || {};

  const query = useQuery<T[]>({
    queryKey: [basePath],
    queryFn: async () => {
      const response = await get<T[]>(basePath);
      return response.data;
    },
    enabled,
    ...queryOptions,
  });

  return query;
}

/**
 * Generic hook for fetching a single resource item
 */
export function useResourceItem<T, TInsert, TUpdate>(
  config: ResourceConfig<T, TInsert, TUpdate>,
  options: UseResourceItemOptions<T>
) {
  const { basePath, queryKey } = config;
  const { id, enabled = true, queryOptions } = options;

  const query = useQuery<T>({
    queryKey: [`${basePath}/${id}`],
    queryFn: async () => {
      const response = await get<T>(`${basePath}/${id}`);
      return response.data;
    },
    enabled: enabled && !!id,
    ...queryOptions,
  });

  return query;
}

/**
 * Generic hook for creating a resource
 */
export function useCreateResource<T, TInsert, TUpdate>(
  config: ResourceConfig<T, TInsert, TUpdate>,
  options?: Omit<UseMutationOptions<T, Error, TInsert>, "mutationFn">
) {
  const { basePath, queryKey } = config;
  const queryClient = useQueryClient();

  return useMutation<T, Error, TInsert>({
    mutationFn: async (data: TInsert) => {
      const response = await post<T>(basePath, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [basePath] });
    },
    ...options,
  });
}

/**
 * Generic hook for updating a resource
 */
export function useUpdateResource<T, TUpdate>(
  config: ResourceConfig<T, unknown, TUpdate>,
  options?: Omit<UseMutationOptions<T, Error, TUpdate>, "mutationFn">
) {
  const { basePath, queryKey } = config;
  const queryClient = useQueryClient();

  return useMutation<T, Error, TUpdate>({
    mutationFn: async (data: TUpdate & { id: string }) => {
      const { id, ...updateData } = data;
      const response = await put<T>(`${basePath}/${id}`, updateData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [basePath] });
    },
    ...options,
  });
}

/**
 * Generic hook for deleting a resource
 */
export function useDeleteResource<T, TInsert, TUpdate>(
  config: ResourceConfig<T, TInsert, TUpdate>,
  options?: Omit<UseMutationOptions<string, Error, string>, "mutationFn">
) {
  const { basePath, queryKey } = config;
  const queryClient = useQueryClient();

  return useMutation<string, Error, string>({
    mutationFn: async (id: string) => {
      await del(`${basePath}/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [basePath] });
    },
    ...options,
  });
}

/**
 * Complete resource hook combining all CRUD operations
 */
export function useResourceCRUD<T, TInsert, TUpdate>(
  config: ResourceConfig<T, TInsert, TUpdate>
) {
  return {
    useList: (options?: UseResourceOptions<T>) => useResource<T, TInsert, TUpdate>(config, options),
    useItem: (options: UseResourceItemOptions<T>) => useResourceItem<T, TInsert, TUpdate>(config, options),
    useCreate: (options?: Omit<UseMutationOptions<T, Error, TInsert>, "mutationFn">) =>
      useCreateResource<T, TInsert, TUpdate>(config, options),
    useUpdate: (options?: Omit<UseMutationOptions<T, Error, TUpdate>, "mutationFn">) =>
      useUpdateResource<T, TUpdate>(config, options),
    useDelete: (options?: Omit<UseMutationOptions<string, Error, string>, "mutationFn">) =>
      useDeleteResource<T, TInsert, TUpdate>(config, options),
  };
}

