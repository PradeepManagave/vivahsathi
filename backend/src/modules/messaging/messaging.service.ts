import { Knex } from 'knex';
import { db } from '../../config/database';
import { redis } from '../../config/redis';
import logger from '../../config/logger';
import { AppError } from '../../shared/utils/errors';
import { NotificationService } from '../notifications/notification.service';
import { requireContactAccess } from '../../shared/middleware/membership';

export interface InterestRequest {
  id: string;
  senderId: string;
  receiverId: string;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  respondedAt?: Date;
  createdAt: Date;
}

export interface ChatConversation {
  id: string;
  participant1: string;
  participant2: string;
  lastMessageAt?: Date;
  lastMessagePreview?: string;
  participant1Unread: number;
  participant2Unread: number;
  isBlocked: boolean;
  blockedBy?: string;
  createdAt: Date;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  messageType: 'text' | 'image' | 'video' | 'voice' | 'document' | 'system';
  mediaUrl?: string;
  mediaThumbnail?: string;
  replyToId?: string;
  isRead: boolean;
  readAt?: Date;
  isDeleted: boolean;
  createdAt: Date;
}

export class MessagingService {
  private notificationService: NotificationService;

  constructor() {
    this.notificationService = new NotificationService();
  }

  async sendInterest(senderId: string, receiverId: string, message?: string): Promise<InterestRequest> {
    if (senderId === receiverId) {
      throw new AppError('Cannot send interest to yourself', 400, 'INVALID_REQUEST');
    }

    const [sender, receiver] = await Promise.all([
      db('users').where('id', senderId).first(),
      db('users').where('id', receiverId).first()
    ]);

    if (!sender || !receiver) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    const existing = await db('interest_requests')
      .where('sender_id', senderId)
      .where('receiver_id', receiverId)
      .first();

    if (existing) {
      if (existing.status === 'cancelled') {
        await db('interest_requests')
          .where('id', existing.id)
          .update({ status: 'pending', message, created_at: db.fn.now(), updated_at: db.fn.now() });
      } else {
        throw new AppError('Interest already sent', 400, 'INTEREST_EXISTS');
      }
    }

    const reverseInterest = await db('interest_requests')
      .where('sender_id', receiverId)
      .where('receiver_id', senderId)
      .first();

    if (reverseInterest) {
      if (reverseInterest.status === 'pending') {
        await db('interest_requests')
          .where('id', reverseInterest.id)
          .update({ status: 'accepted', responded_at: db.fn.now(), updated_at: db.fn.now() });
      }
    }

    const [interest] = await db('interest_requests')
      .insert({
        sender_id: senderId,
        receiver_id: receiverId,
        message,
        status: 'pending'
      })
      .returning('*');

    await this.notificationService.createNotification({
      userId: receiverId,
      type: 'interest_received',
      title: 'New Interest Received',
      body: `${sender.first_name} ${sender.last_name} sent you an interest`,
      data: { interestId: interest.id, senderId }
    });

    await this.trackEngagement(senderId, receiverId, 'interest_sent');

    return interest;
  }

  async acceptInterest(receiverId: string, interestId: string): Promise<InterestRequest> {
    const interest = await db('interest_requests')
      .where('id', interestId)
      .where('receiver_id', receiverId)
      .where('status', 'pending')
      .first();

    if (!interest) {
      throw new AppError('Interest request not found', 404, 'INTEREST_NOT_FOUND');
    }

    const [updated] = await db('interest_requests')
      .where('id', interestId)
      .update({
        status: 'accepted',
        responded_at: db.fn.now(),
        updated_at: db.fn.now()
      })
      .returning('*');

    await this.ensureConversation(interest.sender_id, receiverId);

    const sender = await db('users').where('id', interest.sender_id).first();
    const receiver = await db('users').where('id', receiverId).first();

    await Promise.all([
      this.notificationService.createNotification({
        userId: interest.sender_id,
        type: 'interest_accepted',
        title: 'Interest Accepted',
        body: `${receiver.first_name} ${receiver.last_name} accepted your interest`,
        data: { interestId, receiverId }
      }),
      this.trackEngagement(interest.sender_id, receiverId, 'interest_accepted')
    ]);

    return updated;
  }

  async rejectInterest(receiverId: string, interestId: string): Promise<InterestRequest> {
    const interest = await db('interest_requests')
      .where('id', interestId)
      .where('receiver_id', receiverId)
      .where('status', 'pending')
      .first();

    if (!interest) {
      throw new AppError('Interest request not found', 404, 'INTEREST_NOT_FOUND');
    }

    const [updated] = await db('interest_requests')
      .where('id', interestId)
      .update({
        status: 'rejected',
        responded_at: db.fn.now(),
        updated_at: db.fn.now()
      })
      .returning('*');

    await this.notificationService.createNotification({
      userId: interest.sender_id,
      type: 'interest_rejected',
      title: 'Interest Declined',
      body: 'Your interest request was not accepted',
      data: { interestId }
    });

    return updated;
  }

  async cancelInterest(senderId: string, interestId: string): Promise<InterestRequest> {
    const interest = await db('interest_requests')
      .where('id', interestId)
      .where('sender_id', senderId)
      .whereIn('status', ['pending', 'accepted'])
      .first();

    if (!interest) {
      throw new AppError('Interest request not found', 404, 'INTEREST_NOT_FOUND');
    }

    const [updated] = await db('interest_requests')
      .where('id', interestId)
      .update({
        status: 'cancelled',
        updated_at: db.fn.now()
      })
      .returning('*');

    return updated;
  }

  async getSentInterests(userId: string, page = 1, limit = 20) {
    const offset = (page - 1) * limit;

    const [interests, total] = await Promise.all([
      db('interest_requests as ir')
        .select(
          'ir.*',
          'u.id as user_id',
          'u.first_name',
          'u.last_name',
          'u.gender',
          'u.date_of_birth',
          'u.religion',
          'u.caste',
          'u.education',
          'u.occupation',
          'up.avatar_url',
          'up.city'
        )
        .leftJoin('users as u', 'u.id', 'ir.receiver_id')
        .leftJoin('user_profiles as up', 'up.user_id', 'ir.receiver_id')
        .where('ir.sender_id', userId)
        .whereNot('ir.status', 'cancelled')
        .orderBy('ir.created_at', 'desc')
        .limit(limit)
        .offset(offset),
      db('interest_requests')
        .where('sender_id', userId)
        .whereNot('status', 'cancelled')
        .count('id as count')
        .first()
    ]);

    return {
      data: interests,
      pagination: {
        page,
        limit,
        total: Number(total?.count) || 0,
        pages: Math.ceil((Number(total?.count) || 0) / limit)
      }
    };
  }

  async getReceivedInterests(userId: string, page = 1, limit = 20) {
    const offset = (page - 1) * limit;

    const [interests, total] = await Promise.all([
      db('interest_requests as ir')
        .select(
          'ir.*',
          'u.id as user_id',
          'u.first_name',
          'u.last_name',
          'u.gender',
          'u.date_of_birth',
          'u.religion',
          'u.caste',
          'u.education',
          'u.occupation',
          'up.avatar_url',
          'up.city'
        )
        .leftJoin('users as u', 'u.id', 'ir.sender_id')
        .leftJoin('user_profiles as up', 'up.user_id', 'ir.sender_id')
        .where('ir.receiver_id', userId)
        .whereNot('ir.status', 'cancelled')
        .orderBy('ir.created_at', 'desc')
        .limit(limit)
        .offset(offset),
      db('interest_requests')
        .where('receiver_id', userId)
        .whereNot('status', 'cancelled')
        .count('id as count')
        .first()
    ]);

    return {
      data: interests,
      pagination: {
        page,
        limit,
        total: Number(total?.count) || 0,
        pages: Math.ceil((Number(total?.count) || 0) / limit)
      }
    };
  }

  async getMatches(userId: string, page = 1, limit = 20) {
    const offset = (page - 1) * limit;

    const acceptedIds = db('interest_requests')
      .where('receiver_id', userId)
      .where('status', 'accepted')
      .select('sender_id');

    const [matches, total] = await Promise.all([
      db('interest_requests as ir')
        .select(
          'ir.id as interest_id',
          'ir.created_at as matched_at',
          'u.id as user_id',
          'u.first_name',
          'u.last_name',
          'u.gender',
          'u.date_of_birth',
          'u.religion',
          'u.caste',
          'up.avatar_url',
          'up.city'
        )
        .leftJoin('users as u', 'u.id', 'ir.sender_id')
        .leftJoin('user_profiles as up', 'up.user_id', 'ir.sender_id')
        .where('ir.receiver_id', userId)
        .where('ir.status', 'accepted')
        .union(
          db('interest_requests as ir')
            .select(
              'ir.id as interest_id',
              'ir.created_at as matched_at',
              'u.id as user_id',
              'u.first_name',
              'u.last_name',
              'u.gender',
              'u.date_of_birth',
              'u.religion',
              'u.caste',
              'up.avatar_url',
              'up.city'
            )
            .leftJoin('users as u', 'u.id', 'ir.receiver_id')
            .leftJoin('user_profiles as up', 'up.user_id', 'ir.receiver_id')
            .where('ir.sender_id', userId)
            .where('ir.status', 'accepted')
        )
        .orderBy('matched_at', 'desc')
        .limit(limit)
        .offset(offset),
      db('interest_requests')
        .where('receiver_id', userId)
        .where('status', 'accepted')
        .union(
          db('interest_requests')
            .where('sender_id', userId)
            .where('status', 'accepted')
        )
        .count('id as count')
        .first()
    ]);

    return {
      data: matches,
      pagination: {
        page,
        limit,
        total: Number(total?.count) || 0,
        pages: Math.ceil((Number(total?.count) || 0) / limit)
      }
    };
  }

  async getConversation(userId: string, otherUserId: string) {
    let conversation = await db('chat_conversations')
      .where(function () {
        this.where('participant_1', userId).where('participant_2', otherUserId);
      })
      .orWhere(function () {
        this.where('participant_1', otherUserId).where('participant_2', userId);
      })
      .first();

    if (!conversation) {
      conversation = await db('chat_conversations')
        .insert({
          participant_1: userId,
          participant_2: otherUserId
        })
        .returning('*')
        .then(([c]) => c);
    }

    return conversation;
  }

  async ensureConversation(userId1: string, userId2: string) {
    return this.getConversation(userId1, userId2);
  }

  async sendMessage(
    senderId: string,
    receiverId: string,
    content: string,
    messageType: string = 'text',
    mediaUrl?: string,
    replyToId?: string
  ): Promise<ChatMessage> {
    if (senderId === receiverId) {
      throw new AppError('Cannot send message to yourself', 400, 'INVALID_REQUEST');
    }

    const blocked = await db('blocked_users')
      .where(function () {
        this.where('blocker_id', senderId).where('blocked_id', receiverId);
      })
      .orWhere(function () {
        this.where('blocker_id', receiverId).where('blocked_id', senderId);
      })
      .first();

    if (blocked) {
      throw new AppError('Cannot send message to this user', 403, 'USER_BLOCKED');
    }

    const [interest] = await db('interest_requests')
      .where(function () {
        this.where('sender_id', senderId).where('receiver_id', receiverId);
      })
      .orWhere(function () {
        this.where('sender_id', receiverId).where('receiver_id', senderId);
      })
      .where('status', 'accepted')
      .first();

    if (!interest) {
      throw new AppError('Can only message matched profiles', 403, 'NOT_MATCHED');
    }

    const conversation = await this.getConversation(senderId, receiverId);

    const [message] = await db('chat_messages')
      .insert({
        conversation_id: conversation.id,
        sender_id: senderId,
        content,
        message_type: messageType,
        media_url: mediaUrl,
        reply_to_id: replyToId
      })
      .returning('*');

    const isP1 = conversation.participant_1 === senderId;
    await db('chat_conversations')
      .where('id', conversation.id)
      .update({
        last_message_at: db.fn.now(),
        last_message_preview: content.substring(0, 200),
        [`participant_${isP1 ? '2' : '1'}_unread`]: db.raw('participant_??_unread + 1', [isP1 ? '2' : '1'])
      });

    await this.notificationService.createNotification({
      userId: receiverId,
      type: 'new_message',
      title: 'New Message',
      body: content.substring(0, 100),
      data: { conversationId: conversation.id, messageId: message.id, senderId }
    });

    await this.trackEngagement(senderId, receiverId, 'message_sent');

    return message;
  }

  async getMessages(userId: string, conversationId: string, page = 1, limit = 50) {
    const conversation = await db('chat_conversations')
      .where('id', conversationId)
      .where(function () {
        this.where('participant_1', userId).orWhere('participant_2', userId);
      })
      .first();

    if (!conversation) {
      throw new AppError('Conversation not found', 404, 'NOT_FOUND');
    }

    const offset = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      db('chat_messages')
        .where('conversation_id', conversationId)
        .where('is_deleted', false)
        .orderBy('created_at', 'desc')
        .limit(limit)
        .offset(offset),
      db('chat_messages')
        .where('conversation_id', conversationId)
        .where('is_deleted', false)
        .count('id as count')
        .first()
    ]);

    await db('chat_conversations')
      .where('id', conversationId)
      .where(function () {
        this.where('participant_1', userId).orWhere('participant_2', userId);
      })
      .update({
        participant_1_unread: conversation.participant_1 === userId ? 0 : conversation.participant_1_unread,
        participant_2_unread: conversation.participant_2 === userId ? 0 : conversation.participant_2_unread
      });

    return {
      data: messages.reverse(),
      pagination: {
        page,
        limit,
        total: Number(total?.count) || 0,
        pages: Math.ceil((Number(total?.count) || 0) / limit)
      }
    };
  }

  async getConversations(userId: string, page = 1, limit = 20) {
    const offset = (page - 1) * limit;

    const conversations = await db('chat_conversations')
      .select(
        'cc.*',
        'u1.id as user_id',
        'u1.first_name as user_first_name',
        'u1.last_name as user_last_name',
        'up.avatar_url as user_avatar'
      )
      .from('chat_conversations as cc')
      .leftJoin('users as u1', function () {
        this.onVal('u1.id', '!=', userId).andOn(function () {
          this.on('u1.id', 'cc.participant_1').orOn('u1.id', 'cc.participant_2');
        });
      })
      .leftJoin('user_profiles as up', 'up.user_id', 'u1.id')
      .where('cc.participant_1', userId)
      .orWhere('cc.participant_2', userId)
      .where('cc.is_blocked', false)
      .orderBy('cc.last_message_at', 'desc')
      .limit(limit)
      .offset(offset);

    const conversationsWithUnread = conversations.map(conv => ({
      ...conv,
      unreadCount: conv.participant_1 === userId ? conv.participant_1_unread : conv.participant_2_unread
    }));

    return {
      data: conversationsWithUnread,
      pagination: { page, limit }
    };
  }

  async markAsRead(userId: string, conversationId: string, messageId?: string) {
    await db('chat_messages')
      .where('conversation_id', conversationId)
      .where('sender_id', '!=', userId)
      .where('is_read', false)
      .update({ is_read: true, read_at: db.fn.now() });

    await db('chat_conversations')
      .where('id', conversationId)
      .update({
        participant_1_unread: 0,
        participant_2_unread: 0
      });
  }

  async blockUser(blockerId: string, blockedId: string, reason?: string) {
    await db('blocked_users')
      .insert({
        blocker_id: blockerId,
        blocked_id: blockedId,
        reason
      })
      .onConflict(['blocker_id', 'blocked_id'])
      .merge({ reason, created_at: db.fn.now() });

    await db('chat_conversations')
      .where(function () {
        this.where('participant_1', blockerId).where('participant_2', blockedId);
      })
      .orWhere(function () {
        this.where('participant_1', blockedId).where('participant_2', blockerId);
      })
      .update({
        is_blocked: true,
        blocked_by: blockerId,
        blocked_at: db.fn.now()
      });

    return { success: true };
  }

  async unblockUser(blockerId: string, blockedId: string) {
    await db('blocked_users')
      .where('blocker_id', blockerId)
      .where('blocked_id', blockedId)
      .delete();

    await db('chat_conversations')
      .where('blocked_by', blockerId)
      .where(function () {
        this.where('participant_1', blockerId).where('participant_2', blockedId);
      })
      .orWhere(function () {
        this.where('participant_1', blockedId).where('participant_2', blockerId);
      })
      .update({
        is_blocked: false,
        blocked_by: null,
        blocked_at: null
      });

    return { success: true };
  }

  async getBlockedUsers(userId: string) {
    return db('blocked_users as bu')
      .select(
        'bu.*',
        'u.first_name',
        'u.last_name',
        'up.avatar_url'
      )
      .leftJoin('users as u', 'u.id', 'bu.blocked_id')
      .leftJoin('user_profiles as up', 'up.user_id', 'bu.blocked_id')
      .where('bu.blocker_id', userId)
      .orderBy('bu.created_at', 'desc');
  }

  async reportProfile(
    reporterId: string,
    reportedUserId: string,
    reason: string,
    description?: string,
    evidenceUrls?: string[]
  ) {
    if (reporterId === reportedUserId) {
      throw new AppError('Cannot report yourself', 400, 'INVALID_REQUEST');
    }

    const existing = await db('profile_reports')
      .where('reporter_id', reporterId)
      .where('reported_user_id', reportedUserId)
      .where('status', 'pending')
      .first();

    if (existing) {
      throw new AppError('You have already reported this profile', 400, 'ALREADY_REPORTED');
    }

    const [report] = await db('profile_reports')
      .insert({
        reporter_id: reporterId,
        reported_user_id: reportedUserId,
        reason,
        description,
        evidence_urls: JSON.stringify(evidenceUrls || [])
      })
      .returning('*');

    return report;
  }

  private async trackEngagement(userId1: string, userId2: string, action: string) {
    const engagementKey = `engagement:${userId1}:${userId2}`;
    await redis.hincrby(engagementKey, action, 1);
    await redis.expire(engagementKey, 86400 * 30);
  }
}
