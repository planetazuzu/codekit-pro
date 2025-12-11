/**
 * Admin authentication hook
 * Now uses backend authentication instead of frontend-only check
 */

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { post, get } from '@/services/api';

interface LoginResponse {
  authenticated: boolean;
  token?: string;
}

interface AuthStatus {
  authenticated: boolean;
}

export function useAdminAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // Check authentication status from backend
  const { data: authStatus, isLoading: checkingAuth } = useQuery<AuthStatus>({
    queryKey: ['/api/auth/admin/check'],
    queryFn: async () => {
      const response = await get<AuthStatus>('/api/auth/admin/check');
      return response.data;
    },
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (password: string) => {
      const response = await post<LoginResponse>('/api/auth/admin/login', { password });
      return response.data;
    },
    onSuccess: (data) => {
      if (data.authenticated) {
        setIsAuthenticated(true);
      }
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await post('/api/auth/admin/logout', {});
    },
    onSuccess: () => {
      setIsAuthenticated(false);
    },
  });

  // Update local state when auth status changes
  useEffect(() => {
    if (!checkingAuth && authStatus) {
      setIsAuthenticated(authStatus.authenticated);
      setIsChecking(false);
    }
  }, [authStatus, checkingAuth]);

  const login = async (password: string): Promise<boolean> => {
    try {
      const result = await loginMutation.mutateAsync(password);
      return result.authenticated;
    } catch {
      return false;
    }
  };

  const logout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch {
      // Even if logout fails, clear local state
      setIsAuthenticated(false);
    }
  };

  return {
    isAuthenticated,
    isChecking: isChecking || checkingAuth,
    login,
    logout,
    isLoading: loginMutation.isPending || logoutMutation.isPending,
  };
}

