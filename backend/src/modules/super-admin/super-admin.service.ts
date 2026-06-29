import { db } from '../../config/database';
import { redis } from '../../config/redis';
import logger from '../../config/logger';
import { AppError } from '../../shared/utils/errors';
import { NotificationService } from '../notifications/notification.service';

export interface MemberFilters {
  status?: string;
  plan?: string;
  franchiseId?: string;
  centreId?: string;
  gender?: string;
  religion?: string;
  state?: string;
  district?: string;
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export class SuperAdminService {
  private notificationService: NotificationService;

  constructor() {
    this.notificationService = new NotificationService();
  }

  async getMembers(filters: MemberFilters, page = 1, limit = 20) {
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
        'up.state as profile_state',
        'up.profile_completion',
        'up.kyc_status',
        'um.plan_name as membership_plan',
        'um.plan_id as membership_plan_id',
        'um.end_date as membership_expiry',
        'um.status as membership_status',
        'c.name as centre_name',
        'c.code as centre_code',
        'f.name as franchise_name',
        'f.id as franchise_id'
      )
      .leftJoin('user_profiles as up', 'up.user_id', 'u.id')
      .leftJoin('user_memberships as um', function () {
        this.on('um.user_id', 'u.id').onIn('um.status', ['active', 'expired']);
      })
      .leftJoin('centres as c', 'c.id', 'u.centre_id')
      .leftJoin('franchises as f', 'f.id', 'c.franchise_id')
      .orderBy('u.created_at', 'desc')
      .limit(limit)
      .offset(offset);

    if (filters.status) {
      query = query.where('u.status', filters.status);
    }

    if (filters.plan) {
      query = query.where('um.plan_id', filters.plan);
    }

    if (filters.franchiseId) {
      query = query.where('f.id', filters.franchiseId);
    }

    if (filters.centreId) {
      query = query.where('c.id', filters.centreId);
    }

    if (filters.gender) {
      query = query.where('u.gender', filters.gender);
    }

    if (filters.religion) {
      query = query.where('up.religion', filters.religion);
    }

    if (filters.state) {
      query = query.where('up.state', filters.state);
    }

    if (filters.district) {
      query = query.where('up.district', filters.district);
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

  async getMemberDetail(memberId: string) {
    const member = await db('users as u')
      .select(
        'u.*',
        'up.*',
        'um.plan_name as membership_plan',
        'um.plan_id as membership_plan_id',
        'um.start_date as membership_start',
        'um.end_date as membership_expiry',
        'um.status as membership_status',
        'c.name as centre_name',
        'c.code as centre_code',
        'f.name as franchise_name',
        'f.id as franchise_id'
      )
      .leftJoin('user_profiles as up', 'up.user_id', 'u.id')
      .leftJoin('user_memberships as um', function () {
        this.on('um.user_id', 'u.id').onIn('um.status', ['active', 'expired']);
      })
      .leftJoin('centres as c', 'c.id', 'u.centre_id')
      .leftJoin('franchises as f', 'f.id', 'c.franchise_id')
      .where('u.id', memberId)
      .first();

    if (!member) {
      throw new AppError('Member not found', 404, 'MEMBER_NOT_FOUND');
    }

    const photos = await db('user_photos')
      .where('user_id', memberId)
      .select('id', 'photo_url', 'thumbnail_url', 'is_primary', 'visibility', 'status', 'created_at');

    const [interestsSent, interestsReceived, payments] = await Promise.all([
      db('interest_requests').where('sender_id', memberId).count('id as count').first(),
      db('interest_requests').where('receiver_id', memberId).count('id as count').first(),
      db('payments').where('user_id', memberId).sum('amount as total').first()
    ]);

    return {
      ...member,
      photos,
      stats: {
        interestsSent: Number(interestsSent?.count || 0),
        interestsReceived: Number(interestsReceived?.count || 0),
        totalPayments: Number(payments?.total || 0)
      }
    };
  }

  async approveMember(memberId: string, adminId: string) {
    const member = await db('users').where('id', memberId).first();
    if (!member) {
      throw new AppError('Member not found', 404, 'MEMBER_NOT_FOUND');
    }

    if (member.status !== 'pending') {
      throw new AppError('Member is not pending approval', 400, 'INVALID_STATUS');
    }

    const [updated] = await db('users')
      .where('id', memberId)
      .update({ status: 'active', updated_at: db.fn.now() })
      .returning('*');

    await this.logAdminActivity(adminId, 'member_approved', 'user', memberId, null, { memberId });

    await this.notificationService.createNotification({
      userId: memberId,
      type: 'profile_approved',
      title: 'Profile Approved',
      body: 'Congratulations! Your profile has been approved and is now visible to others.',
      data: { memberId }
    });

    return updated;
  }

  async banMember(memberId: string, adminId: string, reason: string, duration?: number) {
    if (!reason || reason.trim().length < 10) {
      throw new AppError('Ban reason must be at least 10 characters', 400, 'INVALID_REASON');
    }

    const member = await db('users').where('id', memberId).first();
    if (!member) {
      throw new AppError('Member not found', 404, 'MEMBER_NOT_FOUND');
    }

    const banData: any = {
      status: 'banned',
      ban_reason: reason,
      banned_at: db.fn.now(),
      banned_by: adminId,
      updated_at: db.fn.now()
    };

    if (duration) {
      banData.ban_expires_at = new Date(Date.now() + duration * 24 * 60 * 60 * 1000);
    }

    const [updated] = await db('users')
      .where('id', memberId)
      .update(banData)
      .returning('*');

    await this.logAdminActivity(adminId, 'member_banned', 'user', memberId, { status: 'active' }, { status: 'banned', reason, duration });

    await this.notificationService.createNotification({
      userId: memberId,
      type: 'profile_banned',
      title: 'Account Banned',
      body: `Your account has been suspended. Reason: ${reason}`,
      data: { memberId, reason }
    });

    return updated;
  }

  async unbanMember(memberId: string, adminId: string) {
    const member = await db('users').where('id', memberId).first();
    if (!member) {
      throw new AppError('Member not found', 404, 'MEMBER_NOT_FOUND');
    }

    const [updated] = await db('users')
      .where('id', memberId)
      .update({
        status: 'active',
        ban_reason: null,
        banned_at: null,
        banned_by: null,
        ban_expires_at: null,
        updated_at: db.fn.now()
      })
      .returning('*');

    await this.logAdminActivity(adminId, 'member_unbanned', 'user', memberId, { status: 'banned' }, { status: 'active' });

    await this.notificationService.createNotification({
      userId: memberId,
      type: 'profile_unbanned',
      title: 'Account Restored',
      body: 'Your account has been restored. Please follow community guidelines.',
      data: { memberId }
    });

    return updated;
  }

  async convertMembership(memberId: string, adminId: string, newPlanId: string, reason: string) {
    const member = await db('users').where('id', memberId).first();
    if (!member) {
      throw new AppError('Member not found', 404, 'MEMBER_NOT_FOUND');
    }

    const plan = await db('membership_plans').where('id', newPlanId).first();
    if (!plan) {
      throw new AppError('Plan not found', 404, 'PLAN_NOT_FOUND');
    }

    const existingMembership = await db('user_memberships')
      .where('user_id', memberId)
      .whereIn('status', ['active', 'expired'])
      .first();

    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + plan.duration_days * 24 * 60 * 60 * 1000);

    let membership;
    if (existingMembership) {
      [membership] = await db('user_memberships')
        .where('id', existingMembership.id)
        .update({
          plan_id: newPlanId,
          plan_name: plan.name,
          duration_days: plan.duration_days,
          start_date: startDate,
          end_date: endDate,
          status: 'active',
          updated_at: db.fn.now()
        })
        .returning('*');
    } else {
      [membership] = await db('user_memberships')
        .insert({
          user_id: memberId,
          plan_id: newPlanId,
          plan_name: plan.name,
          duration_days: plan.duration_days,
          start_date: startDate,
          end_date: endDate,
          status: 'active',
          is_trial: false
        })
        .returning('*');
    }

    await this.logAdminActivity(adminId, 'membership_converted', 'user_membership', membership.id,
      existingMembership ? { plan_id: existingMembership.plan_id } : null,
      { plan_id: newPlanId, reason });

    await this.notificationService.createNotification({
      userId: memberId,
      type: 'membership_converted',
      title: 'Membership Updated',
      body: `Your membership has been upgraded to ${plan.name}. Reason: ${reason}`,
      data: { planName: plan.name, reason }
    });

    return membership;
  }

  async approvePhoto(memberId: string, photoId: string, adminId: string, status: 'approved' | 'rejected', rejectionReason?: string) {
    const photo = await db('user_photos')
      .where('id', photoId)
      .where('user_id', memberId)
      .first();

    if (!photo) {
      throw new AppError('Photo not found', 404, 'PHOTO_NOT_FOUND');
    }

    const [updated] = await db('user_photos')
      .where('id', photoId)
      .update({
        status,
        rejection_reason: status === 'rejected' ? rejectionReason : null,
        reviewed_at: db.fn.now(),
        reviewed_by: adminId
      })
      .returning('*');

    await this.logAdminActivity(adminId, `photo_${status}`, 'user_photo', photoId,
      { status: photo.status },
      { status, rejectionReason });

    return updated;
  }

  async getMemberActivityLog(memberId: string, page = 1, limit = 50) {
    const offset = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      db('member_activity_logs')
        .where('user_id', memberId)
        .orderBy('created_at', 'desc')
        .limit(limit)
        .offset(offset),
      db('member_activity_logs')
        .where('user_id', memberId)
        .count('id as count')
        .first()
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

  async getAdminActivityLog(filters: { adminId?: string; action?: string; dateFrom?: Date; dateTo?: Date }, page = 1, limit = 50) {
    const offset = (page - 1) * limit;

    let query = db('admin_activity_logs as aal')
      .select(
        'aal.*',
        'u.first_name as admin_first_name',
        'u.last_name as admin_last_name'
      )
      .leftJoin('users as u', 'u.id', 'aal.admin_id')
      .orderBy('aal.created_at', 'desc')
      .limit(limit)
      .offset(offset);

    if (filters.adminId) {
      query = query.where('aal.admin_id', filters.adminId);
    }

    if (filters.action) {
      query = query.where('aal.action', filters.action);
    }

    if (filters.dateFrom) {
      query = query.where('aal.created_at', '>=', filters.dateFrom);
    }

    if (filters.dateTo) {
      query = query.where('aal.created_at', '<=', filters.dateTo);
    }

    const [logs, total] = await Promise.all([
      query,
      db('admin_activity_logs').count('id as count').first()
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

  async exportMembers(filters: MemberFilters, format: 'csv' | 'xlsx' = 'csv') {
    let query = db('users as u')
      .select(
        'u.id',
        'u.first_name',
        'u.last_name',
        'u.email',
        'u.phone',
        'u.gender',
        'u.date_of_birth',
        'u.religion',
        'up.caste',
        'up.city',
        'up.state',
        'up.district',
        'up.highest_education',
        'up.occupation',
        'up.annual_income',
        'up.marital_status',
        'u.status',
        'um.plan_name as membership_plan',
        'um.end_date as membership_expiry',
        'f.name as franchise_name',
        'c.name as centre_name',
        'u.created_at'
      )
      .leftJoin('user_profiles as up', 'up.user_id', 'u.id')
      .leftJoin('user_memberships as um', function () {
        this.on('um.user_id', 'u.id').onIn('um.status', ['active', 'expired']);
      })
      .leftJoin('centres as c', 'c.id', 'u.centre_id')
      .leftJoin('franchises as f', 'f.id', 'c.franchise_id')
      .orderBy('u.created_at', 'desc')
      .limit(10000);

    if (filters.status) query = query.where('u.status', filters.status);
    if (filters.gender) query = query.where('u.gender', filters.gender);
    if (filters.franchiseId) query = query.where('f.id', filters.franchiseId);
    if (filters.dateFrom) query = query.where('u.created_at', '>=', filters.dateFrom);
    if (filters.dateTo) query = query.where('u.created_at', '<=', filters.dateTo);

    const data = await query;

    return {
      data,
      format,
      filename: `members_export_${Date.now()}`,
      columns: [
        'ID', 'First Name', 'Last Name', 'Email', 'Phone', 'Gender', 'DOB', 'Religion',
        'Caste', 'City', 'State', 'District', 'Education', 'Occupation', 'Income',
        'Marital Status', 'Status', 'Membership Plan', 'Membership Expiry',
        'Franchise', 'Centre', 'Created At'
      ]
    };
  }

  private async logAdminActivity(
    adminId: string,
    action: string,
    resourceType: string,
    resourceId: string,
    oldValues: any,
    newValues: any
  ) {
    try {
      await db('admin_activity_logs').insert({
        admin_id: adminId,
        action,
        resource_type: resourceType,
        resource_id: resourceId,
        old_values: oldValues ? JSON.stringify(oldValues) : null,
        new_values: newValues ? JSON.stringify(newValues) : null
      });
    } catch (error) {
      logger.error('Failed to log admin activity', { error, adminId, action });
    }
  }
}
