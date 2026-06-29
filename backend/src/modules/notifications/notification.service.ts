import { db } from '../../config/database';
import { redis } from '../../config/redis';
import logger from '../../config/logger';

export interface NotificationData {
  userId: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  imageUrl?: string;
  actionUrl?: string;
}

export class NotificationService {
  async createNotification(notification: NotificationData) {
    try {
      const [record] = await db('notifications')
        .insert({
          user_id: notification.userId,
          type: notification.type,
          title: notification.title,
          body: notification.body,
          data: JSON.stringify(notification.data || {}),
          image_url: notification.imageUrl,
          action_url: notification.actionUrl
        })
        .returning('*');

      await redis.lpush(`notifications:${notification.userId}`, JSON.stringify(record));
      await redis.ltrim(`notifications:${notification.userId}`, 0, 99);
      await redis.expire(`notifications:${notification.userId}`, 86400 * 7);

      await redis.publish('notifications', JSON.stringify({
        userId: notification.userId,
        notification: record
      }));

      return record;
    } catch (error) {
      logger.error('Failed to create notification', { error, notification });
      return null;
    }
  }

  async getNotifications(userId: string, page = 1, limit = 20, unreadOnly = false) {
    const offset = (page - 1) * limit;
    const query = db('notifications')
      .where('user_id', userId)
      .where('is_deleted', false)
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);

    if (unreadOnly) {
      query.where('is_read', false);
    }

    const [notifications, total, unreadCount] = await Promise.all([
      query,
      db('notifications')
        .where('user_id', userId)
        .where('is_deleted', false)
        .count('id as count')
        .first(),
      db('notifications')
        .where('user_id', userId)
        .where('is_read', false)
        .where('is_deleted', false)
        .count('id as count')
        .first()
    ]);

    return {
      data: notifications.map(n => ({
        ...n,
        data: typeof n.data === 'string' ? JSON.parse(n.data) : n.data
      })),
      pagination: {
        page,
        limit,
        total: Number(total?.count || 0),
        pages: Math.ceil(Number(total?.count || 0) / limit)
      },
      unreadCount: Number(unreadCount?.count || 0)
    };
  }

  async markAsRead(userId: string, notificationId: string) {
    const updated = await db('notifications')
      .where('id', notificationId)
      .where('user_id', userId)
      .update({ is_read: true, read_at: db.fn.now() });

    return updated > 0;
  }

  async markAllAsRead(userId: string) {
    await db('notifications')
      .where('user_id', userId)
      .where('is_read', false)
      .update({ is_read: true, read_at: db.fn.now() });

    return { success: true };
  }

  async deleteNotification(userId: string, notificationId: string) {
    const updated = await db('notifications')
      .where('id', notificationId)
      .where('user_id', userId)
      .update({ is_deleted: true, deleted_at: db.fn.now() });

    return updated > 0;
  }

  async getUnreadCount(userId: string): Promise<number> {
    const result = await db('notifications')
      .where('user_id', userId)
      .where('is_read', false)
      .where('is_deleted', false)
      .count('id as count')
      .first();

    return Number(result?.count || 0);
  }

  async sendPushNotification(userId: string, notification: NotificationData) {
    const fcmToken = await db('user_devices')
      .where('user_id', userId)
      .where('is_active', true)
      .select('fcm_token')
      .first();

    if (!fcmToken?.fcm_token) {
      return null;
    }

    logger.info('Sending push notification', { userId, type: notification.type });
    return { sent: true, fcmToken: fcmToken.fcm_token };
  }

  async sendEmailNotification(userId: string, subject: string, content: string) {
    const user = await db('users')
      .where('id', userId)
      .first();

    if (!user?.email || !user.email_verified) {
      return null;
    }

    logger.info('Sending email notification', { userId, subject });
    return { sent: true, email: user.email };
  }

  async createBulkNotifications(userIds: string[], notification: Omit<NotificationData, 'userId'>) {
    const records = userIds.map(userId => ({
      user_id: userId,
      type: notification.type,
      title: notification.title,
      body: notification.body,
      data: JSON.stringify(notification.data || {})
    }));

    return db('notifications').insert(records).returning('*');
  }
}
