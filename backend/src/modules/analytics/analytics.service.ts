import { db } from '../../config/database';

interface DashboardStats {
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

interface RevenueReport {
  period: string;
  amount: number;
  count: number;
  breakdown: { plan: string; amount: number; count: number }[];
}

interface ActivityReport {
  date: string;
  registrations: number;
  logins: number;
  profileUpdates: number;
  searches: number;
  messagesSent: number;
  matches: number;
}

export class AnalyticsService {
  async getDashboardStats(centreId?: string): Promise<DashboardStats> {
    let userQuery = db('users');
    if (centreId) userQuery = userQuery.where('centre_id', centreId);

    const totalUsers = await userQuery.clone().count('id as count').first() as any;
    const activeUsers = await userQuery.clone().where('is_active', true).count('id as count').first() as any;
    const newUsersToday = await userQuery.clone().whereRaw('created_at::date = CURRENT_DATE').count('id as count').first() as any;

    let paymentQuery = db('payment_transactions').where('status', 'completed');
    if (centreId) paymentQuery = paymentQuery.where('centre_id', centreId);

    const revenueToday = await paymentQuery.clone().whereRaw('created_at::date = CURRENT_DATE').sum('amount as total').first() as any;
    const revenueThisMonth = await paymentQuery.clone().whereRaw("date_trunc('month', created_at) = date_trunc('month', CURRENT_DATE)").sum('amount as total').first() as any;
    const totalRevenue = await paymentQuery.clone().sum('amount as total').first() as any;

    return {
      totalUsers: parseInt(totalUsers?.count || '0', 10),
      activeUsers: parseInt(activeUsers?.count || '0', 10),
      newUsersToday: parseInt(newUsersToday?.count || '0', 10),
      totalMemberships: 0,
      activeMemberships: 0,
      revenueToday: parseFloat(revenueToday?.total || '0'),
      revenueThisMonth: parseFloat(revenueThisMonth?.total || '0'),
      totalRevenue: parseFloat(totalRevenue?.total || '0'),
      totalVendors: parseInt(((await db('marketplace_vendors').where('is_active', true).count('id as count').first()) as any)?.count || '0', 10),
      totalClassifieds: parseInt(((await db('marketplace_classifieds').where('is_active', true).count('id as count').first()) as any)?.count || '0', 10),
      pendingKyc: 0,
      successStories: parseInt(((await db('cms_success_stories').where('is_active', true).count('id as count').first()) as any)?.count || '0', 10),
    };
  }

  async getRevenueReport(period: 'daily' | 'weekly' | 'monthly' | 'yearly', from?: string, to?: string): Promise<RevenueReport[]> {
    let trunc: string;
    switch (period) {
      case 'weekly': trunc = 'week'; break;
      case 'monthly': trunc = 'month'; break;
      case 'yearly': trunc = 'year'; break;
      default: trunc = 'day';
    }

    let query = db('payment_transactions')
      .where('status', 'completed')
      .select(db.raw(`date_trunc('${trunc}', created_at) as period`))
      .select(db.raw('SUM(amount) as amount'), db.raw('COUNT(*) as count'))
      .groupByRaw(`date_trunc('${trunc}', created_at)`)
      .orderByRaw(`date_trunc('${trunc}', created_at) desc`)
      .limit(90);

    if (from) query = query.where('created_at', '>=', new Date(from));
    if (to) query = query.where('created_at', '<=', new Date(to));

    return query;
  }

  async getActivityReport(from?: string, to?: string): Promise<ActivityReport[]> {
    let query = db('activity_logs')
      .select(db.raw('DATE(created_at) as date'))
      .select(db.raw("COUNT(*) FILTER (WHERE action = 'user_registered') as registrations"))
      .select(db.raw("COUNT(*) FILTER (WHERE action = 'user_login') as logins"))
      .select(db.raw("COUNT(*) FILTER (WHERE action = 'profile_updated') as profile_updates"))
      .select(db.raw("COUNT(*) FILTER (WHERE action = 'search_executed') as searches"))
      .select(db.raw("COUNT(*) FILTER (WHERE action = 'message_sent') as messages_sent"))
      .groupByRaw('DATE(created_at)')
      .orderByRaw('DATE(created_at) desc')
      .limit(90);

    if (from) query = query.where('created_at', '>=', new Date(from));
    if (to) query = query.where('created_at', '<=', new Date(to));

    return query;
  }
}

export const analyticsService = new AnalyticsService();
