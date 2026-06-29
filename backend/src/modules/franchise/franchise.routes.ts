import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { FranchiseController } from './franchise.controller';
import { authenticate } from '../../shared/middleware/auth';
import { requireRole } from '../../shared/middleware/role-guard';
import { validate } from '../../shared/middleware/validate';

const router = Router();
const controller = new FranchiseController();

router.use(authenticate);
router.use(requireRole('super_admin', 'franchise_admin'));

router.post(
  '/',
  [
    body('name').isString().trim().notEmpty().withMessage('Name is required'),
    body('code').isString().trim().notEmpty().withMessage('Code is required'),
    body('ownerName').isString().trim().notEmpty(),
    body('email').isEmail(),
    body('phone').matches(/^[6-9]\d{9}$/),
    body('address').isString().trim().notEmpty(),
    body('city').isString().trim().notEmpty(),
    body('state').isString().trim().notEmpty(),
    body('commission').optional().isFloat({ min: 0, max: 100 })
  ],
  validate,
  controller.create
);

router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).default(1),
    query('limit').optional().isInt({ min: 1, max: 50 }).default(20),
    query('status').optional().isIn(['active', 'inactive', 'suspended'])
  ],
  validate,
  controller.getAll
);

router.get(
  '/:franchiseId',
  param('franchiseId').isUUID().withMessage('Invalid franchise ID'),
  validate,
  controller.getById
);

router.put(
  '/:franchiseId',
  [
    param('franchiseId').isUUID().withMessage('Invalid franchise ID'),
    body('name').optional().isString().trim(),
    body('ownerName').optional().isString().trim(),
    body('email').optional().isEmail(),
    body('phone').optional().matches(/^[6-9]\d{9}$/),
    body('address').optional().isString().trim(),
    body('city').optional().isString().trim(),
    body('state').optional().isString().trim(),
    body('commission').optional().isFloat({ min: 0, max: 100 }),
    body('status').optional().isIn(['active', 'inactive', 'suspended'])
  ],
  validate,
  controller.update
);

router.get(
  '/:franchiseId/centres',
  [
    param('franchiseId').isUUID().withMessage('Invalid franchise ID'),
    query('page').optional().isInt({ min: 1 }).default(1),
    query('limit').optional().isInt({ min: 1, max: 50 }).default(20)
  ],
  validate,
  controller.getCentres
);

router.post(
  '/:franchiseId/centres',
  [
    param('franchiseId').isUUID().withMessage('Invalid franchise ID'),
    body('name').isString().trim().notEmpty(),
    body('code').isString().trim().notEmpty(),
    body('address').isString().trim().notEmpty(),
    body('city').isString().trim().notEmpty(),
    body('state').isString().trim().notEmpty(),
    body('pincode').optional().isString().trim(),
    body('phone').optional().matches(/^[6-9]\d{9}$/),
    body('email').optional().isEmail()
  ],
  validate,
  controller.createCentre
);

router.get(
  '/:franchiseId/performance',
  [
    param('franchiseId').isUUID().withMessage('Invalid franchise ID'),
    query('period').optional().isIn(['month', 'quarter', 'year']).default('month')
  ],
  validate,
  controller.getPerformance
);

router.get(
  '/:franchiseId/revenue-share',
  param('franchiseId').isUUID().withMessage('Invalid franchise ID'),
  validate,
  controller.getRevenueShare
);

router.get(
  '/:franchiseId/centres/:centreId/performance',
  [
    param('franchiseId').isUUID(),
    param('centreId').isUUID(),
    query('period').optional().isIn(['month', 'quarter', 'year']).default('month')
  ],
  validate,
  controller.getCentrePerformance
);

router.get(
  '/branding',
  controller.getBranding
);

router.put(
  '/:franchiseId/branding',
  [
    param('franchiseId').isUUID(),
    body('primaryColor').optional().isString().matches(/^#[0-9A-Fa-f]{6}$/),
    body('secondaryColor').optional().isString().matches(/^#[0-9A-Fa-f]{6}$/),
    body('logoUrl').optional().isString(),
    body('faviconUrl').optional().isString(),
    body('tagline').optional().isString().trim(),
    body('subdomain').optional().isString().matches(/^[a-z0-9-]+$/)
  ],
  validate,
  controller.updateBranding
);

router.get(
  '/:franchiseId/payouts',
  [
    param('franchiseId').isUUID(),
    query('page').optional().isInt({ min: 1 }).default(1),
    query('limit').optional().isInt({ min: 1, max: 50 }).default(20)
  ],
  validate,
  controller.getPayouts
);

router.post(
  '/:franchiseId/payouts',
  [
    param('franchiseId').isUUID(),
    body('amount').isFloat({ min: 1 }).withMessage('Amount must be positive'),
    body('notes').optional().isString().trim()
  ],
  validate,
  controller.createPayout
);

router.get(
  '/:franchiseId/payouts/summary',
  param('franchiseId').isUUID(),
  validate,
  controller.getPayoutSummary
);

router.post(
  '/payouts/:payoutId/process',
  [
    param('payoutId').isUUID(),
    body('transactionRef').optional().isString().trim()
  ],
  validate,
  controller.processPayout
);

export const franchiseRouter = router;
