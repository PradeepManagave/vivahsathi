import { Request, Response } from 'express';
import { NotificationService } from './notification.service';
import { success } from '../../shared/utils/response';
import { AppError } from '../../shared/utils/errors';

export class NotificationController {
  private service: NotificationService;

  constructor() {
    this.service = new NotificationService();
  }

  getNotifications = async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
      const unreadOnly = req.query.unreadOnly === 'true';

      const result = await this.service.getNotifications(userId, page, limit, unreadOnly);
      success(res, result);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to get notifications', 500, 'GET_FAILED');
    }
  };

  markAsRead = async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const { notificationId } = req.params;

      const result = await this.service.markAsRead(userId, notificationId);
      if (!result) {
        throw new AppError('Notification not found', 404, 'NOT_FOUND');
      }
      success(res, null, 'Notification marked as read');
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to mark as read', 500, 'MARK_FAILED');
    }
  };

  markAllAsRead = async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;

      await this.service.markAllAsRead(userId);
      success(res, null, 'All notifications marked as read');
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to mark all as read', 500, 'MARK_FAILED');
    }
  };

  deleteNotification = async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const { notificationId } = req.params;

      const result = await this.service.deleteNotification(userId, notificationId);
      if (!result) {
        throw new AppError('Notification not found', 404, 'NOT_FOUND');
      }
      success(res, null, 'Notification deleted');
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to delete notification', 500, 'DELETE_FAILED');
    }
  };

  getUnreadCount = async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;

      const count = await this.service.getUnreadCount(userId);
      success(res, { unreadCount: count });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to get unread count', 500, 'GET_FAILED');
    }
  };
}
