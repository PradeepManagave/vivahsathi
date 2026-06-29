import { apiClient, API_ENDPOINTS } from '@/lib/api/client';
import { PaginationMeta } from '@/types';

export interface Notification {
  id: string;
  type: 'interest' | 'message' | 'match' | 'system' | 'membership' | 'kyc';
  title: string;
  body: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  createdAt: string;
}

export class NotificationService {
  async getNotifications(page = 1, limit = 20, unreadOnly = false): Promise<{ data: Notification[]; meta: PaginationMeta }> {
    const response = await apiClient.get<{ data: Notification[]; meta: PaginationMeta }>(
      API_ENDPOINTS.notifications.list,
      { page, limit, unreadOnly }
    );
    return response.data as { data: Notification[]; meta: PaginationMeta };
  }

  async markAsRead(notificationId: string): Promise<void> {
    await apiClient.post(API_ENDPOINTS.notifications.markRead(notificationId));
  }

  async markAllAsRead(): Promise<void> {
    await apiClient.post(API_ENDPOINTS.notifications.markAllRead);
  }

  async deleteNotification(notificationId: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.notifications.markRead(notificationId));
  }

  async getUnreadCount(): Promise<number> {
    const response = await apiClient.get<{ count: number }>(
      API_ENDPOINTS.notifications.list
    );
    return (response.data as { count: number }).count;
  }

  async registerDevice(deviceId: string, fcmToken: string, deviceType: 'ios' | 'android' | 'web'): Promise<void> {
    await apiClient.post(API_ENDPOINTS.notifications.settings, {
      deviceId,
      fcmToken,
      deviceType,
    });
  }

  async unregisterDevice(deviceId: string): Promise<void> {
    await apiClient.post(API_ENDPOINTS.notifications.settings, { deviceId, unregister: true });
  }
}

export const notificationService = new NotificationService();
