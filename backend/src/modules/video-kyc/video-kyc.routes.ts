import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { VideoKycController } from './video-kyc.controller';
import { authenticate } from '../../shared/middleware/auth';
import { requireRole } from '../../shared/middleware/role-guard';
import { validate } from '../../shared/middleware/validate';

const router = Router();
const controller = new VideoKycController();

router.post(
  '/sessions',
  authenticate,
  [
    body('sessionType').optional().isIn(['video_call', 'video_verification']),
    body('scheduledAt').optional().isISO8601().toDate()
  ],
  validate,
  controller.createSession
);

router.get(
  '/sessions',
  authenticate,
  [query('status').optional().isIn(['pending', 'scheduled', 'in_progress', 'completed', 'failed', 'cancelled', 'approved', 'rejected'])],
  validate,
  controller.getMySessions
);

router.get(
  '/status',
  authenticate,
  controller.getMyKycStatus
);

router.get(
  '/slots',
  authenticate,
  [
    query('centreId').optional().isUUID(),
    query('date').optional().isDate()
  ],
  validate,
  controller.getAvailableSlots
);

router.post(
  '/slots/book',
  authenticate,
  [body('slotId').isUUID().withMessage('Slot ID is required')],
  validate,
  controller.bookSlot
);

router.post(
  '/slots',
  authenticate,
  requireRole('centre_staff', 'centre_admin', 'super_admin'),
  [
    body('centreId').isUUID().withMessage('Centre ID is required'),
    body('slotDate').isDate().withMessage('Slot date is required'),
    body('startTime').matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid start time required'),
    body('endTime').matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid end time required'),
    body('kycType').isIn(['centre', 'online']).withMessage('KYC type must be centre or online'),
    body('maxParticipants').optional().isInt({ min: 1, max: 20 }).default(5)
  ],
  validate,
  controller.createSlot
);

router.post(
  '/sessions/:sessionId/join',
  authenticate,
  param('sessionId').isUUID().withMessage('Invalid session ID'),
  validate,
  controller.joinSession
);

router.post(
  '/sessions/:sessionId/complete',
  authenticate,
  [
    param('sessionId').isUUID().withMessage('Invalid session ID'),
    body('notes').optional().isString().trim().isLength({ max: 1000 }),
    body('recordingUrl').optional().isURL()
  ],
  validate,
  controller.completeSession
);

router.post(
  '/sessions/:sessionId/cancel',
  authenticate,
  [
    param('sessionId').isUUID().withMessage('Invalid session ID'),
    body('reason').optional().isString().trim().isLength({ max: 500 })
  ],
  validate,
  controller.cancelSession
);

router.post(
  '/documents',
  authenticate,
  [
    body('documentType').isIn(['aadhaar', 'pan', 'voter_id', 'passport', 'driving_license', 'birth_certificate'])
      .withMessage('Valid document type is required'),
    body('documentNumber').isString().trim().notEmpty().withMessage('Document number is required'),
    body('frontImageUrl').isURL().withMessage('Front image URL is required'),
    body('backImageUrl').optional().isURL(),
    body('expiryDate').optional().isISO8601().toDate()
  ],
  validate,
  controller.submitDocument
);

router.get(
  '/documents',
  authenticate,
  controller.getMyDocuments
);

router.get(
  '/admin/pending-verifications',
  authenticate,
  requireRole('centre_staff', 'centre_admin', 'super_admin'),
  [
    query('page').optional().isInt({ min: 1 }).default(1),
    query('limit').optional().isInt({ min: 1, max: 50 }).default(20)
  ],
  validate,
  controller.getPendingVerifications
);

router.get(
  '/admin/pending-sessions',
  authenticate,
  requireRole('centre_staff', 'centre_admin', 'super_admin'),
  [
    query('page').optional().isInt({ min: 1 }).default(1),
    query('limit').optional().isInt({ min: 1, max: 50 }).default(20)
  ],
  validate,
  controller.getPendingSessions
);

router.post(
  '/admin/sessions/:sessionId/approve',
  authenticate,
  requireRole('centre_staff', 'centre_admin', 'super_admin'),
  [
    param('sessionId').isUUID().withMessage('Invalid session ID'),
    body('notes').optional().isString().trim().isLength({ max: 1000 })
  ],
  validate,
  controller.approveKyc
);

router.post(
  '/admin/sessions/:sessionId/reject',
  authenticate,
  requireRole('centre_staff', 'centre_admin', 'super_admin'),
  [
    param('sessionId').isUUID().withMessage('Invalid session ID'),
    body('reason').isString().trim().isLength({ min: 10, max: 500 }).withMessage('Rejection reason must be 10-500 characters')
  ],
  validate,
  controller.rejectKyc
);

router.post(
  '/admin/documents/:documentId/verify',
  authenticate,
  requireRole('centre_staff', 'centre_admin', 'super_admin'),
  [
    param('documentId').isUUID().withMessage('Invalid document ID'),
    body('status').isIn(['verified', 'rejected']).withMessage('Valid status is required'),
    body('rejectionReason').optional().isString().trim().isLength({ max: 500 })
  ],
  validate,
  controller.verifyDocument
);

router.post(
  '/admin/sessions/:sessionId/evaluate',
  authenticate,
  requireRole('centre_staff', 'centre_admin', 'super_admin'),
  [
    param('sessionId').isUUID().withMessage('Invalid session ID'),
    body('criteria').isArray({ min: 1 }).withMessage('At least one criteria is required'),
    body('criteria.*.name').isString().notEmpty(),
    body('criteria.*.score').isInt({ min: 0, max: 10 }),
    body('criteria.*.notes').optional().isString()
  ],
  validate,
  controller.evaluateSession
);

export const videoKycRouter = router;
