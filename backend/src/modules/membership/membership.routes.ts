// ============================================================
// Membership Plans Routes
// ============================================================

import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { MembershipController } from './membership.controller';
import { PaymentController } from '../payments/payment.controller';
import { authenticate, optionalAuth } from '../../shared/middleware/auth';
import { validate } from '../../shared/middleware/validate';
import { requireRole } from '../../shared/middleware/role-guard';

const router = Router();
const membershipController = new MembershipController();
const paymentController = new PaymentController();

router.get(
  '/plans',
  optionalAuth,
  membershipController.getPlans.bind(membershipController)
);

router.get(
  '/plans/:planId',
  optionalAuth,
  [
    param('planId').isUUID().withMessage('Invalid plan ID')
  ],
  validate,
  membershipController.getPlanById.bind(membershipController)
);

router.get(
  '/my',
  authenticate,
  membershipController.getMyMembership.bind(membershipController)
);

router.get(
  '/my/usage',
  authenticate,
  membershipController.getMyUsage.bind(membershipController)
);

router.get(
  '/my/history',
  authenticate,
  membershipController.getMyHistory.bind(membershipController)
);

router.post(
  '/upgrade',
  authenticate,
  [
    body('planId').isUUID().withMessage('Plan ID is required'),
    body('paymentMethod').optional().isIn(['razorpay', 'offline', 'wallet']).default('razorpay')
  ],
  validate,
  membershipController.upgradePlan.bind(membershipController)
);

router.post(
  '/cancel',
  authenticate,
  [
    body('reason').optional().isString().trim().isLength({ max: 500 })
  ],
  validate,
  membershipController.cancelMembership.bind(membershipController)
);

router.post(
  '/renew',
  authenticate,
  [
    body('planId').isUUID().withMessage('Plan ID is required')
  ],
  validate,
  membershipController.renewMembership.bind(membershipController)
);

router.get(
  '/prepaid-packs',
  optionalAuth,
  membershipController.getPrepaidPacks.bind(membershipController)
);

router.post(
  '/prepaid-packs/purchase',
  authenticate,
  [
    body('packId').isUUID().withMessage('Pack ID is required')
  ],
  validate,
  paymentController.purchasePrepaidPack.bind(paymentController)
);

export const membershipRouter = router;
