// ============================================================
// Payment Routes
// ============================================================

import { Router } from 'express';
import { body, param, query } from 'express-validator';
import rateLimit from 'express-rate-limit';
import { PaymentController } from './payment.controller';
import { authenticate, optionalAuth } from '../../shared/middleware/auth';
import { validate } from '../../shared/middleware/validate';
import { requireRole } from '../../shared/middleware/role-guard';

const router = Router();
const controller = new PaymentController();

const webhookLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  keyGenerator: (req) => {
    return req.ip || 'unknown';
  },
  message: {
    success: false,
    error: {
      code: 'WEBHOOK_LIMIT',
      message: 'Too many webhook requests. Please try again later.'
    }
  }
});

router.post(
  '/create-order',
  authenticate,
  [
    body('planId').isUUID().withMessage('Plan ID is required'),
    body('couponCode').optional().isString().trim().toUpperCase()
  ],
  validate,
  controller.createOrder.bind(controller)
);

router.post(
  '/verify',
  authenticate,
  [
    body('razorpayOrderId').isString().withMessage('Order ID is required'),
    body('razorpayPaymentId').isString().withMessage('Payment ID is required'),
    body('razorpaySignature').isString().withMessage('Signature is required')
  ],
  validate,
  controller.verifyPayment.bind(controller)
);

router.post(
  '/webhook',
  webhookLimiter,
  controller.handleWebhook.bind(controller)
);

router.post(
  '/offline',
  authenticate,
  requireRole('centre_staff', 'centre_admin', 'super_admin'),
  [
    body('userId').isUUID().withMessage('User ID is required'),
    body('planId').isUUID().withMessage('Plan ID is required'),
    body('amount').isDecimal({ decimal_digits: '0,2' }).withMessage('Valid amount is required'),
    body('paymentMode').isIn(['cash', 'cheque', 'bank_transfer', 'upi', 'card']).withMessage('Valid payment mode required'),
    body('transactionRef').optional().isString().trim(),
    body('notes').optional().isString().trim().isLength({ max: 500 })
  ],
  validate,
  controller.recordOfflinePayment.bind(controller)
);

router.get(
  '/history',
  authenticate,
  [
    query('page').optional().isInt({ min: 1 }).default(1),
    query('limit').optional().isInt({ min: 1, max: 50 }).default(20),
    query('status').optional().isIn(['pending', 'completed', 'failed', 'refunded'])
  ],
  validate,
  controller.getPaymentHistory.bind(controller)
);

router.get(
  '/invoice/:paymentId',
  authenticate,
  [
    param('paymentId').isUUID().withMessage('Invalid payment ID')
  ],
  validate,
  controller.getInvoice.bind(controller)
);

router.get(
  '/pending',
  authenticate,
  requireRole('centre_staff', 'centre_admin', 'super_admin'),
  [
    query('page').optional().isInt({ min: 1 }).default(1),
    query('limit').optional().isInt({ min: 1, max: 50 }).default(20)
  ],
  validate,
  controller.getPendingPayments.bind(controller)
);

router.get(
  '/stats',
  authenticate,
  requireRole('centre_staff', 'centre_admin', 'super_admin'),
  [
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
    query('groupBy').optional().isIn(['day', 'week', 'month', 'plan'])
  ],
  validate,
  controller.getPaymentStats.bind(controller)
);

router.post(
  '/:paymentId/refund',
  authenticate,
  requireRole('centre_admin', 'super_admin'),
  [
    param('paymentId').isUUID().withMessage('Invalid payment ID'),
    body('amount').optional().isDecimal({ decimal_digits: '0,2' }),
    body('reason').isString().trim().isLength({ max: 500 }).withMessage('Reason is required')
  ],
  validate,
  controller.refundPayment.bind(controller)
);

export const paymentRouter = router;
