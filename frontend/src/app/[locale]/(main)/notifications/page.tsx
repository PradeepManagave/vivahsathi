'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Check, CheckCheck, Trash2, Loader2, Heart, MessageSquare, Star, Crown } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { notificationService, Notification } from '@/lib/api/services/notification.service';
import { toast } from 'sonner';

const typeIcons: Record<string, React.ElementType> = {
  interest: Heart,
  message: MessageSquare,
  match: Star,
  membership: Crown,
  system: Bell,
  kyc: Bell,
};

const typeColors: Record<string, string> = {
  interest: 'bg-primary-50 text-primary',
  message: 'bg-blue-50 text-blue-600',
  match: 'bg-amber-50 text-amber-600',
  membership: 'bg-secondary-100 text-secondary-700',
  system: 'bg-stone-100 text-stone-600',
  kyc: 'bg-green-50 text-green-600',
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadNotifications();
  }, [page]);

  const loadNotifications = async () => {
    try {
      const [notifRes, countRes] = await Promise.all([
        notificationService.getNotifications(page, 20),
        notificationService.getUnreadCount(),
      ]);
      setNotifications(notifRes.data);
      setUnreadCount(countRes);
    } catch {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to mark all as read');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      toast.success('Notification deleted');
    } catch {
      toast.error('Failed to delete notification');
    }
  };

  const formatTime = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface">
        <Header variant="member" />
        <div className="container-page py-8 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      <Header variant="member" />
      <div className="container-page py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-stone-900">Notifications</h1>
            {unreadCount > 0 && (
              <Badge variant="primary">{unreadCount} unread</Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<CheckCheck className="w-4 h-4" />}
              onClick={handleMarkAllRead}
            >
              Mark all read
            </Button>
          )}
        </div>

        {notifications.length === 0 ? (
          <Card className="text-center py-12">
            <Bell className="w-12 h-12 text-stone-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-stone-900 mb-2">No notifications</h3>
            <p className="text-stone-500">You&apos;re all caught up!</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {notifications.map((notif) => {
              const Icon = typeIcons[notif.type] || Bell;
              const colorClass = typeColors[notif.type] || typeColors.system;

              return (
                <Card
                  key={notif.id}
                  className={`p-4 transition-colors ${
                    !notif.isRead ? 'bg-primary-50/50 border-primary-100' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg ${colorClass}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-medium text-stone-900">{notif.title}</h3>
                          <p className="text-sm text-stone-500 mt-0.5">{notif.body}</p>
                        </div>
                        <span className="text-xs text-stone-400 flex-shrink-0">
                          {formatTime(notif.createdAt)}
                        </span>
                      </div>
                      <div className="flex gap-2 mt-2">
                        {!notif.isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<Check className="w-3.5 h-3.5" />}
                            onClick={() => handleMarkRead(notif.id)}
                          >
                            Mark read
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                          onClick={() => handleDelete(notif.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
