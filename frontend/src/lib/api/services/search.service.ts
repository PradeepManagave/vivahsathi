import { apiClient, API_ENDPOINTS } from '@/lib/api/client';
import { Profile, PaginationMeta } from '@/types';

export interface SearchFilters {
  gender?: string;
  ageMin?: number;
  ageMax?: number;
  religion?: string;
  caste?: string;
  motherTongue?: string;
  education?: string;
  occupation?: string;
  incomeMin?: number;
  incomeMax?: number;
  heightMin?: number;
  heightMax?: number;
  maritalStatus?: string;
  diet?: string;
  manglik?: string;
  city?: string;
  state?: string;
  country?: string;
  kycVerified?: boolean;
  withPhoto?: boolean;
  sortBy?: 'recent' | 'compatibility' | 'age' | 'height';
  page?: number;
  limit?: number;
}

export interface SearchResult {
  data: Profile[];
  meta: PaginationMeta;
  suggestions?: string[];
}

export class SearchService {
  async searchProfiles(filters: SearchFilters): Promise<SearchResult> {
    const response = await apiClient.post<SearchResult>(
      API_ENDPOINTS.profiles.search,
      filters
    );
    return response.data as SearchResult;
  }

  async quickSearch(query: string, filters?: Partial<SearchFilters>): Promise<SearchResult> {
    const response = await apiClient.get<SearchResult>(API_ENDPOINTS.profiles.search, {
      q: query, ...filters
    });
    return response.data as SearchResult;
  }

  async getSearchSuggestions(query: string): Promise<string[]> {
    const response = await apiClient.get<{ suggestions: string[] }>(
      API_ENDPOINTS.profiles.search,
      { q: query, suggestions: true }
    );
    return (response.data as { suggestions: string[] }).suggestions;
  }

  async saveSearch(filters: SearchFilters): Promise<{ id: string }> {
    const response = await apiClient.post<{ id: string }>(
      API_ENDPOINTS.profiles.search,
      { filters, save: true }
    );
    return response.data as { id: string };
  }

  async getSavedSearches(): Promise<Array<{ id: string; name: string; filters: SearchFilters; createdAt: string }>> {
    const response = await apiClient.get<Array<{ id: string; name: string; filters: SearchFilters; createdAt: string }>>(
      API_ENDPOINTS.profiles.search,
      { saved: true }
    );
    return response.data as Array<{ id: string; name: string; filters: SearchFilters; createdAt: string }>;
  }

  async deleteSavedSearch(id: string): Promise<void> {
    await apiClient.delete(`${API_ENDPOINTS.profiles.search}/${id}`);
  }
}

export const searchService = new SearchService();
