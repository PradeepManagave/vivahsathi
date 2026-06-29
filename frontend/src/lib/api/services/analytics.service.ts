import { apiClient, API_ENDPOINTS } from '@/lib/api/client';

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  totalMemberships: number;
  activeMemberships: number;
  revenueToday: number;
  revenueThisMonth: number;
  totalRevenue: number;
  totalVendors: number;
  totalClassifieds: number;
  pendingKyc: number;
  successStories: number;
}

export interface RevenueReportItem {
  period: string;
  amount: number;
  count: number;
}

export interface ActivityReportItem {
  date: string;
  registrations: number;
  logins: number;
  profileUpdates: number;
  searches: number;
  messagesSent: number;
  matches: number;
}

export class AnalyticsService {
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await apiClient.get<DashboardStats>(API_ENDPOINTS.analytics.dashboard);
    return response.data as DashboardStats;
  }

  async getRevenueReport(params?: { period?: string; from?: string; to?: string }): Promise<RevenueReportItem[]> {
    const response = await apiClient.get<RevenueReportItem[]>(API_ENDPOINTS.analytics.revenue, params);
    return response.data as RevenueReportItem[];
  }

  async getActivityReport(params?: { from?: string; to?: string }): Promise<ActivityReportItem[]> {
    const response = await apiClient.get<ActivityReportItem[]>(API_ENDPOINTS.analytics.activity, params);
    return response.data as ActivityReportItem[];
  }
}

export const analyticsService = new AnalyticsService();
