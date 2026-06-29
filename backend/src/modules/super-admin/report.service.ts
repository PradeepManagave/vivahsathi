import { db } from '../../config/database';
import logger from '../../config/logger';
import { AppError } from '../../shared/utils/errors';

export interface ReportFilters {
  dateFrom?: Date;
  dateTo?: Date;
  franchiseId?: string;
  centreId?: string;
  planId?: string;
}

export class ReportService {
  async getMemberReport(filters: {
    status?: string;
    planId?: string;
    gender?: string;
    religion?: string;
    city?: string;
    dateFrom?: Date;
    dateTo?: Date;
  }) {
    let memberQuery = db('users as u')
      .select(
        db.raw('COUNT(*) as total'),
        db.raw("COUNT(*) FILTER (WHERE u.gender = 'male') as male"),
        db.raw("COUNT(*) FILTER (WHERE u.gender = 'female') as female"),
        db.raw("COUNT(*) FILTER (WHERE u.status = 'active') as active"),
        db.raw("COUNT(*) FILTER (WHERE u.status = 'pending') as pending"),
        db.raw("COUNT(*) FILTER (WHERE u.status = 'banned') as banned")
      )
      .first();

    let planQuery = db('user_memberships as um')
      .select(
        'mp.name as plan_name',
        db.raw('COUNT(*) as members')
      )
      .leftJoin('membership_plans as mp', 'mp.id', 'um.plan_id')
      .whereIn('um.status', ['active', 'expired'])
      .groupBy('mp.name')
      .orderBy('members', 'desc');

    let genderQuery = db('users as u')
      .select(
        'u.gender',
        db.raw('COUNT(*) as count')
      )
      .groupBy('u.gender');

    let religionQuery = db('user_profiles as up')
      .select(
        'up.religion',
        db.raw('COUNT(*) as count')
      )
      .whereNotNull('up.religion')
      .groupBy('up.religion')
      .orderBy('count', 'desc');

    let cityQuery = db('user_profiles as up')
      .select(
        'up.city',
        db.raw('COUNT(*) as count')
      )
      .whereNotNull('up.city')
      .whereNot('up.city', '')
      .groupBy('up.city')
      .orderBy('count', 'desc')
      .limit(20);

    let monthlyQuery = db('users')
      .select(
        db.raw("TO_CHAR(created_at, 'YYYY-MM') as month"),
        db.raw('COUNT(*) as new_members')
      )
      .groupByRaw("TO_CHAR(created_at, 'YYYY-MM')")
      .orderByRaw("TO_CHAR(created_at, 'YYYY-MM') DESC")
      .limit(12);

    if (filters.dateFrom) {
      memberQuery = memberQuery.where('u.created_at', '>=', filters.dateFrom);
      monthlyQuery = monthlyQuery.where('created_at', '>=', filters.dateFrom);
    }

    if (filters.dateTo) {
      memberQuery = memberQuery.where('u.created_at', '<=', filters.dateTo);
      monthlyQuery = monthlyQuery.where('created_at', '<=', filters.dateTo);
    }

    const [summary, byPlan, byGender, byReligion, byCity, monthly] = await Promise.all([
      memberQuery,
      planQuery,
      genderQuery,
      religionQuery,
      cityQuery,
      monthlyQuery
    ]);

    return {
      summary,
      byPlan,
      byGender,
      byReligion,
      byCity,
      monthly
    };
  }

  async getRevenueReport(filters: ReportFilters) {
    let query = db('payments as p')
      .select(
        db.raw('COUNT(*) as total_transactions'),
        db.raw('SUM(p.amount) as total_revenue'),
        db.raw('AVG(p.amount) as average_transaction'),
        db.raw("COUNT(*) FILTER (WHERE p.status = 'completed') as successful"),
        db.raw("COUNT(*) FILTER (WHERE p.status = 'failed') as failed"),
        db.raw("COUNT(*) FILTER (WHERE p.status = 'refunded') as refunded"),
        db.raw("SUM(p.amount) FILTER (WHERE p.status = 'completed') as net_revenue")
      )
      .first();

    let byPlanQuery = db('payments as p')
      .select(
        'mp.name as plan_name',
        db.raw('COUNT(*) as transactions'),
        db.raw('SUM(p.amount) as revenue')
      )
      .leftJoin('membership_plans as mp', 'mp.id', 'p.plan_id')
      .where('p.status', 'completed')
      .groupBy('mp.name')
      .orderBy('revenue', 'desc');

    let byFranchiseQuery = db('payments as p')
      .select(
        'f.name as franchise_name',
        db.raw('COUNT(*) as transactions'),
        db.raw('SUM(p.amount) as revenue')
      )
      .leftJoin('centres as c', 'c.id', 'p.centre_id')
      .leftJoin('franchises as f', 'f.id', 'c.franchise_id')
      .where('p.status', 'completed')
      .groupBy('f.name')
      .orderBy('revenue', 'desc');

    let byMonthQuery = db('payments')
      .select(
        db.raw("TO_CHAR(created_at, 'YYYY-MM') as month"),
        db.raw('COUNT(*) as transactions'),
        db.raw('SUM(amount) as revenue')
      )
      .where('status', 'completed')
      .groupByRaw("TO_CHAR(created_at, 'YYYY-MM')")
      .orderByRaw("TO_CHAR(created_at, 'YYYY-MM') DESC")
      .limit(12);

    if (filters.dateFrom) {
      query = query.where('p.created_at', '>=', filters.dateFrom);
      byPlanQuery = byPlanQuery.where('p.created_at', '>=', filters.dateFrom);
      byFranchiseQuery = byFranchiseQuery.where('p.created_at', '>=', filters.dateFrom);
      byMonthQuery = byMonthQuery.where('created_at', '>=', filters.dateFrom);
    }

    if (filters.dateTo) {
      query = query.where('p.created_at', '<=', filters.dateTo);
      byPlanQuery = byPlanQuery.where('p.created_at', '<=', filters.dateTo);
      byFranchiseQuery = byFranchiseQuery.where('p.created_at', '<=', filters.dateTo);
      byMonthQuery = byMonthQuery.where('created_at', '<=', filters.dateTo);
    }

    if (filters.franchiseId) {
      byFranchiseQuery = byFranchiseQuery.where('c.franchise_id', filters.franchiseId);
    }

    const [summary, byPlan, byFranchise, monthly] = await Promise.all([
      query,
      byPlanQuery,
      byFranchiseQuery,
      byMonthQuery
    ]);

    return {
      summary: {
        totalTransactions: Number(summary?.total_transactions || 0),
        totalRevenue: Number(summary?.total_revenue || 0),
        averageTransaction: Number(summary?.average_transaction || 0),
        successfulTransactions: Number(summary?.successful || 0),
        failedTransactions: Number(summary?.failed || 0),
        refundedTransactions: Number(summary?.refunded || 0),
        netRevenue: Number(summary?.net_revenue || 0)
      },
      byPlan,
      byFranchise,
      monthly
    };
  }

  async getRenewalForecast() {
    const now = new Date();
    const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const in90Days = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

    const [expiring7Days, expiring30Days, expiring90Days, expiredLast30Days, renewalsLast30Days] = await Promise.all([
      db('user_memberships')
        .select(
          'mp.name as plan_name',
          db.raw('COUNT(*) as count')
        )
        .leftJoin('membership_plans as mp', 'mp.id', 'user_memberships.plan_id')
        .where('status', 'active')
        .whereBetween('end_date', [now, in7Days])
        .groupBy('mp.name'),
      db('user_memberships')
        .select(
          'mp.name as plan_name',
          db.raw('COUNT(*) as count')
        )
        .leftJoin('membership_plans as mp', 'mp.id', 'user_memberships.plan_id')
        .where('status', 'active')
        .whereBetween('end_date', [now, in30Days])
        .groupBy('mp.name'),
      db('user_memberships')
        .select(
          'mp.name as plan_name',
          db.raw('COUNT(*) as count')
        )
        .leftJoin('membership_plans as mp', 'mp.id', 'user_memberships.plan_id')
        .where('status', 'active')
        .whereBetween('end_date', [now, in90Days])
        .groupBy('mp.name'),
      db('user_memberships')
        .where('status', 'expired')
        .whereBetween('end_date', [new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), now])
        .count('id as count')
        .first(),
      db('user_memberships as um')
        .where('um.status', 'active')
        .whereRaw('um.end_date > um.start_date + INTERVAL \'1 day\' * (um.duration_days * 0.8)')
        .whereBetween('um.updated_at', [new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), now])
        .count('um.id as count')
        .first()
    ]);

    const totalExpiring7 = expiring7Days.reduce((sum: number, p: any) => sum + Number(p.count), 0);
    const totalExpiring30 = expiring30Days.reduce((sum: number, p: any) => sum + Number(p.count), 0);
    const totalExpiring90 = expiring90Days.reduce((sum: number, p: any) => sum + Number(p.count), 0);

    const renewalRate = Number(renewalsLast30Days?.count || 0) > 0
      ? (Number(renewalsLast30Days?.count || 0) / (Number(renewalsLast30Days?.count || 0) + Number(expiredLast30Days?.count || 0))) * 100
      : 0;

    return {
      expiringIn7Days: expiring7Days,
      expiringIn30Days: expiring30Days,
      expiringIn90Days: expiring90Days,
      totals: {
        expiring7Days: totalExpiring7,
        expiring30Days: totalExpiring30,
        expiring90Days: totalExpiring90,
        expiredLast30Days: Number(expiredLast30Days?.count || 0),
        renewalsLast30Days: Number(renewalsLast30Days?.count || 0),
        renewalRate: renewalRate.toFixed(2) + '%'
      }
    };
  }

  async getCommissionReport(filters: { dateFrom?: Date; dateTo?: Date }) {
    let query = db('franchises as f')
      .select(
        'f.id',
        'f.name as franchise_name',
        'f.code as franchise_code',
        'f.commission as commission_rate',
        db.raw('COUNT(DISTINCT c.id) as centres'),
        db.raw("COALESCE(SUM(CASE WHEN p.status = 'completed' THEN p.amount ELSE 0 END), 0) as gross_revenue")
      )
      .leftJoin('centres as c', 'c.franchise_id', 'f.id')
      .leftJoin('payments as p', 'p.centre_id', 'c.id')
      .groupBy('f.id')
      .orderBy('gross_revenue', 'desc');

    if (filters.dateFrom) {
      query = query.where('p.created_at', '>=', filters.dateFrom);
    }

    if (filters.dateTo) {
      query = query.where('p.created_at', '<=', filters.dateTo);
    }

    const franchises = await query;

    const report = franchises.map((f: any) => ({
      ...f,
      gross_revenue: Number(f.gross_revenue),
      commission_amount: Number(f.gross_revenue) * (f.commission_rate / 100),
      net_payable: Number(f.gross_revenue) - (Number(f.gross_revenue) * (f.commission_rate / 100))
    }));

    const totals = report.reduce((acc: any, f: any) => ({
      totalRevenue: acc.totalRevenue + f.gross_revenue,
      totalCommission: acc.totalCommission + f.commission_amount,
      totalNetPayable: acc.totalNetPayable + f.net_payable
    }), { totalRevenue: 0, totalCommission: 0, totalNetPayable: 0 });

    return { franchises: report, totals };
  }

  async getDashboardStats() {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(startOfDay.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalMembers,
      newToday,
      newThisWeek,
      newThisMonth,
      activeMembers,
      paidMembers,
      pendingApproval,
      bannedMembers,
      totalRevenue,
      revenueThisMonth,
      revenueToday,
      activeMemberships,
      expiringThisWeek,
      unreadReports
    ] = await Promise.all([
      db('users').count('id as count').first(),
      db('users').where('created_at', '>=', startOfDay).count('id as count').first(),
      db('users').where('created_at', '>=', startOfWeek).count('id as count').first(),
      db('users').where('created_at', '>=', startOfMonth).count('id as count').first(),
      db('users').where('status', 'active').count('id as count').first(),
      db('user_memberships').where('status', 'active').count('id as count').first(),
      db('users').where('status', 'pending').count('id as count').first(),
      db('users').where('status', 'banned').count('id as count').first(),
      db('payments').where('status', 'completed').sum('amount as total').first(),
      db('payments').where('status', 'completed').where('created_at', '>=', startOfMonth).sum('amount as total').first(),
      db('payments').where('status', 'completed').where('created_at', '>=', startOfDay).sum('amount as total').first(),
      db('user_memberships').where('status', 'active').count('id as count').first(),
      db('user_memberships').where('status', 'active').where('end_date', '<=', new Date(startOfDay.getTime() + 7 * 24 * 60 * 60 * 1000)).count('id as count').first(),
      db('profile_reports').where('status', 'pending').count('id as count').first()
    ]);

    const paidConversionRate = totalMembers?.count && Number(totalMembers.count) > 0
      ? ((Number(paidMembers?.count || 0) / Number(totalMembers.count)) * 100).toFixed(2) + '%'
      : '0%';

    return {
      members: {
        total: Number(totalMembers?.count || 0),
        active: Number(activeMembers?.count || 0),
        paid: Number(paidMembers?.count || 0),
        pending: Number(pendingApproval?.count || 0),
        banned: Number(bannedMembers?.count || 0),
        newToday: Number(newToday?.count || 0),
        newThisWeek: Number(newThisWeek?.count || 0),
        newThisMonth: Number(newThisMonth?.count || 0),
        paidConversionRate
      },
      revenue: {
        total: Number(totalRevenue?.total || 0),
        thisMonth: Number(revenueThisMonth?.total || 0),
        today: Number(revenueToday?.total || 0)
      },
      membership: {
        active: Number(activeMemberships?.count || 0),
        expiringThisWeek: Number(expiringThisWeek?.count || 0)
      },
      reports: {
        unread: Number(unreadReports?.count || 0)
      }
    };
  }
}
