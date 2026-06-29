import { db } from '../../config/database';
import { redis } from '../../config/redis';
import logger from '../../config/logger';
import { AppError } from '../../shared/utils/errors';
import { videoService } from '../../shared/services/video.service';
import { NotificationService } from '../notifications/notification.service';

export interface VideoKycSession {
  id: string;
  userId: string;
  sessionType: 'video_call' | 'video_verification';
  status: 'pending' | 'scheduled' | 'in_progress' | 'completed' | 'failed' | 'cancelled' | 'no_show' | 'approved' | 'rejected';
  scheduledAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  roomId?: string;
  roomUrl?: string;
  roomToken?: string;
  recordingUrl?: string;
  verificationScore?: number;
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  verificationNotes?: string;
}

export interface KycSlot {
  id: string;
  centreId: string;
  staffId: string;
  slotDate: string;
  startTime: string;
  endTime: string;
  maxParticipants: number;
  currentParticipants: number;
  kycType: 'centre' | 'online';
  status: 'available' | 'booked' | 'completed' | 'cancelled';
}

export class VideoKycService {
  private notificationService: NotificationService;

  constructor() {
    this.notificationService = new NotificationService();
  }

  async createSession(userId: string, sessionType: string = 'video_verification', scheduledAt?: Date) {
    const user = await db('users').where('id', userId).first();
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    const existingSession = await db('video_kyc_sessions')
      .where('user_id', userId)
      .whereIn('status', ['pending', 'scheduled', 'in_progress'])
      .first();

    if (existingSession) {
      throw new AppError('You already have a pending KYC session', 400, 'SESSION_EXISTS');
    }

    const roomId = videoService.generateRoomName('kyc', userId);
    const room = await videoService.createRoom({
      name: roomId,
      privacy: 'private',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      maxParticipants: 3,
      enableRecording: true,
      enableChat: true
    });

    const [session] = await db('video_kyc_sessions')
      .insert({
        user_id: userId,
        session_type: sessionType,
        status: scheduledAt ? 'scheduled' : 'pending',
        scheduled_at: scheduledAt,
        room_id: roomId,
        room_url: room.url,
        expiry_minutes: 30
      })
      .returning('*');

    await this.logAction(userId, null, session.id, 'session_created', null, {
      sessionType,
      scheduledAt,
      roomId
    });

    logger.info('Created KYC session', { sessionId: session.id, userId, roomId });

    return session;
  }

  async scheduleSlot(staffId: string, data: {
    centreId: string;
    slotDate: string;
    startTime: string;
    endTime: string;
    kycType: 'centre' | 'online';
    maxParticipants?: number;
  }) {
    const [slot] = await db('kyc_slots')
      .insert({
        centre_id: data.centreId,
        staff_id: staffId,
        slot_date: data.slotDate,
        start_time: data.startTime,
        end_time: data.endTime,
        max_participants: data.maxParticipants || 5,
        current_participants: 0,
        kyc_type: data.kycType,
        status: 'available'
      })
      .returning('*');

    logger.info('Created KYC slot', { slotId: slot.id, staffId });

    return slot;
  }

  async getAvailableSlots(centreId?: string, date?: string) {
    let query = db('kyc_slots as ks')
      .select(
        'ks.*',
        'c.name as centre_name',
        'u.first_name as staff_first_name',
        'u.last_name as staff_last_name'
      )
      .leftJoin('centres as c', 'c.id', 'ks.centre_id')
      .leftJoin('users as u', 'u.id', 'ks.staff_id')
      .where('ks.status', 'available')
      .where('ks.slot_date', '>=', new Date().toISOString().split('T')[0]);

    if (centreId) {
      query = query.where('ks.centre_id', centreId);
    }

    if (date) {
      query = query.where('ks.slot_date', date);
    }

    const slots = await query.orderBy(['ks.slot_date', 'ks.start_time']);

    return slots;
  }

  async bookSlot(userId: string, slotId: string) {
    const slot = await db('kyc_slots').where('id', slotId).first();
    if (!slot) {
      throw new AppError('Slot not found', 404, 'SLOT_NOT_FOUND');
    }

    if (slot.status !== 'available') {
      throw new AppError('Slot is not available', 400, 'SLOT_UNAVAILABLE');
    }

    if (slot.current_participants >= slot.max_participants) {
      throw new AppError('Slot is fully booked', 400, 'SLOT_FULL');
    }

    const user = await db('users').where('id', userId).first();
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    const roomId = videoService.generateRoomName('kyc-centre', userId);
    const room = await videoService.createRoom({
      name: roomId,
      privacy: 'private',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      maxParticipants: 3,
      enableRecording: true,
      enableChat: true
    });

    await db('kyc_slots')
      .where('id', slotId)
      .increment('current_participants', 1);

    const [session] = await db('video_kyc_sessions')
      .insert({
        user_id: userId,
        slot_id: slotId,
        session_type: 'video_verification',
        status: 'scheduled',
        scheduled_at: new Date(`${slot.slot_date}T${slot.start_time}`),
        room_id: roomId,
        room_url: room.url,
        expiry_minutes: 30
      })
      .returning('*');

    await this.notificationService.createNotification({
      userId,
      type: 'kyc_scheduled',
      title: 'KYC Slot Booked',
      body: `Your centre KYC is scheduled for ${slot.slot_date} at ${slot.start_time}`
    });

    logger.info('Booked KYC slot', { sessionId: session.id, userId, slotId });

    return session;
  }

  async getSession(sessionId: string, userId?: string) {
    const query = db('video_kyc_sessions').where('id', sessionId);
    if (userId) {
      query.where('user_id', userId);
    }
    return query.first();
  }

  async getUserSessions(userId: string, status?: string) {
    let query = db('video_kyc_sessions')
      .where('user_id', userId)
      .orderBy('created_at', 'desc');

    if (status) {
      query = query.where('status', status);
    }

    return query;
  }

  async getUserKycStatus(userId: string) {
    const latestSession = await db('video_kyc_sessions')
      .where('user_id', userId)
      .orderBy('created_at', 'desc')
      .first();

    const user = await db('users')
      .select('profile_kyc_verified', 'profile_updated_at', 'kyc_last_verified_at')
      .where('id', userId)
      .first();

    const pendingChanges = await this.checkPendingProfileChanges(userId);

    return {
      status: latestSession?.status || 'not_started',
      kycStatus: latestSession?.status === 'approved' ? 'verified' : 'unverified',
      hasVerifiedBadge: user?.profile_kyc_verified || false,
      lastKycDate: user?.kyc_last_verified_at || null,
      pendingChanges,
      currentSession: latestSession
    };
  }

  async joinSession(sessionId: string, userId: string) {
    const session = await db('video_kyc_sessions')
      .where('id', sessionId)
      .first();

    if (!session) {
      throw new AppError('Session not found', 404, 'SESSION_NOT_FOUND');
    }

    if (session.user_id !== userId) {
      const staff = await db('centre_staff')
        .where('user_id', userId)
        .first();

      if (!staff) {
        throw new AppError('Not authorized to join this session', 403, 'UNAUTHORIZED');
      }
    }

    if (['completed', 'cancelled', 'failed', 'approved', 'rejected'].includes(session.status)) {
      throw new AppError('Session is no longer active', 400, 'SESSION_ENDED');
    }

    const isOwner = session.user_id !== userId;
    const user = await db('users').where('id', userId).first();
    const userName = `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'User';

    const tokenResponse = await videoService.createToken({
      roomName: session.room_id,
      userId,
      userName,
      isOwner,
      expiresIn: 3600
    });

    if (session.status === 'pending' || session.status === 'scheduled') {
      await db('video_kyc_sessions')
        .where('id', sessionId)
        .update({
          status: 'in_progress',
          started_at: db.fn.now()
        });
    }

    await redis.setex(
      `kyc:session:${sessionId}:participant:${userId}`,
      3600,
      JSON.stringify({ joinedAt: new Date().toISOString() })
    );

    await this.logAction(userId, null, sessionId, 'session_joined', null, {
      isOwner,
      roomId: session.room_id
    });

    logger.info('Joined KYC session', { sessionId, userId, isOwner });

    return {
      ...session,
      token: tokenResponse.token,
      roomId: session.room_id,
      roomUrl: session.room_url,
      expiresAt: new Date(tokenResponse.exp * 1000)
    };
  }

  async completeSession(sessionId: string, userId: string, notes?: string, recordingUrl?: string) {
    const session = await db('video_kyc_sessions')
      .where('id', sessionId)
      .first();

    if (!session) {
      throw new AppError('Session not found', 404, 'SESSION_NOT_FOUND');
    }

    if (session.status !== 'in_progress') {
      throw new AppError('Session is not in progress', 400, 'INVALID_STATUS');
    }

    const [updated] = await db('video_kyc_sessions')
      .where('id', sessionId)
      .update({
        status: 'completed',
        completed_at: db.fn.now(),
        recording_url: recordingUrl,
        notes,
        updated_at: db.fn.now()
      })
      .returning('*');

    await this.logAction(session.user_id, null, sessionId, 'session_completed', userId, {
      recordingUrl,
      notes
    });

    logger.info('Completed KYC session', { sessionId, userId });

    return updated;
  }

  async cancelSession(sessionId: string, userId: string, reason?: string) {
    const session = await db('video_kyc_sessions')
      .where('id', sessionId)
      .first();

    if (!session) {
      throw new AppError('Session not found', 404, 'SESSION_NOT_FOUND');
    }

    if (session.user_id !== userId) {
      const staff = await db('centre_staff')
        .where('user_id', userId)
        .first();

      if (!staff) {
        throw new AppError('Not authorized to cancel this session', 403, 'UNAUTHORIZED');
      }
    }

    if (['completed', 'cancelled', 'failed', 'approved', 'rejected'].includes(session.status)) {
      throw new AppError('Session cannot be cancelled', 400, 'INVALID_STATUS');
    }

    const [updated] = await db('video_kyc_sessions')
      .where('id', sessionId)
      .update({
        status: 'cancelled',
        notes: reason,
        updated_at: db.fn.now()
      })
      .returning('*');

    if (session.slot_id) {
      await db('kyc_slots')
        .where('id', session.slot_id)
        .decrement('current_participants', 1)
        .update({ status: 'available' });
    }

    await videoService.deleteRoom(session.room_id);

    await this.logAction(session.user_id, null, sessionId, 'session_cancelled', userId, { reason });

    await this.notificationService.createNotification({
      userId: session.user_id,
      type: 'kyc_cancelled',
      title: 'KYC Session Cancelled',
      body: reason ? `Your KYC session was cancelled. Reason: ${reason}` : 'Your KYC session was cancelled.'
    });

    logger.info('Cancelled KYC session', { sessionId, userId, reason });

    return updated;
  }

  async approveKyc(sessionId: string, reviewerId: string, notes?: string) {
    const session = await db('video_kyc_sessions').where('id', sessionId).first();
    if (!session) {
      throw new AppError('Session not found', 404, 'SESSION_NOT_FOUND');
    }

    if (session.status !== 'completed' && session.status !== 'in_progress') {
      throw new AppError('Session must be completed or in progress to approve', 400, 'INVALID_STATUS');
    }

    const [updated] = await db('video_kyc_sessions')
      .where('id', sessionId)
      .update({
        status: 'approved',
        completed_at: db.fn.now(),
        reviewed_by: reviewerId,
        reviewed_at: db.fn.now(),
        verification_notes: notes,
        updated_at: db.fn.now()
      })
      .returning('*');

    await db('users')
      .where('id', session.user_id)
      .update({
        profile_kyc_verified: true,
        kyc_last_verified_at: db.fn.now(),
        kyc_verification_count: db.raw('COALESCE(kyc_verification_count, 0) + 1')
      });

    await db('user_profiles')
      .where('user_id', session.user_id)
      .update({
        kyc_status: 'verified',
        kyc_verified_at: db.fn.now(),
        kyc_verified_by: reviewerId
      });

    await this.logAction(session.user_id, null, sessionId, 'kyc_approved', reviewerId, { notes });

    await this.notificationService.createNotification({
      userId: session.user_id,
      type: 'kyc_approved',
      title: 'KYC Verified',
      body: 'Congratulations! Your profile has been verified. You now have a verified badge on your profile.'
    });

    logger.info('Approved KYC', { sessionId, reviewerId, userId: session.user_id });

    return updated;
  }

  async rejectKyc(sessionId: string, reviewerId: string, reason: string) {
    if (!reason || reason.trim().length < 10) {
      throw new AppError('Rejection reason must be at least 10 characters', 400, 'INVALID_REASON');
    }

    const session = await db('video_kyc_sessions').where('id', sessionId).first();
    if (!session) {
      throw new AppError('Session not found', 404, 'SESSION_NOT_FOUND');
    }

    if (session.status !== 'completed' && session.status !== 'in_progress') {
      throw new AppError('Session must be completed or in progress to reject', 400, 'INVALID_STATUS');
    }

    const [updated] = await db('video_kyc_sessions')
      .where('id', sessionId)
      .update({
        status: 'rejected',
        completed_at: db.fn.now(),
        reviewed_by: reviewerId,
        reviewed_at: db.fn.now(),
        rejection_reason: reason,
        updated_at: db.fn.now()
      })
      .returning('*');

    await this.logAction(session.user_id, null, sessionId, 'kyc_rejected', reviewerId, { reason });

    await this.notificationService.createNotification({
      userId: session.user_id,
      type: 'kyc_rejected',
      title: 'KYC Verification Failed',
      body: `Your KYC verification was not approved. Reason: ${reason}. Please book another session.`
    });

    logger.info('Rejected KYC', { sessionId, reviewerId, userId: session.user_id, reason });

    return updated;
  }

  async submitDocument(
    userId: string,
    documentType: string,
    documentNumber: string,
    frontImageUrl: string,
    backImageUrl?: string,
    expiryDate?: Date
  ) {
    const [existing] = await db('kyc_documents')
      .where('user_id', userId)
      .where('document_type', documentType)
      .whereNotIn('verification_status', ['rejected', 'expired']);

    if (existing) {
      const [updated] = await db('kyc_documents')
        .where('id', existing.id)
        .update({
          document_number: documentNumber,
          front_image_url: frontImageUrl,
          back_image_url: backImageUrl,
          expiry_date: expiryDate,
          verification_status: 'pending',
          updated_at: db.fn.now()
        })
        .returning('*');

      await this.logAction(userId, existing.id, null, 'document_updated', null, { documentType });
      return updated;
    }

    const [document] = await db('kyc_documents')
      .insert({
        user_id: userId,
        document_type: documentType,
        document_number: documentNumber,
        front_image_url: frontImageUrl,
        back_image_url: backImageUrl,
        expiry_date: expiryDate
      })
      .returning('*');

    await this.logAction(userId, document.id, null, 'document_submitted', null, { documentType });

    return document;
  }

  async getUserDocuments(userId: string) {
    return db('kyc_documents')
      .where('user_id', userId)
      .orderBy('created_at', 'desc');
  }

  async getDocument(documentId: string, userId?: string) {
    const query = db('kyc_documents').where('id', documentId);
    if (userId) {
      query.where('user_id', userId);
    }
    return query.first();
  }

  async verifyDocument(
    documentId: string,
    reviewerId: string,
    status: 'verified' | 'rejected',
    rejectionReason?: string
  ) {
    const document = await db('kyc_documents').where('id', documentId).first();
    if (!document) {
      throw new AppError('Document not found', 404, 'NOT_FOUND');
    }

    const [updated] = await db('kyc_documents')
      .where('id', documentId)
      .update({
        verification_status: status,
        verified_by: reviewerId,
        verified_at: db.fn.now(),
        rejection_reason: rejectionReason,
        updated_at: db.fn.now()
      })
      .returning('*');

    await this.logAction(document.user_id, documentId, null, `document_${status}`, reviewerId, {
      rejectionReason
    });

    await this.notificationService.createNotification({
      userId: document.user_id,
      type: status === 'verified' ? 'kyc_document_verified' : 'kyc_document_rejected',
      title: status === 'verified' ? 'Document Verified' : 'Document Verification Failed',
      body: status === 'verified'
        ? 'Your submitted document has been verified.'
        : `Document verification failed: ${rejectionReason}`,
      data: { documentId }
    });

    return updated;
  }

  async evaluateSession(
    sessionId: string,
    reviewerId: string,
    criteria: { name: string; score: number; notes?: string }[]
  ) {
    const session = await db('video_kyc_sessions').where('id', sessionId).first();
    if (!session) {
      throw new AppError('Session not found', 404, 'SESSION_NOT_FOUND');
    }

    const records = criteria.map(c => ({
      session_id: sessionId,
      reviewer_id: reviewerId,
      criteria_name: c.name,
      criteria_score: c.score,
      notes: c.notes
    }));

    await db('video_kyc_evaluations').insert(records);

    const avgScore = criteria.reduce((sum, c) => sum + c.score, 0) / criteria.length;

    const [updated] = await db('video_kyc_sessions')
      .where('id', sessionId)
      .update({
        verification_score: Math.round(avgScore * 10),
        updated_at: db.fn.now()
      })
      .returning('*');

    await this.logAction(session.user_id, null, sessionId, 'session_evaluated', reviewerId, {
      criteria,
      avgScore
    });

    return updated;
  }

  async getPendingVerifications(page = 1, limit = 20) {
    const offset = (page - 1) * limit;

    const [documents, total] = await Promise.all([
      db('kyc_documents as d')
        .select(
          'd.*',
          'u.first_name',
          'u.last_name',
          'u.email',
          'u.phone'
        )
        .leftJoin('users as u', 'u.id', 'd.user_id')
        .where('d.verification_status', 'pending')
        .orderBy('d.created_at', 'asc')
        .limit(limit)
        .offset(offset),
      db('kyc_documents')
        .where('verification_status', 'pending')
        .count('id as count')
        .first()
    ]);

    return {
      data: documents,
      pagination: {
        page,
        limit,
        total: Number(total?.count || 0),
        pages: Math.ceil(Number(total?.count || 0) / limit)
      }
    };
  }

  async getPendingSessions(centreId?: string, page = 1, limit = 20) {
    const offset = (page - 1) * limit;

    let query = db('video_kyc_sessions as s')
      .select(
        's.*',
        'u.first_name',
        'u.last_name',
        'u.email',
        'u.phone',
        'u.avatar_url'
      )
      .leftJoin('users as u', 'u.id', 's.user_id')
      .whereIn('s.status', ['pending', 'scheduled', 'in_progress', 'completed'])
      .orderBy('s.scheduled_at', 'asc')
      .limit(limit)
      .offset(offset);

    if (centreId) {
      query = query.leftJoin('kyc_slots as ks', 'ks.id', 's.slot_id')
        .where('ks.centre_id', centreId);
    }

    const [sessions, total] = await Promise.all([
      query,
      db('video_kyc_sessions')
        .whereIn('status', ['pending', 'scheduled', 'in_progress', 'completed'])
        .count('id as count')
        .first()
    ]);

    return {
      data: sessions,
      pagination: {
        page,
        limit,
        total: Number(total?.count || 0),
        pages: Math.ceil(Number(total?.count || 0) / limit)
      }
    };
  }

  async triggerReKyc(userId: string, triggerFields: string[]) {
    const user = await db('users').where('id', userId).first();
    if (!user) return;

    if (user.profile_kyc_verified) {
      await db('users')
        .where('id', userId)
        .update({
          profile_kyc_verified: false,
          kyc_triggered_fields: JSON.stringify(triggerFields),
          kyc_triggered_at: db.fn.now()
        });

      await this.notificationService.createNotification({
        userId,
        type: 'rekyc_required',
        title: 'Re-verification Required',
        body: `Your profile was updated with changes that require re-verification: ${triggerFields.join(', ')}. Please schedule a new KYC session.`
      });

      logger.info('Re-KYC triggered', { userId, triggerFields });
    }
  }

  private async checkPendingProfileChanges(userId: string): Promise<boolean> {
    const user = await db('users').where('id', userId).first();
    if (!user) return false;

    if (!user.kyc_triggered_fields) return false;

    try {
      const triggeredFields = JSON.parse(user.kyc_triggered_fields) as string[];
      return triggeredFields.length > 0;
    } catch {
      return false;
    }
  }

  private generateMeetingToken(roomId: string, userId: string): string {
    const payload = {
      roomId,
      userId,
      permissions: ['publish', 'subscribe'],
      exp: Math.floor(Date.now() / 1000) + 3600
    };

    return Buffer.from(JSON.stringify(payload)).toString('base64');
  }

  private async logAction(
    userId: string,
    documentId: string | null,
    sessionId: string | null,
    action: string,
    performedBy: string | null,
    details: Record<string, unknown>
  ) {
    try {
      await db('kyc_verification_logs').insert({
        user_id: userId,
        document_id: documentId,
        session_id: sessionId,
        action,
        performed_by: performedBy,
        details: JSON.stringify(details)
      });
    } catch (error) {
      logger.error('Failed to log KYC action', { error, userId, action });
    }
  }
}

export const videoKycService = new VideoKycService();
