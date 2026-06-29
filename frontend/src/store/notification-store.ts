import { create } from 'zustand';
import { apiClient } from '@/lib/api/client';

interface Notification {
  id: string; type: string; title: string; body: string;
  data?: Record<string, any>; isRead: boolean; createdAt: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;

  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  getUnreadCount: () => Promise<void>;
  addNotification: (notification: Notification) => void;
}

export const useNotificationStore = create<NotificationState>()((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,

  fetchNotifications: async () => {
    set({ loading: true, error: null });
    try {
      const res = await apiClient.get<{ notifications: Notification[] }>('/notifications');
      if (res.success && res.data) set({ notifications: res.data.notifications || [] });
    } catch (e: any) { set({ error: e?.message || 'Failed to load notifications' }); }
    finally { set({ loading: false }); }
  },

  markAsRead: async (id) => {
    try {
      await apiClient.post(`/notifications/${id}/read`);
      set(s => ({ notifications: s.notifications.map(n => n.id === id ? { ...n, isRead: true } : n), unreadCount: Math.max(0, s.unreadCount - 1) }));
    } catch { }
  },

  markAllAsRead: async () => {
    try {
      await apiClient.post('/notifications/read-all');
      set(s => ({ notifications: s.notifications.map(n => ({ ...n, isRead: true })), unreadCount: 0 }));
    } catch { }
  },

  deleteNotification: async (id) => {
    try {
      await apiClient.delete(`/notifications/${id}`);
      set(s => ({ notifications: s.notifications.filter(n => n.id !== id) }));
      get().getUnreadCount();
    } catch { }
  },

  getUnreadCount: async () => {
    try {
      const res = await apiClient.get<{ count: number }>('/notifications/unread-count');
      if (res.success && res.data) set({ unreadCount: res.data.count || 0 });
    } catch { }
  },

  addNotification: (notification) => {
    set(s => ({ notifications: [notification, ...s.notifications], unreadCount: s.unreadCount + 1 }));
  },
}));
