import { db } from '../../config/database';
import { redis } from '../../config/redis';
import logger from '../../config/logger';
import { AppError } from '../../shared/utils/errors';
import { NotificationService } from '../notifications/notification.service';

export interface DashboardStats {
  totalMembers: number;
  activeMembers: number;
  newMembersToday: number;
  newMembersThisMonth: number;
  pendingApprovals: number;
  pendingKyc: number;
  activeMemberships: number;
  totalRevenue: number;
  revenueThisMonth: number;
  interestsSentToday: number;
  matchesThisMonth: number;
}

export interface MemberFilters {
  status?: string;
  membershipPlan?: string;
  gender?: string;
  religion?: string;
  state?: string;
  district?: string;
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface SystemSettingFilters {
  search?: string;
  page?: number;
  limit?: number;
}

export interface ISystemSetting {
  id: string;
  key: string;
  value: string;
  type: 'string' | 'boolean' | 'number' | 'json';
  description: string;
  isPublic: boolean;
  updatedAt: Date;
  updatedBy: string;
}

export class AdminService {
  private notificationService: NotificationService;

  constructor() {
    this.notificationService = new NotificationService();
  }

  async validateAdminAccess(adminId: string, _targetUserId?: string, targetCentreId?: string): Promise<{hasAccess: boolean; scope: 'super_admin' | 'centre' | 'none'; centreId?: string; franchiseId?: string}> {
    const admin = await db('users')
      .where('id', adminId)
      .first();

    if (!admin) {
      return { hasAccess: false, scope: 'none' };
    }

    if (admin.role === 'super_admin') {
      return { hasAccess: true, scope: 'super_admin' };
    }

    if (admin.role === 'centre_admin' || admin.role === 'centre_staff') {
      const centre = await db('centres')
        .where('id', admin.centre_id)
        .first();

      if (!centre) {
        return { hasAccess: false, scope: 'none' };
      }

      if (targetCentreId && targetCentreId !== admin.centre_id) {
        return { hasAccess: false, scope: 'centre', centreId: admin.centre_id, franchiseId: centre.franchise_id };
      }

      return { hasAccess: true, scope: 'centre', centreId: admin.centre_id, franchiseId: centre.franchise_id };
    }

    return { hasAccess: false, scope: 'none' };
  }

  async getDashboardStats(centreId?: string, franchiseId?: string) {
    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const cacheKey = `admin:stats:${centreId || 'all'}:${franchiseId || 'all'}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    let memberQuery = db('users as u').count('u.id as count');
    let revenueQuery = db('payments').sum('amount as total').where('status', 'completed');

    if (centreId) {
      memberQuery = memberQuery.where('u.centre_id', centreId);
      revenueQuery = revenueQuery.where('centre_id', centreId);
    }

    if (franchiseId) {
      memberQuery = memberQuery.leftJoin('centres as c', 'c.id', 'u.centre_id').where('c.franchise_id', franchiseId);
    }

    const [
      totalMembers,
      activeMembers,
      newToday,
      newMonth,
      pendingApprovals,
      pendingKyc,
      activeMemberships,
      totalRevenue,
      revenueMonth,
      interestsToday,
      matchesMonth
    ] = await Promise.all([
      db('users').count('id as count').first(),
      db('users').where('status', 'active').count('id as count').first(),
      db('users').where('created_at', '>=', startOfDay).count('id as count').first(),
      db('users').where('created_at', '>=', startOfMonth).count('id as count').first(),
      db('users').where('status', 'pending').count('id as count').first(),
      db('user_profiles').where('kyc_status', '!=', 'verified').whereNotNull('kyc_status').count('user_id as count').first(),
      db('user_memberships').where('status', 'active').where('end_date', '>', db.fn.now()).count('id as count').first(),
      revenueQuery.first(),
      db('payments').sum('amount as total').where('status', 'completed').where('created_at', '>=', startOfMonth).first(),
      db('interest_requests').where('created_at', '>=', startOfDay).count('id as count').first(),
      db('interest_requests').where('status', 'accepted').where('created_at', '>=', startOfMonth).count('id as count').first()
    ]);

    const stats: DashboardStats = {
      totalMembers: Number(totalMembers?.count || 0),
      activeMembers: Number(activeMembers?.count || 0),
      newMembersToday: Number(newToday?.count || 0),
      newMembersThisMonth: Number(newMonth?.count || 0),
      pendingApprovals: Number(pendingApprovals?.count || 0),
      pendingKyc: Number(pendingKyc?.count || 0),
      activeMemberships: Number(activeMemberships?.count || 0),
      totalRevenue: Number(totalRevenue?.total || 0),
      revenueThisMonth: Number(revenueMonth?.total || 0),
      interestsSentToday: Number(interestsToday?.count || 0),
      matchesThisMonth: Number(matchesMonth?.count || 0)
    };

    await redis.setex(cacheKey, 300, JSON.stringify(stats));

    return stats;
  }

  async getMembers(filters: MemberFilters, page = 1, limit = 20, adminId: string, centreId?: string) {
    const offset = (page - 1) * limit;

    let query = db('users as u')
      .select(
        'u.id',
        'u.first_name',
        'u.last_name',
        'u.email',
        'u.phone',
        'u.gender',
        'u.status',
        'u.created_at',
        'up.avatar_url',
        'up.city',
        'up.profile_completion',
        'up.kyc_status',
        'um.plan_name as membership_plan',
        'um.end_date as membership_expiry'
      )
      .leftJoin('user_profiles as up', 'up.user_id', 'u.id')
      .leftJoin('user_memberships as um', function () {
        this.on('um.user_id', 'u.id').onIn('um.status', ['active', 'expired']);
      })
      .orderBy('u.created_at', 'desc')
      .limit(limit)
      .offset(offset);

    if (centreId) {
      query = query.where('u.centre_id', centreId);
    }

    if (filters.status) {
      query = query.where('u.status', filters.status);
    }

    if (filters.gender) {
      query = query.where('u.gender', filters.gender);
    }

    if (filters.membershipPlan) {
      query = query.where('um.plan_name', filters.membershipPlan);
    }

    if (filters.search) {
      query = query.where(function () {
        this.whereILike('u.first_name', `%${filters.search}%`)
          .orWhereILike('u.last_name', `%${filters.search}%`)
          .orWhereILike('u.email', `%${filters.search}%`)
          .orWhereILike('u.phone', `%${filters.search}%`);
      });
    }

    if (filters.dateFrom) {
      query = query.where('u.created_at', '>=', filters.dateFrom);
    }

    if (filters.dateTo) {
      query = query.where('u.created_at', '<=', filters.dateTo);
    }

    const [members, total] = await Promise.all([
      query,
      db('users').count('id as count').first()
    ]);

    await this.logAction(adminId, 'member_list_viewed', { filters, page });

    return {
      data: members,
      pagination: {
        page,
        limit,
        total: Number(total?.count || 0),
        pages: Math.ceil(Number(total?.count || 0) / limit)
      }
    };
  }

  async getMemberDetail(memberId: string, adminId: string) {
    const access = await this.validateAdminAccess(adminId);
    if (!access.hasAccess) {
      throw new AppError('Unauthorized access', 403, 'UNAUTHORIZED');
    }

    let query = db('users as u')
      .select(
        'u.*',
        'up.*',
        'um.plan_name as membership_plan',
        'um.start_date as membership_start',
        'um.end_date as membership_expiry',
        'um.status as membership_status'
      )
      .leftJoin('user_profiles as up', 'up.user_id', 'u.id')
      .leftJoin('user_memberships as um', function () {
        this.on('um.user_id', 'u.id').onIn('um.status', ['active', 'expired']);
      })
      .where('u.id', memberId);

    if (access.scope === 'centre' && access.centreId) {
      query = query.where('u.centre_id', access.centreId);
    }

    const member = await query.first();

    if (!member) {
      throw new AppError('Member not found or access denied', 404, 'MEMBER_NOT_FOUND');
    }

    const [interestsSent, interestsReceived, payments] = await Promise.all([
      db('interest_requests').where('sender_id', memberId).count('id as count').first(),
      db('interest_requests').where('receiver_id', memberId).count('id as count').first(),
      db('payments').where('user_id', memberId).sum('amount as total').first()
    ]);

    await this.logAction(adminId, 'member_detail_viewed', { memberId });

    return {
      ...member,
      stats: {
        interestsSent: Number(interestsSent?.count || 0),
        interestsReceived: Number(interestsReceived?.count || 0),
        totalPayments: Number(payments?.total || 0)
      }
    };
  }

  async updateMemberStatus(memberId: string, adminId: string, status: string, reason?: string) {
    const access = await this.validateAdminAccess(adminId);
    if (!access.hasAccess) {
      throw new AppError('Unauthorized access', 403, 'UNAUTHORIZED');
    }

    let memberQuery = db('users').where('id', memberId);
    
    if (access.scope === 'centre' && access.centreId) {
      memberQuery = memberQuery.where('centre_id', access.centreId);
    }
    
    const member = await memberQuery.first();
    
    if (!member) {
      throw new AppError('Member not found or access denied', 404, 'MEMBER_NOT_FOUND');
    }

    const validStatuses = ['active', 'pending', 'suspended', 'rejected', 'deleted'];
    if (!validStatuses.includes(status)) {
      throw new AppError('Invalid status', 400, 'INVALID_STATUS');
    }

    const [updated] = await db('users')
      .where('id', memberId)
      .update({ status, updated_at: db.fn.now() })
      .returning('*');

    await this.logAction(adminId, `member_status_${status}`, { memberId, reason, scope: access.scope });

    await this.notificationService.createNotification({
      userId: memberId,
      type: `profile_${status}`,
      title: status === 'active' ? 'Profile Activated' : status === 'suspended' ? 'Profile Suspended' : 'Profile Status Updated',
      body: reason || `Your profile status has been updated to ${status}.`,
      data: { status, reason }
    });

    return updated;
  }

  async getReports(status?: string, page = 1, limit = 20) {
    const offset = (page - 1) * limit;

    let query = db('profile_reports as pr')
      .select(
        'pr.*',
        'reporter.first_name as reporter_first_name',
        'reporter.last_name as reporter_last_name',
        'reported.first_name as reported_first_name',
        'reported.last_name as reported_last_name',
        'reviewed.first_name as reviewer_first_name',
        'reviewed.last_name as reviewer_last_name'
      )
      .leftJoin('users as reporter', 'reporter.id', 'pr.reporter_id')
      .leftJoin('users as reported', 'reported.id', 'pr.reported_user_id')
      .leftJoin('users as reviewed', 'reviewed.id', 'pr.reviewed_by')
      .orderBy('pr.created_at', 'desc')
      .limit(limit)
      .offset(offset);

    if (status) {
      query = query.where('pr.status', status);
    }

    const [reports, total] = await Promise.all([
      query,
      db('profile_reports').count('id as count').first()
    ]);

    return {
      data: reports,
      pagination: {
        page,
        limit,
        total: Number(total?.count || 0),
        pages: Math.ceil(Number(total?.count || 0) / limit)
      }
    };
  }

  async updateReportStatus(reportId: string, adminId: string, status: string, actionTaken?: string) {
    const report = await db('profile_reports').where('id', reportId).first();
    if (!report) {
      throw new AppError('Report not found', 404, 'NOT_FOUND');
    }

    const [updated] = await db('profile_reports')
      .where('id', reportId)
      .update({
        status,
        reviewed_by: adminId,
        reviewed_at: db.fn.now(),
        action_taken: actionTaken,
        updated_at: db.fn.now()
      })
      .returning('*');

    await this.logAction(adminId, `report_${status}`, { reportId, actionTaken });

    if (status === 'actioned' && actionTaken?.includes('suspend')) {
      await this.updateMemberStatus(report.reported_user_id, adminId, 'suspended', actionTaken);
    }

    return updated;
  }

  async getAuditLogs(page = 1, limit = 50, filters?: { action?: string; userId?: string; dateFrom?: Date; dateTo?: Date }) {
    const offset = (page - 1) * limit;

    let query = db('audit_logs')
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);

    if (filters?.action) {
      query = query.where('action', filters.action);
    }

    if (filters?.userId) {
      query = query.where('performed_by', filters.userId);
    }

    if (filters?.dateFrom) {
      query = query.where('created_at', '>=', filters.dateFrom);
    }

    if (filters?.dateTo) {
      query = query.where('created_at', '<=', filters.dateTo);
    }

    const [logs, total] = await Promise.all([
      query,
      db('audit_logs').count('id as count').first()
    ]);

    return {
      data: logs,
      pagination: {
        page,
        limit,
        total: Number(total?.count || 0),
        pages: Math.ceil(Number(total?.count || 0) / limit)
      }
    };
  }

  async getAnalytics(timeRange: 'day' | 'week' | 'month' | 'year' = 'month', _centreId?: string) {
    const now = new Date();
    let startDate: Date;
    let groupBy: string;

    switch (timeRange) {
      case 'day':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        groupBy = 'hour';
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        groupBy = 'day';
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        groupBy = 'day';
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        groupBy = 'month';
        break;
    }

    const [registrations, revenue, interests, activeUsers] = await Promise.all([
      db('users')
        .select(db.raw(`DATE(created_at) as date, COUNT(*) as count`))
        .where('created_at', '>=', startDate)
        .groupBy(db.raw('DATE(created_at)'))
        .orderBy('date', 'asc'),
      db('payments')
        .select(db.raw(`DATE(created_at) as date, SUM(amount) as total`))
        .where('created_at', '>=', startDate)
        .where('status', 'completed')
        .groupBy(db.raw('DATE(created_at)'))
        .orderBy('date', 'asc'),
      db('interest_requests')
        .select(db.raw(`DATE(created_at) as date, COUNT(*) as count`))
        .where('created_at', '>=', startDate)
        .groupBy(db.raw('DATE(created_at)'))
        .orderBy('date', 'asc'),
      db('audit_logs')
        .select(db.raw(`DATE(created_at) as date, COUNT(DISTINCT user_id) as count`))
        .where('created_at', '>=', startDate)
        .groupBy(db.raw('DATE(created_at)'))
        .orderBy('date', 'asc')
    ]);

    return {
      timeRange,
      startDate,
      registrations,
      revenue,
      interests,
      activeUsers
    };
  }

  async getMembershipAnalytics() {
    const [planStats, expiryStats, upgradeStats] = await Promise.all([
      db('user_memberships as um')
        .select('mp.name as plan_name', db.raw('COUNT(*) as count'), db.raw('SUM(mp.price) as revenue'))
        .leftJoin('membership_plans as mp', 'mp.id', 'um.plan_id')
        .where('um.status', 'active')
        .groupBy('mp.name'),
      db('user_memberships')
        .select(
          db.raw(`COUNT(*) FILTER (WHERE end_date <= NOW() + INTERVAL '7 days') as expiring_soon`),
          db.raw(`COUNT(*) FILTER (WHERE end_date <= NOW()) as expired_today`),
          db.raw(`COUNT(*) FILTER (WHERE end_date > NOW() AND end_date <= NOW() + INTERVAL '30 days') as expiring_30_days`)
        )
        .first(),
      db('membership_upgrade_logs')
        .select('from_plan', 'to_plan', db.raw('COUNT(*) as count'))
        .groupBy('from_plan', 'to_plan')
    ]);

    return { planStats, expiryStats, upgradeStats };
  }

  async bulkUpdateMemberStatus(memberIds: string[], adminId: string, status: string, reason?: string) {
    const access = await this.validateAdminAccess(adminId);
    if (!access.hasAccess) {
      throw new AppError('Unauthorized access', 403, 'UNAUTHORIZED');
    }

    if (memberIds.length > 100) {
      throw new AppError('Cannot update more than 100 members at once', 400, 'LIMIT_EXCEEDED');
    }

    let query = db('users')
      .whereIn('id', memberIds);

    if (access.scope === 'centre' && access.centreId) {
      query = query.where('centre_id', access.centreId);
    }

    const validStatuses = ['active', 'pending', 'suspended', 'rejected', 'deleted'];
    if (!validStatuses.includes(status)) {
      throw new AppError('Invalid status', 400, 'INVALID_STATUS');
    }

    const updated = await query.update({ status, updated_at: db.fn.now() });

    await this.logAction(adminId, `bulk_status_${status}`, { 
      memberIds: memberIds.length, 
      reason,
      scope: access.scope,
      actualUpdated: updated 
    });

    return { requested: memberIds.length, updated };
  }

  async exportMembers(filters: MemberFilters, adminId: string, format: 'csv' | 'xlsx' = 'csv') {
    let query = db('users as u')
      .select(
        'u.first_name',
        'u.last_name',
        'u.email',
        'u.phone',
        'u.gender',
        'u.date_of_birth',
        'u.religion',
        'u.caste',
        'up.city',
        'up.education as highest_education',
        'up.occupation',
        'up.annual_income',
        'u.status',
        'u.created_at'
      )
      .leftJoin('user_profiles as up', 'up.user_id', 'u.id');

    if (filters.status) {
      query = query.where('u.status', filters.status);
    }

    if (filters.gender) {
      query = query.where('u.gender', filters.gender);
    }

    if (filters.search) {
      query = query.where(function () {
        this.whereILike('u.first_name', `%${filters.search}%`)
          .orWhereILike('u.last_name', `%${filters.search}%`);
      });
    }

    const data = await query.orderBy('u.created_at', 'desc').limit(10000);

    await this.logAction(adminId, 'member_export', { format, filters });

    return { data, format, filename: `members_export_${Date.now()}` };
  }

  async getSettings(filters?: SystemSettingFilters) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 50, 100);
    const offset = (page - 1) * limit;

    let query = db('system_settings').orderBy('key', 'asc').limit(limit).offset(offset);

    if (filters?.search) {
      query = query.where('key', 'ilike', `${filters.search}%`);
    }

    const [settings, total] = await Promise.all([
      query,
      db('system_settings').count('id as count').first()
    ]);

    return {
      data: settings,
      pagination: {
        page,
        limit,
        total: Number(total?.count || 0),
        pages: Math.ceil(Number(total?.count || 0) / limit)
      }
    };
  }

  async getSetting(key: string) {
    const setting = await db('system_settings').where('key', key).first();
    if (!setting) {
      throw new AppError('Setting not found', 404, 'SETTING_NOT_FOUND');
    }
    return setting;
  }

  async updateSetting(key: string, value: string, adminId: string, type?: 'string' | 'boolean' | 'number' | 'json') {
    const existing = await db('system_settings').where('key', key).first();

    const payload: Record<string, any> = {
      value,
      updated_at: db.fn.now(),
      updated_by: adminId
    };

    if (type) {
      payload.type = type;
    }

    let setting: any;

    if (existing) {
      [setting] = await db('system_settings').where('key', key).update(payload).returning('*');
    } else {
      [setting] = await db('system_settings').insert({
        key,
        value,
        type: type || 'string',
        updated_by: adminId
      }).returning('*');
    }

    await this.logAction(adminId, 'setting_updated', { key, value, type: type || 'string' });

    return setting;
  }

  async deleteSetting(key: string, adminId: string) {
    const setting = await db('system_settings').where('key', key).first();
    if (!setting) {
      throw new AppError('Setting not found', 404, 'SETTING_NOT_FOUND');
    }

    await db('system_settings').where('key', key).del();

    await this.logAction(adminId, 'setting_deleted', { key });

    return { message: 'Setting deleted' };
  }

  async getPublicSettings() {
    return db('system_settings').where('is_public', true).select('key', 'value', 'type');
  }

  private async logAction(userId: string, action: string, details: Record<string, any>) {
    try {
      await db('audit_logs').insert({
        user_id: userId,
        action,
        details: JSON.stringify(details),
        ip_address: null
      });
    } catch (error) {
      logger.error('Failed to log admin action', { error, userId, action });
    }
  }
}
