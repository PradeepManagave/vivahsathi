import { db } from '../../config/database';
import { redis } from '../../config/redis';
import logger from '../../config/logger';
import { AppError } from '../../shared/utils/errors';
import { videoService } from '../../shared/services/video.service';
import { NotificationService } from '../notifications/notification.service';

const MAX_CALLS_PER_DAY = 5;
const RATE_LIMIT_WINDOW = 24 * 60 * 60 * 1000;

export interface VideoCall {
  id: string;
  callerId: string;
  receiverId: string;
  roomName: string;
  roomUrl?: string;
  status: 'pending' | 'ringing' | 'accepted' | 'declined' | 'missed' | 'completed' | 'declined';
  startedAt?: Date;
  endedAt?: Date;
  duration?: number;
  recordingConsentGiven: boolean;
  recordingUrl?: string;
  createdAt: Date;
}

export class VideoChatService {
  private notificationService: NotificationService;

  constructor() {
    this.notificationService = new NotificationService();
  }

  async initiateCall(callerId: string, receiverId: string) {
    if (callerId === receiverId) {
      throw new AppError('Cannot call yourself', 400, 'INVALID_CALL');
    }

    await this.checkRateLimit(callerId);

    const [caller, receiver] = await Promise.all([
      db('users').where('id', callerId).first(),
      db('users').where('id', receiverId).first()
    ]);

    if (!caller) {
      throw new AppError('Caller not found', 404, 'USER_NOT_FOUND');
    }

    if (!receiver) {
      throw new AppError('Receiver not found', 404, 'USER_NOT_FOUND');
    }

    const mutualInterest = await this.checkMutualInterest(callerId, receiverId);
    if (!mutualInterest) {
      throw new AppError(
        'Video call requires mutual interest. Both users must express interest in each other first.',
        403,
        'NO_MUTUAL_INTEREST'
      );
    }

    const bothPaid = await this.checkBothPaidMembers(callerId, receiverId);
    if (!bothPaid) {
      throw new AppError(
        'Video chat is only available for paid members',
        403,
        'NOT_PAID_MEMBER'
      );
    }

    const existingCall = await db('video_calls')
      .whereIn('status', ['pending', 'ringing', 'accepted'])
      .where(function () {
        this.where(function () {
          this.where('caller_id', callerId).where('receiver_id', receiverId);
        }).orWhere(function () {
          this.where('caller_id', receiverId).where('receiver_id', callerId);
        });
      })
      .first();

    if (existingCall) {
      throw new AppError('An active call already exists between you and this user', 400, 'CALL_EXISTS');
    }

    const roomName = videoService.generateRoomName('chat', `${callerId.slice(0, 8)}-${receiverId.slice(0, 8)}`);
    const room = await videoService.createRoom({
      name: roomName,
      privacy: 'private',
      expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
      maxParticipants: 2,
      enableRecording: false,
      enableChat: true,
      enableScreenShare: false
    });

    const [call] = await db('video_calls')
      .insert({
        caller_id: callerId,
        receiver_id: receiverId,
        room_name: roomName,
        room_url: room.url,
        status: 'pending',
        recording_consent_given: false
      })
      .returning('*');

    await this.notificationService.createNotification({
      userId: receiverId,
      type: 'video_call_request',
      title: 'Incoming Video Call',
      body: `${caller.first_name} ${caller.last_name || ''} is requesting a video call. Tap to answer.`,
      data: { callId: call.id, callerId }
    });

    await redis.setex(
      `video_call:pending:${call.id}`,
      120,
      JSON.stringify({ callerId, receiverId, createdAt: new Date().toISOString() })
    );

    logger.info('Video call initiated', { callId: call.id, callerId, receiverId });

    return call;
  }

  async acceptCall(callId: string, acceptorId: string) {
    const call = await db('video_calls').where('id', callId).first();

    if (!call) {
      throw new AppError('Call not found', 404, 'CALL_NOT_FOUND');
    }

    if (call.receiver_id !== acceptorId) {
      throw new AppError('Not authorized to accept this call', 403, 'UNAUTHORIZED');
    }

    if (call.status !== 'pending') {
      throw new AppError('Call is no longer pending', 400, 'INVALID_STATUS');
    }

    const [updated] = await db('video_calls')
      .where('id', callId)
      .update({
        status: 'accepted',
        started_at: db.fn.now()
      })
      .returning('*');

    await this.notificationService.createNotification({
      userId: call.caller_id,
      type: 'video_call_accepted',
      title: 'Call Accepted',
      body: 'Your video call request was accepted. Join now!',
      data: { callId }
    });

    await redis.del(`video_call:pending:${callId}`);

    logger.info('Video call accepted', { callId, acceptorId });

    return updated;
  }

  async declineCall(callId: string, declinerId: string) {
    const call = await db('video_calls').where('id', callId).first();

    if (!call) {
      throw new AppError('Call not found', 404, 'CALL_NOT_FOUND');
    }

    if (call.receiver_id !== declinerId) {
      throw new AppError('Not authorized to decline this call', 403, 'UNAUTHORIZED');
    }

    if (call.status !== 'pending') {
      throw new AppError('Call is no longer pending', 400, 'INVALID_STATUS');
    }

    const [updated] = await db('video_calls')
      .where('id', callId)
      .update({
        status: 'declined',
        ended_at: db.fn.now()
      })
      .returning('*');

    await this.notificationService.createNotification({
      userId: call.caller_id,
      type: 'video_call_declined',
      title: 'Call Declined',
      body: 'The video call request was declined.',
      data: { callId }
    });

    await redis.del(`video_call:pending:${callId}`);
    await videoService.deleteRoom(call.room_name);

    logger.info('Video call declined', { callId, declinerId });

    return updated;
  }

  async joinCall(callId: string, userId: string) {
    const call = await db('video_calls').where('id', callId).first();

    if (!call) {
      throw new AppError('Call not found', 404, 'CALL_NOT_FOUND');
    }

    if (call.caller_id !== userId && call.receiver_id !== userId) {
      throw new AppError('Not authorized to join this call', 403, 'UNAUTHORIZED');
    }

    if (['declined', 'missed', 'completed'].includes(call.status)) {
      throw new AppError('Call is no longer active', 400, 'CALL_ENDED');
    }

    const isOwner = call.caller_id === userId;
    const user = await db('users').where('id', userId).first();
    const userName = `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'User';

    const tokenResponse = await videoService.createToken({
      roomName: call.room_name,
      userId,
      userName,
      isOwner,
      expiresIn: 3600
    });

    await redis.setex(
      `video_call:active:${callId}:${userId}`,
      3600,
      JSON.stringify({ joinedAt: new Date().toISOString() })
    );

    if (call.status === 'pending' && !isOwner) {
      await this.acceptCall(callId, userId);
    }

    logger.info('Joined video call', { callId, userId });

    return {
      ...call,
      token: tokenResponse.token,
      expiresAt: new Date(tokenResponse.exp * 1000)
    };
  }

  async endCall(callId: string, userId: string) {
    const call = await db('video_calls').where('id', callId).first();

    if (!call) {
      throw new AppError('Call not found', 404, 'CALL_NOT_FOUND');
    }

    if (call.caller_id !== userId && call.receiver_id !== userId) {
      throw new AppError('Not authorized to end this call', 403, 'UNAUTHORIZED');
    }

    if (!['pending', 'ringing', 'accepted'].includes(call.status)) {
      throw new AppError('Call is already ended', 400, 'INVALID_STATUS');
    }

    const startedAt = call.started_at ? new Date(call.started_at).getTime() : Date.now();
    const duration = Math.floor((Date.now() - startedAt) / 1000);

    const [updated] = await db('video_calls')
      .where('id', callId)
      .update({
        status: 'completed',
        ended_at: db.fn.now(),
        duration
      })
      .returning('*');

    await redis.del(`video_call:pending:${callId}`);
    await redis.del(`video_call:active:${callId}:${call.caller_id}`);
    await redis.del(`video_call:active:${callId}:${call.receiver_id}`);

    await videoService.deleteRoom(call.room_name);

    logger.info('Video call ended', { callId, userId, duration });

    return updated;
  }

  async giveRecordingConsent(callId: string, userId: string, consent: boolean) {
    const call = await db('video_calls').where('id', callId).first();

    if (!call) {
      throw new AppError('Call not found', 404, 'CALL_NOT_FOUND');
    }

    if (call.caller_id !== userId && call.receiver_id !== userId) {
      throw new AppError('Not authorized for this call', 403, 'UNAUTHORIZED');
    }

    if (call.status !== 'accepted') {
      throw new AppError('Recording consent only available during active calls', 400, 'INVALID_STATUS');
    }

    const bothConsented = await this.checkBothRecordingConsent(callId, userId, consent);

    const [updated] = await db('video_calls')
      .where('id', callId)
      .update({
        recording_consent_given: bothConsented
      })
      .returning('*');

    if (bothConsented && consent) {
      logger.info('Recording consent given by both parties', { callId });
    }

    return {
      ...updated,
      recordingEnabled: bothConsented
    };
  }

  async getCallHistory(userId: string, page = 1, limit = 20) {
    const offset = (page - 1) * limit;

    const [calls, total] = await Promise.all([
      db('video_calls as vc')
        .select(
          'vc.*',
          'c.first_name as caller_first_name',
          'c.last_name as caller_last_name',
          'c.avatar_url as caller_avatar',
          'r.first_name as receiver_first_name',
          'r.last_name as receiver_last_name',
          'r.avatar_url as receiver_avatar'
        )
        .leftJoin('users as c', 'c.id', 'vc.caller_id')
        .leftJoin('users as r', 'r.id', 'vc.receiver_id')
        .where('vc.caller_id', userId)
        .orWhere('vc.receiver_id', userId)
        .orderBy('vc.created_at', 'desc')
        .limit(limit)
        .offset(offset),
      db('video_calls')
        .where('caller_id', userId)
        .orWhere('receiver_id', userId)
        .count('id as count')
        .first()
    ]);

    return {
      data: calls,
      pagination: {
        page,
        limit,
        total: Number(total?.count || 0),
        pages: Math.ceil(Number(total?.count || 0) / limit)
      }
    };
  }

  async getIncomingCalls(userId: string) {
    const calls = await db('video_calls as vc')
      .select(
        'vc.*',
        'c.first_name as caller_first_name',
        'c.last_name as caller_last_name',
        'c.avatar_url as caller_avatar'
      )
      .leftJoin('users as c', 'c.id', 'vc.caller_id')
      .where('vc.receiver_id', userId)
      .where('vc.status', 'pending')
      .where('vc.created_at', '>=', new Date(Date.now() - 5 * 60 * 1000))
      .orderBy('vc.created_at', 'desc');

    return calls;
  }

  async getCallDetails(callId: string, userId: string) {
    const call = await db('video_calls as vc')
      .select(
        'vc.*',
        'c.first_name as caller_first_name',
        'c.last_name as caller_last_name',
        'c.avatar_url as caller_avatar',
        'c.phone as caller_phone',
        'r.first_name as receiver_first_name',
        'r.last_name as receiver_last_name',
        'r.avatar_url as receiver_avatar',
        'r.phone as receiver_phone'
      )
      .leftJoin('users as c', 'c.id', 'vc.caller_id')
      .leftJoin('users as r', 'r.id', 'vc.receiver_id')
      .where('vc.id', callId)
      .first();

    if (!call) {
      throw new AppError('Call not found', 404, 'CALL_NOT_FOUND');
    }

    if (call.caller_id !== userId && call.receiver_id !== userId) {
      throw new AppError('Not authorized to view this call', 403, 'UNAUTHORIZED');
    }

    return call;
  }

  private async checkRateLimit(userId: string): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayCalls = await db('video_calls')
      .where('caller_id', userId)
      .where('created_at', '>=', today)
      .count('id as count')
      .first();

    const callCount = Number(todayCalls?.count || 0);

    if (callCount >= MAX_CALLS_PER_DAY) {
      throw new AppError(
        `You have reached the maximum of ${MAX_CALLS_PER_DAY} video calls per day. Please try again tomorrow.`,
        429,
        'RATE_LIMIT_EXCEEDED'
      );
    }

    const pendingCall = await db('video_calls')
      .where('caller_id', userId)
      .whereIn('status', ['pending', 'ringing', 'accepted'])
      .first();

    if (pendingCall) {
      throw new AppError(
        'You have an active or pending call. Please end it before making a new call.',
        400,
        'CALL_IN_PROGRESS'
      );
    }
  }

  private async checkMutualInterest(callerId: string, receiverId: string): Promise<boolean> {
    const [callerInterest, receiverInterest] = await Promise.all([
      db('interest_requests')
        .where('sender_id', callerId)
        .where('receiver_id', receiverId)
        .where('status', 'accepted')
        .first(),
      db('interest_requests')
        .where('sender_id', receiverId)
        .where('receiver_id', callerId)
        .where('status', 'accepted')
        .first()
    ]);

    return !!(callerInterest && receiverInterest);
  }

  private async checkBothPaidMembers(callerId: string, receiverId: string): Promise<boolean> {
    const [callerMembership, receiverMembership] = await Promise.all([
      db('user_memberships')
        .where('user_id', callerId)
        .where('status', 'active')
        .first(),
      db('user_memberships')
        .where('user_id', receiverId)
        .where('status', 'active')
        .first()
    ]);

    return !!(callerMembership && receiverMembership);
  }

  private async checkBothRecordingConsent(callId: string, currentUserId: string, consent: boolean): Promise<boolean> {
    const call = await db('video_calls').where('id', callId).first();
    if (!call) return false;

    const otherUserId = call.caller_id === currentUserId ? call.receiver_id : call.caller_id;

    if (!consent) {
      return false;
    }

    const consentKey = `video_call:consent:${callId}:${otherUserId}`;

    if (consent) {
      await redis.setex(consentKey, 3600, JSON.stringify({ consented: true, at: new Date().toISOString() }));
    }

    const otherConsent = await redis.get(consentKey);

    return !!otherConsent;
  }
}

export const videoChatService = new VideoChatService();
