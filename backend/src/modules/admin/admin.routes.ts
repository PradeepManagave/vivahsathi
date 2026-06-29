import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { AdminController } from './admin.controller';
import { authenticate } from '../../shared/middleware/auth';
import { requireRole } from '../../shared/middleware/role-guard';
import { validate } from '../../shared/middleware/validate';

const router = Router();
const controller = new AdminController();

router.use(authenticate);
router.use(requireRole('centre_staff', 'centre_admin', 'super_admin'));

router.get('/dashboard', controller.getDashboard);

router.get('/members', [
  query('page').optional().isInt({ min: 1 }).default(1),
  query('limit').optional().isInt({ min: 1, max: 100 }).default(20),
  query('status').optional().isIn(['active', 'pending', 'suspended', 'rejected', 'deleted']),
  query('gender').optional().isIn(['male', 'female', 'other']),
  query('membershipPlan').optional().isString(),
  query('search').optional().isString(),
  query('dateFrom').optional().isISO8601(),
  query('dateTo').optional().isISO8601()
], validate, controller.getMembers);

router.get('/members/:memberId', [
  param('memberId').isUUID().withMessage('Invalid member ID')
], validate, controller.getMemberDetail);

router.put('/members/:memberId/status', [
  param('memberId').isUUID().withMessage('Invalid member ID'),
  body('status').isIn(['active', 'pending', 'suspended', 'rejected', 'deleted']).withMessage('Valid status is required'),
  body('reason').optional().isString().trim().isLength({ max: 500 })
], validate, controller.updateMemberStatus);

router.post('/members/bulk-update', [
  body('memberIds').isArray({ min: 1, max: 100 }).withMessage('1-100 member IDs required'),
  body('memberIds.*').isUUID(),
  body('status').isIn(['active', 'suspended']).withMessage('Valid status is required'),
  body('reason').optional().isString().trim().isLength({ max: 500 })
], validate, controller.bulkUpdateStatus);

router.get('/reports', [
  query('page').optional().isInt({ min: 1 }).default(1),
  query('limit').optional().isInt({ min: 1, max: 50 }).default(20),
  query('status').optional().isIn(['pending', 'reviewed', 'actioned', 'dismissed'])
], validate, controller.getReports);

router.put('/reports/:reportId/status', [
  param('reportId').isUUID().withMessage('Invalid report ID'),
  body('status').isIn(['reviewed', 'actioned', 'dismissed']).withMessage('Valid status is required'),
  body('actionTaken').optional().isString().trim().isLength({ max: 500 })
], validate, controller.updateReportStatus);

router.get('/audit-logs', [
  query('page').optional().isInt({ min: 1 }).default(1),
  query('limit').optional().isInt({ min: 1, max: 100 }).default(50),
  query('action').optional().isString(),
  query('userId').optional().isUUID(),
  query('dateFrom').optional().isISO8601(),
  query('dateTo').optional().isISO8601()
], validate, controller.getAuditLogs);

router.get('/analytics', [
  query('timeRange').optional().isIn(['day', 'week', 'month', 'year']).default('month')
], validate, controller.getAnalytics);

router.get('/analytics/membership', controller.getMembershipAnalytics);

router.get('/export', [
  query('format').optional().isIn(['csv', 'xlsx']).default('csv'),
  query('status').optional().isIn(['active', 'pending', 'suspended']),
  query('gender').optional().isIn(['male', 'female', 'other']),
  query('search').optional().isString()
], validate, controller.exportMembers);

router.get('/settings', [
  query('search').optional().isString(),
  query('page').optional().isInt({ min: 1 }).default(1),
  query('limit').optional().isInt({ min: 1, max: 100 }).default(50)
], validate, controller.getSettings);

router.get('/settings/:key', [
  param('key').isString().notEmpty()
], validate, controller.getSetting);

router.put('/settings/:key', [
  param('key').isString().notEmpty(),
  body('value').isString(),
  body('type').optional().isIn(['string', 'boolean', 'number', 'json'])
], validate, controller.updateSetting);

router.delete('/settings/:key', [
  param('key').isString().notEmpty()
], validate, controller.deleteSetting);

export const adminRouter = router;
