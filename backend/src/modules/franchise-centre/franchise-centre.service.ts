import { db } from '../../config/database';
import logger from '../../config/logger';
import { AppError } from '../../shared/utils/errors';
import { NotificationService } from '../notifications/notification.service';
import { EmailService } from '../../shared/services/email.service';
import { SmsService } from '../../shared/services/sms.service';

export class FranchiseCentreService {
  private notificationService: NotificationService;
  private emailService: EmailService;
  private smsService: SmsService;

  constructor() {
    this.notificationService = new NotificationService();
    this.emailService = new EmailService();
    this.smsService = new SmsService();
  }

  async getCentreDashboard(centreId: string) {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalMembers, paidMembers, newToday, newThisMonth, appointmentsToday, pendingApprovals, commissionEarned] = await Promise.all([
      db('users').where('centre_id', centreId).count('id as count').first(),
      db('user_memberships as um')
        .join('users as u', 'u.id', 'um.user_id')
        .where('u.centre_id', centreId)
        .where('um.status', 'active')
        .count('um.id as count')
        .first(),
      db('users').where('centre_id', centreId).where('created_at', '>=', startOfDay).count('id as count').first(),
      db('users').where('centre_id', centreId).where('created_at', '>=', startOfMonth).count('id as count').first(),
      db('appointments')
        .join('appointment_slots as s', 's.id', 'appointments.slot_id')
        .where('s.centre_id', centreId)
        .where('DATE(appointments.scheduled_at)', '>=', startOfDay)
        .count('appointments.id as count')
        .first(),
      db('centre_approval_requests')
        .where('centre_id', centreId)
        .where('status', 'pending')
        .count('id as count')
        .first(),
      db('commission_ledger')
        .where('centre_id', centreId)
        .where('status', '!=', 'paid')
        .sum('commission_amount as total')
        .first()
    ]);

    const paidConversion = totalMembers?.count && Number(totalMembers.count) > 0
      ? ((Number(paidMembers?.count || 0) / Number(totalMembers.count)) * 100).toFixed(1)
      : '0';

    return {
      totalMembers: Number(totalMembers?.count || 0),
      paidMembers: Number(paidMembers?.count || 0),
      paidConversionRate: paidConversion + '%',
      newToday: Number(newToday?.count || 0),
      newThisMonth: Number(newThisMonth?.count || 0),
      appointmentsToday: Number(appointmentsToday?.count || 0),
      pendingApprovals: Number(pendingApprovals?.count || 0),
      commissionEarned: Number(commissionEarned?.total || 0)
    };
  }

  async registerWalkinMember(centreId: string, staffId: string, data: {
    firstName: string;
    lastName: string;
    gender: string;
    dateOfBirth: string;
    phone: string;
    email?: string;
    religion?: string;
    caste?: string;
    education?: string;
    occupation?: string;
    city?: string;
    photoUrl?: string;
    formData?: any;
  }) {
    const existingPhone = await db('users').where('phone', data.phone).first();
    if (existingPhone) {
      throw new AppError('Phone number already registered', 400, 'PHONE_EXISTS');
    }

    if (data.email) {
      const existingEmail = await db('users').where('email', data.email).first();
      if (existingEmail) {
        throw new AppError('Email already registered', 400, 'EMAIL_EXISTS');
      }
    }

    const centre = await db('centres').where('id', centreId).first();
    if (!centre) {
      throw new AppError('Centre not found', 404, 'CENTRE_NOT_FOUND');
    }

    const [registration] = await db('walkin_registrations')
      .insert({
        centre_id: centreId,
        registered_by: staffId,
        first_name: data.firstName,
        last_name: data.lastName,
        gender: data.gender,
        date_of_birth: data.dateOfBirth,
        phone: data.phone,
        email: data.email,
        religion: data.religion,
        caste: data.caste,
        education: data.education,
        occupation: data.occupation,
        city: data.city,
        photo_url: data.photoUrl,
        form_data: JSON.stringify(data.formData || {}),
        status: 'pending'
      })
      .returning('*');

    const [approvalRequest] = await db('centre_approval_requests')
      .insert({
        centre_id: centreId,
        requested_by: staffId,
        request_type: 'member_registration',
        reference_id: registration.id,
        member_id: null,
        new_values: JSON.stringify(data),
        status: 'pending'
      })
      .returning('*');

    await db('walkin_registrations')
      .where('id', registration.id)
      .update({ approval_request_id: approvalRequest.id });

    await this.logCentreActivity(centreId, staffId, 'walkin_registered', { registrationId: registration.id });

    return { registration, approvalRequest };
  }

  async getWalkinRegistrations(centreId: string, status?: string, page = 1, limit = 20) {
    const offset = (page - 1) * limit;

    let query = db('walkin_registrations')
      .where('centre_id', centreId)
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);

    if (status) {
      query = query.where('status', status);
    }

    const [registrations, total] = await Promise.all([
      query,
      db('walkin_registrations').where('centre_id', centreId).count('id as count').first()
    ]);

    return {
      data: registrations,
      pagination: {
        page,
        limit,
        total: Number(total?.count || 0),
        pages: Math.ceil(Number(total?.count || 0) / limit)
      }
    };
  }

  async submitMemberChanges(centreId: string, staffId: string, memberId: string, changes: any) {
    const member = await db('users').where('id', memberId).where('centre_id', centreId).first();
    if (!member) {
      throw new AppError('Member not found in this centre', 404, 'MEMBER_NOT_FOUND');
    }

    const oldValues = await db('users as u')
      .select('u.*', 'up.*')
      .leftJoin('user_profiles as up', 'up.user_id', 'u.id')
      .where('u.id', memberId)
      .first();

    const [approvalRequest] = await db('centre_approval_requests')
      .insert({
        centre_id: centreId,
        requested_by: staffId,
        request_type: 'profile_update',
        member_id: memberId,
        old_values: JSON.stringify(oldValues),
        new_values: JSON.stringify(changes),
        status: 'pending'
      })
      .returning('*');

    await this.logCentreActivity(centreId, staffId, 'member_changes_submitted', {
      memberId,
      approvalRequestId: approvalRequest.id
    });

    return approvalRequest;
  }

  async getAppointments(centreId: string, date?: string, staffId?: string) {
    let query = db('appointments as a')
      .select(
        'a.*',
        's.slot_date',
        's.start_time',
        's.end_time',
        's.slot_type',
        'u.first_name as staff_first_name',
        'u.last_name as staff_last_name'
      )
      .join('appointment_slots as s', 's.id', 'a.slot_id')
      .leftJoin('users as u', 'u.id', 's.staff_id')
      .where('s.centre_id', centreId)
      .orderBy('a.scheduled_at', 'asc');

    if (date) {
      query = query.where('s.slot_date', date);
    }

    if (staffId) {
      query = query.where('s.staff_id', staffId);
    }

    return query;
  }

  async getAppointmentSlots(centreId: string, startDate: string, endDate: string, staffId?: string) {
    let query = db('appointment_slots')
      .where('centre_id', centreId)
      .whereBetween('slot_date', [startDate, endDate])
      .where('is_available', true)
      .orderBy(['slot_date', 'start_time']);

    if (staffId) {
      query = query.where('staff_id', staffId);
    }

    return query;
  }

  async createAppointmentSlot(centreId: string, staffId: string, data: {
    staffId?: string;
    slotType: string;
    slotDate: string;
    startTime: string;
    endTime: string;
    maxBookings: number;
    notes?: string;
  }) {
    const [slot] = await db('appointment_slots')
      .insert({
        centre_id: centreId,
        staff_id: data.staffId || staffId,
        slot_type: data.slotType,
        slot_date: data.slotDate,
        start_time: data.startTime,
        end_time: data.endTime,
        max_bookings: data.maxBookings || 1,
        notes: data.notes
      })
      .returning('*');

    await this.logCentreActivity(centreId, staffId, 'slot_created', { slotId: slot.id });

    return slot;
  }

  async bookAppointment(centreId: string, staffId: string, slotId: string, data: {
    memberId?: string;
    memberName: string;
    memberPhone: string;
    memberEmail?: string;
    notes?: string;
  }) {
    const slot = await db('appointment_slots')
      .where('id', slotId)
      .where('centre_id', centreId)
      .where('is_available', true)
      .first();

    if (!slot) {
      throw new AppError('Slot not available', 400, 'SLOT_NOT_AVAILABLE');
    }

    if (slot.current_bookings >= slot.max_bookings) {
      throw new AppError('Slot is fully booked', 400, 'SLOT_FULL');
    }

    const scheduledAt = new Date(`${slot.slot_date}T${slot.start_time}`);

    const [appointment] = await db('appointments')
      .insert({
        slot_id: slotId,
        member_id: data.memberId,
        member_name: data.memberName,
        member_phone: data.memberPhone,
        member_email: data.memberEmail,
        appointment_type: slot.slot_type,
        scheduled_at: scheduledAt,
        duration_minutes: slot.max_bookings === 1 ? 30 : 15,
        notes: data.notes,
        status: 'scheduled'
      })
      .returning('*');

    await db('appointment_slots')
      .where('id', slotId)
      .increment('current_bookings', 1)
      .update({ is_available: slot.current_bookings + 1 >= slot.max_bookings ? false : true });

    await this.sendAppointmentConfirmation(appointment, slot);

    await this.logCentreActivity(centreId, staffId, 'appointment_booked', {
      appointmentId: appointment.id,
      slotId
    });

    return appointment;
  }

  async cancelAppointment(centreId: string, staffId: string, appointmentId: string, reason?: string) {
    const appointment = await db('appointments as a')
      .join('appointment_slots as s', 's.id', 'a.slot_id')
      .where('a.id', appointmentId)
      .where('s.centre_id', centreId)
      .first();

    if (!appointment) {
      throw new AppError('Appointment not found', 404, 'NOT_FOUND');
    }

    await db('appointments')
      .where('id', appointmentId)
      .update({
        status: 'cancelled',
        cancellation_reason: reason,
        cancelled_at: db.fn.now(),
        cancelled_by: staffId
      });

    await db('appointment_slots')
      .where('id', appointment.slot_id)
      .decrement('current_bookings', 1)
      .update({ is_available: true });

    await this.sendCancellationNotification(appointment);

    return { success: true };
  }

  async recordOfflinePayment(centreId: string, staffId: string, data: {
    memberId: string;
    amount: number;
    paymentMode: string;
    transactionRef?: string;
    planId?: string;
    notes?: string;
  }) {
    const member = await db('users').where('id', data.memberId).where('centre_id', centreId).first();
    if (!member) {
      throw new AppError('Member not found in this centre', 404, 'MEMBER_NOT_FOUND');
    }

    const [payment] = await db('payments')
      .insert({
        user_id: data.memberId,
        centre_id: centreId,
        plan_id: data.planId,
        amount: data.amount,
        payment_mode: data.paymentMode,
        transaction_ref: data.transactionRef,
        status: 'completed',
        notes: data.notes,
        payment_type: 'offline'
      })
      .returning('*');

    if (data.planId) {
      const plan = await db('membership_plans').where('id', data.planId).first();
      if (plan) {
        const startDate = new Date();
        const endDate = new Date(startDate.getTime() + plan.duration_days * 24 * 60 * 60 * 1000);

        await db('user_memberships')
          .where('user_id', data.memberId)
          .whereIn('status', ['active', 'expired'])
          .update({ status: 'expired' });

        await db('user_memberships')
          .insert({
            user_id: data.memberId,
            plan_id: plan.id,
            plan_name: plan.name,
            duration_days: plan.duration_days,
            start_date: startDate,
            end_date: endDate,
            status: 'active'
          });
      }
    }

    await this.recordCommission(centreId, payment.id, data.memberId, data.amount);

    await this.logCentreActivity(centreId, staffId, 'offline_payment', {
      paymentId: payment.id,
      memberId: data.memberId,
      amount: data.amount
    });

    return payment;
  }

  async getStaff(centreId: string) {
    return db('centre_staff as cs')
      .select(
        'cs.*',
        'u.first_name',
        'u.last_name',
        'u.email',
        'u.phone',
        'u.status as user_status'
      )
      .leftJoin('users as u', 'u.id', 'cs.user_id')
      .where('cs.centre_id', centreId)
      .where('cs.is_active', true)
      .orderBy('cs.is_head', 'desc')
      .orderBy('u.first_name');
  }

  async addStaff(centreId: string, adminId: string, data: {
    userId: string;
    role: string;
    permissions: string[];
    isHead?: boolean;
  }) {
    const admin = await db('centre_staff')
      .where('user_id', adminId)
      .where('centre_id', centreId)
      .where('is_active', true)
      .first();

    if (!admin) {
      throw new AppError('Admin not found or not authorized', 403, 'UNAUTHORIZED');
    }

    if (admin.role !== 'centre_admin' && admin.role !== 'head') {
      throw new AppError('Only centre admin or head can add staff', 403, 'PERMISSION_DENIED');
    }

    const user = await db('users').where('id', data.userId).first();
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    const existing = await db('centre_staff')
      .where('centre_id', centreId)
      .where('user_id', data.userId)
      .first();

    if (existing) {
      throw new AppError('User is already staff at this centre', 400, 'ALREADY_EXISTS');
    }

    if (data.isHead) {
      await db('centre_staff')
        .where('centre_id', centreId)
        .update({ is_head: false });
    }

    const validRoles = ['staff', 'centre_admin', 'head'];
    if (!validRoles.includes(data.role)) {
      throw new AppError('Invalid staff role', 400, 'INVALID_ROLE');
    }

    const [staff] = await db('centre_staff')
      .insert({
        centre_id: centreId,
        user_id: data.userId,
        role: data.role,
        permissions: JSON.stringify(data.permissions || []),
        is_head: data.isHead || false,
        hired_at: new Date()
      })
      .returning('*');

    await this.logCentreActivity(centreId, adminId, 'staff_added', { staffId: staff.id, userId: data.userId, role: data.role });

    return staff;
  }

  async updateStaff(centreId: string, adminId: string, staffId: string, data: {
    role?: string;
    permissions?: string[];
    isHead?: boolean;
    isActive?: boolean;
  }) {
    const admin = await db('centre_staff')
      .where('user_id', adminId)
      .where('centre_id', centreId)
      .where('is_active', true)
      .first();

    if (!admin) {
      throw new AppError('Admin not found or not authorized', 403, 'UNAUTHORIZED');
    }

    if (admin.role !== 'centre_admin' && admin.role !== 'head') {
      throw new AppError('Only centre admin or head can modify staff', 403, 'PERMISSION_DENIED');
    }

    const staff = await db('centre_staff')
      .where('id', staffId)
      .where('centre_id', centreId)
      .first();

    if (!staff) {
      throw new AppError('Staff not found', 404, 'STAFF_NOT_FOUND');
    }

    if (data.isHead) {
      await db('centre_staff')
        .where('centre_id', centreId)
        .update({ is_head: false });
    }

    const [updated] = await db('centre_staff')
      .where('id', staffId)
      .where('centre_id', centreId)
      .update({
        role: data.role,
        permissions: data.permissions ? JSON.stringify(data.permissions) : undefined,
        is_head: data.isHead,
        is_active: data.isActive,
        updated_at: db.fn.now()
      })
      .returning('*');

    await this.logCentreActivity(centreId, adminId, 'staff_updated', { staffId, changes: data });

    return updated;
  }

  async removeStaff(centreId: string, adminId: string, staffId: string) {
    const admin = await db('centre_staff')
      .where('user_id', adminId)
      .where('centre_id', centreId)
      .where('is_active', true)
      .first();

    if (!admin) {
      throw new AppError('Admin not found or not authorized', 403, 'UNAUTHORIZED');
    }

    if (admin.role !== 'centre_admin' && admin.role !== 'head') {
      throw new AppError('Only centre admin or head can remove staff', 403, 'PERMISSION_DENIED');
    }

    const staff = await db('centre_staff')
      .where('id', staffId)
      .where('centre_id', centreId)
      .first();

    if (!staff) {
      throw new AppError('Staff not found', 404, 'STAFF_NOT_FOUND');
    }

    if (staff.is_head) {
      throw new AppError('Cannot remove centre head directly. Assign another head first.', 400, 'CANNOT_REMOVE_HEAD');
    }

    await db('centre_staff')
      .where('id', staffId)
      .update({ is_active: false });

    await this.logCentreActivity(centreId, adminId, 'staff_removed', { staffId });

    return { success: true };
  }

  async getCommissionReport(centreId: string, dateFrom?: string, dateTo?: string) {
    let query = db('commission_ledger')
      .where('centre_id', centreId)
      .orderBy('created_at', 'desc');

    if (dateFrom) {
      query = query.where('created_at', '>=', dateFrom);
    }

    if (dateTo) {
      query = query.where('created_at', '<=', dateTo);
    }

    const [records, summary] = await Promise.all([
      query,
      db('commission_ledger')
        .where('centre_id', centreId)
        .select(
          db.raw('COUNT(*) as total_transactions'),
          db.raw('SUM(gross_amount) as total_gross'),
          db.raw('SUM(commission_amount) as total_commission'),
          db.raw('SUM(CASE WHEN status = \'paid\' THEN commission_amount ELSE 0 END) as paid_commission'),
          db.raw('SUM(CASE WHEN status = \'pending\' THEN commission_amount ELSE 0 END) as pending_commission')
        )
        .first()
    ]);

    return {
      records,
      summary: {
        totalTransactions: Number(summary?.total_transactions || 0),
        totalGross: Number(summary?.total_gross || 0),
        totalCommission: Number(summary?.total_commission || 0),
        paidCommission: Number(summary?.paid_commission || 0),
        pendingCommission: Number(summary?.pending_commission || 0)
      }
    };
  }

  async getCentreMembers(centreId: string, filters: {
    status?: string;
    planId?: string;
    search?: string;
  }, page = 1, limit = 20) {
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
        'um.plan_name as membership_plan',
        'um.end_date as membership_expiry'
      )
      .leftJoin('user_profiles as up', 'up.user_id', 'u.id')
      .leftJoin('user_memberships as um', function () {
        this.on('um.user_id', 'u.id').onIn('um.status', ['active', 'expired']);
      })
      .where('u.centre_id', centreId)
      .orderBy('u.created_at', 'desc')
      .limit(limit)
      .offset(offset);

    if (filters.status) {
      query = query.where('u.status', filters.status);
    }

    if (filters.planId) {
      query = query.where('um.plan_id', filters.planId);
    }

    if (filters.search) {
      query = query.where(function () {
        this.whereILike('u.first_name', `%${filters.search}%`)
          .orWhereILike('u.last_name', `%${filters.search}%`)
          .orWhereILike('u.phone', `%${filters.search}%`);
      });
    }

    const [members, total] = await Promise.all([
      query,
      db('users').where('centre_id', centreId).count('id as count').first()
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

  async getPendingApprovals(centreId: string, page = 1, limit = 20) {
    const offset = (page - 1) * limit;

    const [requests, total] = await Promise.all([
      db('centre_approval_requests')
        .where('centre_id', centreId)
        .where('status', '!=', 'cancelled')
        .orderBy('created_at', 'desc')
        .limit(limit)
        .offset(offset),
      db('centre_approval_requests')
        .where('centre_id', centreId)
        .where('status', '!=', 'cancelled')
        .count('id as count')
        .first()
    ]);

    return {
      data: requests,
      pagination: {
        page,
        limit,
        total: Number(total?.count || 0),
        pages: Math.ceil(Number(total?.count || 0) / limit)
      }
    };
  }

  private async recordCommission(centreId: string, paymentId: string, memberId: string, amount: number) {
    const centre = await db('centres').where('id', centreId).first();
    if (!centre || !centre.franchise_id) return;

    const franchise = await db('franchises').where('id', centre.franchise_id).first();
    if (!franchise) return;

    const commissionRate = franchise.commission;
    const commissionAmount = amount * (commissionRate / 100);
    const netAmount = amount - commissionAmount;
    const periodMonth = new Date();

    await db('commission_ledger')
      .insert({
        centre_id: centreId,
        franchise_id: centre.franchise_id,
        payment_id: paymentId,
        member_id: memberId,
        gross_amount: amount,
        commission_rate: commissionRate,
        commission_amount: commissionAmount,
        net_amount: netAmount,
        period_month: periodMonth
      });
  }

  private async sendAppointmentConfirmation(appointment: any, slot: any) {
    try {
      const message = `Heritage Matrimony: Your appointment is confirmed for ${new Date(appointment.scheduled_at).toLocaleDateString()} at ${slot.start_time}. Type: ${appointment.appointment_type}. For queries call support.`;

      await this.smsService.sendSms(appointment.member_phone, message);

      if (appointment.member_email) {
        await this.emailService.sendEmail({
          to: appointment.member_email,
          subject: 'Appointment Confirmed - Heritage Matrimony',
          html: `<p>Your appointment has been confirmed.</p>
                 <p><strong>Date:</strong> ${new Date(appointment.scheduled_at).toLocaleDateString()}</p>
                 <p><strong>Time:</strong> ${slot.start_time}</p>
                 <p><strong>Type:</strong> ${appointment.appointment_type}</p>`
        });
      }

      await this.notificationService.createNotification({
        userId: appointment.member_id,
        type: 'appointment_confirmed',
        title: 'Appointment Confirmed',
        body: `Your ${appointment.appointment_type} appointment is confirmed for ${new Date(appointment.scheduled_at).toLocaleDateString()}`,
        data: { appointmentId: appointment.id }
      });
    } catch (error) {
      logger.error('Failed to send appointment confirmation', { error, appointment });
    }
  }

  private async sendCancellationNotification(appointment: any) {
    try {
      await this.smsService.sendSms(
        appointment.member_phone,
        'Heritage Matrimony: Your appointment has been cancelled. Please book a new slot or call support.'
      );

      if (appointment.member_id) {
        await this.notificationService.createNotification({
          userId: appointment.member_id,
          type: 'appointment_cancelled',
          title: 'Appointment Cancelled',
          body: 'Your appointment has been cancelled.',
          data: { appointmentId: appointment.id }
        });
      }
    } catch (error) {
      logger.error('Failed to send cancellation notification', { error });
    }
  }

  private async logCentreActivity(centreId: string, userId: string, action: string, details: any) {
    try {
      await db('centre_activity_logs').insert({
        centre_id: centreId,
        user_id: userId,
        action,
        details: JSON.stringify(details)
      }).catch(() => {});
    } catch (error) {
      logger.error('Failed to log centre activity', { error });
    }
  }
}
