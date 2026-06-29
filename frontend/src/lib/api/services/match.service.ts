import { apiClient, API_ENDPOINTS } from '@/lib/api/client';
import { Profile, PaginationMeta } from '@/types';

export interface MatchResult {
  data: (Profile & { compatibilityScore: number; matchReasons: string[] })[];
  meta: PaginationMeta;
}

export class MatchService {
  async getDailyMatches(page = 1, limit = 20): Promise<MatchResult> {
    const response = await apiClient.get<MatchResult>(API_ENDPOINTS.matches.daily, {
      page, limit,
    });
    return response.data as MatchResult;
  }

  async getRecommended(page = 1, limit = 20): Promise<MatchResult> {
    const response = await apiClient.get<MatchResult>(API_ENDPOINTS.matches.recommendations, {
      page, limit,
    });
    return response.data as MatchResult;
  }

  async refreshMatches(): Promise<number> {
    const response = await apiClient.post<{ count: number }>(
      API_ENDPOINTS.matches.daily,
      { refresh: true }
    );
    return (response.data as { count: number }).count;
  }

  async getCompatibility(profileId: string): Promise<{ score: number; breakdown: Record<string, number>; reasons: string[] }> {
    const response = await apiClient.get<{ score: number; breakdown: Record<string, number>; reasons: string[] }>(
      API_ENDPOINTS.matches.compatibility(profileId)
    );
    return response.data as { score: number; breakdown: Record<string, number>; reasons: string[] };
  }
}

export const matchService = new MatchService();
