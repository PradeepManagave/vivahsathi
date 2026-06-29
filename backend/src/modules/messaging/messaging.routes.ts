import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { MessagingController } from './messaging.controller';
import { authenticate, optionalAuth } from '../../shared/middleware/auth';
import { validate } from '../../shared/middleware/validate';
import { requireContactAccess } from '../../shared/middleware/membership';

const router = Router();
const controller = new MessagingController();

router.post(
  '/interests/send',
  authenticate,
  [
    body('receiverId').isUUID().withMessage('Receiver ID is required'),
    body('message').optional().isString().trim().isLength({ max: 500 })
  ],
  validate,
  controller.sendInterest
);

router.post(
  '/interests/:interestId/accept',
  authenticate,
  param('interestId').isUUID().withMessage('Invalid interest ID'),
  validate,
  controller.acceptInterest
);

router.post(
  '/interests/:interestId/reject',
  authenticate,
  param('interestId').isUUID().withMessage('Invalid interest ID'),
  validate,
  controller.rejectInterest
);

router.post(
  '/interests/:interestId/cancel',
  authenticate,
  param('interestId').isUUID().withMessage('Invalid interest ID'),
  validate,
  controller.cancelInterest
);

router.get(
  '/interests/sent',
  authenticate,
  [
    query('page').optional().isInt({ min: 1 }).default(1),
    query('limit').optional().isInt({ min: 1, max: 50 }).default(20)
  ],
  validate,
  controller.getSentInterests
);

router.get(
  '/interests/received',
  authenticate,
  [
    query('page').optional().isInt({ min: 1 }).default(1),
    query('limit').optional().isInt({ min: 1, max: 50 }).default(20)
  ],
  validate,
  controller.getReceivedInterests
);

router.get(
  '/matches',
  authenticate,
  [
    query('page').optional().isInt({ min: 1 }).default(1),
    query('limit').optional().isInt({ min: 1, max: 50 }).default(20)
  ],
  validate,
  controller.getMatches
);

router.post(
  '/messages',
  authenticate,
  requireContactAccess,
  [
    body('receiverId').isUUID().withMessage('Receiver ID is required'),
    body('content').isString().trim().notEmpty().withMessage('Message content is required'),
    body('type').optional().isIn(['text', 'image', 'video', 'voice', 'document']),
    body('mediaUrl').optional().isURL(),
    body('replyToId').optional().isUUID()
  ],
  validate,
  controller.sendMessage
);

router.get(
  '/conversations/:conversationId/messages',
  authenticate,
  [
    param('conversationId').isUUID().withMessage('Invalid conversation ID'),
    query('page').optional().isInt({ min: 1 }).default(1),
    query('limit').optional().isInt({ min: 1, max: 100 }).default(50)
  ],
  validate,
  controller.getMessages
);

router.get(
  '/conversations',
  authenticate,
  [
    query('page').optional().isInt({ min: 1 }).default(1),
    query('limit').optional().isInt({ min: 1, max: 50 }).default(20)
  ],
  validate,
  controller.getConversations
);

router.post(
  '/conversations/:conversationId/read',
  authenticate,
  param('conversationId').isUUID().withMessage('Invalid conversation ID'),
  validate,
  controller.markAsRead
);

router.post(
  '/block',
  authenticate,
  [
    body('userId').isUUID().withMessage('User ID is required'),
    body('reason').optional().isString().trim().isLength({ max: 100 })
  ],
  validate,
  controller.blockUser
);

router.delete(
  '/block/:userId',
  authenticate,
  param('userId').isUUID().withMessage('Invalid user ID'),
  validate,
  controller.unblockUser
);

router.get(
  '/blocked',
  authenticate,
  controller.getBlockedUsers
);

router.post(
  '/report',
  authenticate,
  [
    body('userId').isUUID().withMessage('User ID is required'),
    body('reason').isIn(['fake_profile', 'inappropriate', 'spam', 'harassment', 'wrong_age', 'wrong_religion', 'other'])
      .withMessage('Valid reason is required'),
    body('description').optional().isString().trim().isLength({ max: 1000 }),
    body('evidenceUrls').optional().isArray().isLength({ max: 5 })
  ],
  validate,
  controller.reportProfile
);

export const messagingRouter = router;
