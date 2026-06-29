// ============================================================
// Auth Store - Zustand State Management
// ============================================================

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AuthUser, User, UserMembership } from '@/types';
import { apiClient, API_ENDPOINTS } from '@/lib/api';

interface AuthState {
  // State
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateProfile: (data: Partial<AuthUser['profile']>) => Promise<void>;
  setUser: (user: AuthUser | null) => void;
  clearError: () => void;

  // Token Management
  setTokens: (token: string, refreshToken?: string) => void;
  clearTokens: () => void;
}

interface RegisterData {
  email: string;
  phone: string;
  password: string;
  firstName: string;
  lastName: string;
  gender: 'male' | 'female' | 'other';
  dateOfBirth: string;
  religion: string;
  role?: 'free_member' | 'paid_member';
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial State
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Login
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await apiClient.post<{
            user: AuthUser;
            token: string;
            refreshToken?: string;
          }>(API_ENDPOINTS.auth.login, { email, password });

          const { user, token, refreshToken } = response.data!;
          
          apiClient.setAuthToken(token, refreshToken);
          set({
            user,
            isAuthenticated: true,
            isLoading: false
          });
        } catch (error: unknown) {
          const errorMessage = (error as { message?: string })?.message || 'Login failed';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      // Register
      register: async (data: RegisterData) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await apiClient.post<{
            user: AuthUser;
            token: string;
            refreshToken?: string;
          }>(API_ENDPOINTS.auth.register, data);

          const { user, token, refreshToken } = response.data!;
          
          apiClient.setAuthToken(token, refreshToken);
          set({
            user,
            isAuthenticated: true,
            isLoading: false
          });
        } catch (error: unknown) {
          const errorMessage = (error as { message?: string })?.message || 'Registration failed';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      // Logout
      logout: async () => {
        set({ isLoading: true });
        
        try {
          await apiClient.post(API_ENDPOINTS.auth.logout);
        } catch {
          // Continue with logout even if API call fails
        } finally {
          apiClient.setAuthToken('');
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false
          });
        }
      },

      // Refresh User Data
      refreshUser: async () => {
        try {
          const response = await apiClient.get<AuthUser>(API_ENDPOINTS.users.me);
          set({ user: response.data });
        } catch {
          get().clearTokens();
          set({
            user: null,
            isAuthenticated: false
          });
        }
      },

      // Update Profile
      updateProfile: async (data: Partial<AuthUser['profile']>) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await apiClient.patch<AuthUser['profile']>(
            API_ENDPOINTS.users.updateProfile,
            data
          );
          
          const currentUser = get().user;
          if (currentUser) {
            set({
              user: {
                ...currentUser,
                profile: response.data
              },
              isLoading: false
            });
          }
        } catch (error: unknown) {
          const errorMessage = (error as { message?: string })?.message || 'Profile update failed';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      // Set User Directly
      setUser: (user: AuthUser | null) => {
        set({
          user,
          isAuthenticated: !!user
        });
      },

      // Clear Error
      clearError: () => {
        set({ error: null });
      },

      // Token Management
      setTokens: (token: string, refreshToken?: string) => {
        apiClient.setAuthToken(token, refreshToken);
      },

      clearTokens: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('refresh_token');
        }
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user
      })
    }
  )
);

// Selector hooks for optimized re-renders
export const useAuth = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
export const useAuthError = () => useAuthStore((state) => state.error);

// Permission helpers
export const useHasPermission = (permission: string) => {
  const user = useAuthStore((state) => state.user);
  return user?.role === 'super_admin' || user?.role === 'centre_admin';
};

export const useIsAdmin = () => {
  const user = useAuthStore((state) => state.user);
  return ['super_admin', 'centre_admin', 'centre_staff'].includes(user?.role || '');
};

export const useIsPremium = () => {
  const user = useAuthStore((state) => state.user);
  return user?.membership?.status === 'active';
};
