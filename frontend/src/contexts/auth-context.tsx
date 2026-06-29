// ============================================================
// Auth Context - React Context for Authentication State
// ============================================================

'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { apiClient, API_ENDPOINTS } from '@/lib/api';
import type { ApiResponse, AuthUser } from '@/types';

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (identifier: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

interface RegisterData {
  phone: string;
  email?: string;
  firstName: string;
  lastName: string;
  gender: 'male' | 'female' | 'other';
  dateOfBirth: string;
  religion: string;
  password: string;
  membershipPlan?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null
  });

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const response = await apiClient.get<AuthUser>(API_ENDPOINTS.users.me);
          setState({
            user: response.data || null,
            isAuthenticated: !!response.data,
            isLoading: false,
            error: null
          });
        } catch {
          // Token invalid, try refresh
          await handleTokenRefresh();
        }
      } else {
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    };

    initAuth();
  }, []);

  // Handle token refresh
  const handleTokenRefresh = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        clearAuth();
        return;
      }

      const response = await apiClient.post<{
        accessToken: string;
        refreshToken: string;
      }>(API_ENDPOINTS.auth.refreshToken, { refreshToken });

      localStorage.setItem('access_token', response.data!.accessToken);
      localStorage.setItem('refresh_token', response.data!.refreshToken);

      // Retry fetching user
      const userResponse = await apiClient.get<AuthUser>(API_ENDPOINTS.users.me);
      setState({
        user: userResponse.data || null,
        isAuthenticated: !!userResponse.data,
        isLoading: false,
        error: null
      });
    } catch {
      clearAuth();
    }
  };

  // Clear auth state
  const clearAuth = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    });
  };

  // Login
  const login = useCallback(async (identifier: string, password: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await apiClient.post<{
        user: AuthUser;
        tokens: { accessToken: string; refreshToken: string };
        requires2fa?: boolean;
        tempToken?: string;
      }>(API_ENDPOINTS.auth.login, { identifier, password });

      if (response.data?.requires2fa) {
        localStorage.setItem('2fa_temp_token', response.data.tempToken || '');
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: '2FA_REQUIRED'
        }));
        router.push('/verify-2fa');
        return;
      }

      localStorage.setItem('access_token', response.data!.tokens.accessToken);
      localStorage.setItem('refresh_token', response.data!.tokens.refreshToken);

      setState({
        user: response.data!.user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });

      router.push('/dashboard');
    } catch (error: unknown) {
      const apiError = (error as { response?: { data?: { error?: { message?: string } } } })
        ?.response?.data?.error?.message || 'Login failed';
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: apiError
      }));
      throw error;
    }
  }, [router]);

  // Register
  const register = useCallback(async (data: RegisterData) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await apiClient.post<{
        user: AuthUser;
        tokens: { accessToken: string; refreshToken: string };
      }>(API_ENDPOINTS.auth.register, data);

      localStorage.setItem('access_token', response.data!.tokens.accessToken);
      localStorage.setItem('refresh_token', response.data!.tokens.refreshToken);

      setState({
        user: response.data!.user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });
    } catch (error: unknown) {
      const apiError = (error as { response?: { data?: { error?: { message?: string } } } })
        ?.response?.data?.error?.message || 'Registration failed';
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: apiError
      }));
      throw error;
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    try {
      await apiClient.post(API_ENDPOINTS.auth.logout);
    } catch {
      // Continue with logout even if API fails
    } finally {
      clearAuth();
      router.push('/');
    }
  }, [router]);

  // Refresh user
  const refreshUser = useCallback(async () => {
    try {
      const response = await apiClient.get<AuthUser>(API_ENDPOINTS.users.me);
      setState((prev) => ({
        ...prev,
        user: response.data || null
      }));
    } catch {
      clearAuth();
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        refreshUser,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Hook for checking if user has required role
export function useHasRole(requiredRoles: string[]) {
  const { user } = useAuth();
  return user ? requiredRoles.includes(user.role) : false;
}

// Hook for protected routes
export function useProtectedRoute(allowedRoles?: string[]) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
        return;
      }

      if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        router.push('/unauthorized');
      }
    }
  }, [isLoading, isAuthenticated, user, router, allowedRoles]);

  return { isLoading, isAuthenticated, user };
}
