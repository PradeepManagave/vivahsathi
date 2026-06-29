'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { apiClient, API_ENDPOINTS } from '@/lib/api';
import { ProfileCardProps } from '@/components/profile/profile-card';

export interface SearchFilters {
  ageMin?: number;
  ageMax?: number;
  gender?: string;
  religion?: string;
  caste?: string;
  motherTongue?: string;
  country?: string;
  state?: string;
  city?: string;
  education?: string;
  profession?: string;
  income?: string;
  heightMin?: string;
  heightMax?: string;
  maritalStatus?: string;
  hasPhoto?: boolean;
  isVerified?: boolean;
  isPremium?: boolean;
}

export interface SearchState {
  results: ProfileCardProps[];
  loading: boolean;
  error: string | null;
  totalResults: number;
  currentPage: number;
  totalPages: number;
  filters: SearchFilters;
  sortBy: string;
}

interface UseSearchReturn extends SearchState {
  setFilter: <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => void;
  resetFilters: () => void;
  search: (page?: number) => Promise<void>;
  setPage: (page: number) => void;
  setSortBy: (sortBy: string) => void;
  clearResults: () => void;
}

const DEFAULT_FILTERS: SearchFilters = {
  ageMin: 18,
  ageMax: 60,
  hasPhoto: true
};

export function useSearch(initialFilters?: SearchFilters): UseSearchReturn {
  const [state, setState] = useState<SearchState>({
    results: [],
    loading: false,
    error: null,
    totalResults: 0,
    currentPage: 1,
    totalPages: 1,
    filters: { ...DEFAULT_FILTERS, ...initialFilters },
    sortBy: 'relevance'
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const search = useCallback(async (page = 1) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      setState((prev) => ({ ...prev, loading: true, error: null, currentPage: page }));

      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('sort', state.sortBy);

      Object.entries(state.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.set(key, value.toString());
        }
      });

      const response = await apiClient.get(`${API_ENDPOINTS.profiles.search}?${params.toString()}`, {
        signal: abortController.signal
      });

      const result = response.data as { data?: { profiles: ProfileCardProps[]; pagination: { total: number; totalPages: number; page: number } } };
      if (result?.data) {
        const { profiles, pagination } = result.data;
        setState((prev) => ({
          ...prev,
          results: profiles || [],
          totalResults: pagination?.total || 0,
          totalPages: pagination?.totalPages || 1,
          loading: false
        }));
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Search failed',
        loading: false
      }));
    }
  }, [state.filters, state.sortBy]);

  const setFilter = useCallback(<K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => {
    setState((prev) => ({
      ...prev,
      filters: { ...prev.filters, [key]: value }
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setState((prev) => ({
      ...prev,
      filters: { ...DEFAULT_FILTERS }
    }));
  }, []);

  const setPage = useCallback((page: number) => {
    setState((prev) => ({ ...prev, currentPage: page }));
    search(page);
  }, [search]);

  const setSortBy = useCallback((sortBy: string) => {
    setState((prev) => ({ ...prev, sortBy }));
    search(1);
  }, [search]);

  const clearResults = useCallback(() => {
    setState((prev) => ({
      ...prev,
      results: [],
      totalResults: 0,
      totalPages: 1
    }));
  }, []);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  return {
    ...state,
    setFilter,
    resetFilters,
    search,
    setPage,
    setSortBy,
    clearResults
  };
}
