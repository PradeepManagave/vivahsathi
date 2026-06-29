import { create } from 'zustand';
import { apiClient } from '@/lib/api/client';

interface SearchFilters {
  gender?: string; ageFrom?: number; ageTo?: number; religion?: string;
  caste?: string; education?: string; occupation?: string; city?: string;
  state?: string; maritalStatus?: string; manglik?: string;
  page?: number; limit?: number;
}

interface SearchResult {
  id: string; name: string; age: number; photo?: string;
  location: string; profession?: string; education?: string;
  religion?: string; isVerified?: boolean; matchScore?: number;
}

interface SavedSearch {
  id: string; name: string; filters: SearchFilters; resultCount?: number;
  notifyOnNew?: boolean; createdAt: string;
}

interface SearchState {
  results: SearchResult[];
  total: number;
  filters: SearchFilters;
  savedSearches: SavedSearch[];
  loading: boolean;
  suggestions: string[];
  error: string | null;

  search: (filters?: SearchFilters) => Promise<void>;
  setFilters: (filters: Partial<SearchFilters>) => void;
  clearFilters: () => void;
  getSuggestions: (query: string) => Promise<void>;
  saveSearch: (name: string) => Promise<void>;
  loadSavedSearches: () => Promise<void>;
  deleteSavedSearch: (id: string) => Promise<void>;
  toggleNotify: (id: string) => Promise<void>;
  clearResults: () => void;
}

const initialFilters: SearchFilters = { page: 1, limit: 20 };

export const useSearchStore = create<SearchState>()((set, get) => ({
  results: [],
  total: 0,
  filters: initialFilters,
  savedSearches: [],
  loading: false,
  suggestions: [],
  error: null,

  search: async (filters) => {
    const merged = { ...get().filters, ...filters };
    set({ loading: true, error: null, filters: merged });
    try {
      const res = await apiClient.get<{ results: SearchResult[]; total: number }>('/search', merged);
      if (res.success && res.data) set({ results: res.data.results || [], total: res.data.total || 0 });
    } catch (e: any) { set({ error: e?.message || 'Search failed' }); }
    finally { set({ loading: false }); }
  },

  setFilters: (filters) => set({ filters: { ...get().filters, ...filters } }),
  clearFilters: () => set({ filters: initialFilters }),

  getSuggestions: async (query) => {
    if (!query || query.length < 2) { set({ suggestions: [] }); return; }
    try {
      const res = await apiClient.get<{ suggestions: string[] }>('/search/suggestions', { q: query });
      if (res.success && res.data) set({ suggestions: res.data.suggestions || [] });
    } catch { set({ suggestions: [] }); }
  },

  saveSearch: async (name) => {
    try {
      await apiClient.post('/search/save', { name, filters: get().filters });
      get().loadSavedSearches();
    } catch (e: any) { set({ error: e?.message || 'Failed to save search' }); }
  },

  loadSavedSearches: async () => {
    try {
      const res = await apiClient.get<{ searches: SavedSearch[] }>('/search/saved');
      if (res.success && res.data) set({ savedSearches: res.data.searches || [] });
    } catch { }
  },

  deleteSavedSearch: async (id) => {
    try { await apiClient.delete(`/search/saved/${id}`); get().loadSavedSearches(); }
    catch (e: any) { set({ error: e?.message || 'Failed to delete' }); }
  },

  toggleNotify: async (id) => {
    try { await apiClient.post(`/search/saved/${id}/toggle-notify`); get().loadSavedSearches(); }
    catch (e: any) { set({ error: e?.message || 'Failed to toggle' }); }
  },

  clearResults: () => set({ results: [], total: 0 }),
}));
