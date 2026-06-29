import { Router } from 'express';
import { param, query } from 'express-validator';
import { NotificationController } from './notification.controller';
import { authenticate } from '../../shared/middleware/auth';
import { validate } from '../../shared/middleware/validate';

const router = Router();
const controller = new NotificationController();

router.get(
  '/',
  authenticate,
  [
    query('page').optional().isInt({ min: 1 }).default(1),
    query('limit').optional().isInt({ min: 1, max: 50 }).default(20),
    query('unreadOnly').optional().isBoolean()
  ],
  validate,
  controller.getNotifications
);

router.get(
  '/unread-count',
  authenticate,
  controller.getUnreadCount
);

router.post(
  '/:notificationId/read',
  authenticate,
  param('notificationId').isUUID().withMessage('Invalid notification ID'),
  validate,
  controller.markAsRead
);

router.post(
  '/read-all',
  authenticate,
  controller.markAllAsRead
);

router.delete(
  '/:notificationId',
  authenticate,
  param('notificationId').isUUID().withMessage('Invalid notification ID'),
  validate,
  controller.deleteNotification
);

export const notificationRouter = router;
