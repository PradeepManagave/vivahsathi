import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { VideoChatController } from './video-chat.controller';
import { authenticate } from '../../shared/middleware/auth';
import { requireRole } from '../../shared/middleware/role-guard';
import { validate } from '../../shared/middleware/validate';

const router = Router();
const controller = new VideoChatController();

router.use(authenticate);

router.post(
  '/initiate/:profileId',
  [
    param('profileId').isUUID().withMessage('Invalid profile ID')
  ],
  validate,
  controller.initiateCall
);

router.post(
  '/accept/:callId',
  param('callId').isUUID().withMessage('Invalid call ID'),
  validate,
  controller.acceptCall
);

router.post(
  '/decline/:callId',
  param('callId').isUUID().withMessage('Invalid call ID'),
  validate,
  controller.declineCall
);

router.post(
  '/join/:callId',
  param('callId').isUUID().withMessage('Invalid call ID'),
  validate,
  controller.joinCall
);

router.post(
  '/end/:callId',
  param('callId').isUUID().withMessage('Invalid call ID'),
  validate,
  controller.endCall
);

router.post(
  '/consent/:callId',
  [
    param('callId').isUUID().withMessage('Invalid call ID'),
    body('consent').isBoolean().withMessage('Consent must be true or false')
  ],
  validate,
  controller.giveRecordingConsent
);

router.get(
  '/history',
  [
    query('page').optional().isInt({ min: 1 }).default(1),
    query('limit').optional().isInt({ min: 1, max: 50 }).default(20)
  ],
  validate,
  controller.getCallHistory
);

router.get(
  '/incoming',
  controller.getIncomingCalls
);

router.get(
  '/:callId',
  param('callId').isUUID().withMessage('Invalid call ID'),
  validate,
  controller.getCallDetails
);

export const videoChatRouter = router;
