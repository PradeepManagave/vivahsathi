import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { SuperAdminController } from './super-admin.controller';
import { authenticate } from '../../shared/middleware/auth';
import { requireRole } from '../../shared/middleware/role-guard';
import { validate } from '../../shared/middleware/validate';

const router = Router();
const ctrl = new SuperAdminController();

router.use(authenticate);
router.use(requireRole('super_admin'));

router.get('/dashboard', ctrl.getDashboard);

router.get('/members', [
  query('page').optional().isInt({ min: 1 }).default(1),
  query('limit').optional().isInt({ min: 1, max: 100 }).default(20),
  query('status').optional().isIn(['active', 'pending', 'banned', 'suspended']),
  query('plan').optional().isUUID(),
  query('franchiseId').optional().isUUID(),
  query('centreId').optional().isUUID(),
  query('gender').optional().isIn(['male', 'female', 'other']),
  query('search').optional().isString(),
  query('dateFrom').optional().isISO8601(),
  query('dateTo').optional().isISO8601()
], validate, ctrl.getMembers);

router.get('/members/export', [
  query('format').optional().isIn(['csv', 'xlsx']).default('csv'),
  query('status').optional().isIn(['active', 'pending', 'banned']),
  query('franchiseId').optional().isUUID(),
  query('dateFrom').optional().isISO8601(),
  query('dateTo').optional().isISO8601()
], validate, ctrl.exportMembers);

router.get('/members/:memberId', [
  param('memberId').isUUID().withMessage('Invalid member ID')
], validate, ctrl.getMemberDetail);

router.put('/members/:memberId/approve', [
  param('memberId').isUUID().withMessage('Invalid member ID')
], validate, ctrl.approveMember);

router.put('/members/:memberId/ban', [
  param('memberId').isUUID().withMessage('Invalid member ID'),
  body('reason').isString().trim().isLength({ min: 10 }).withMessage('Reason must be at least 10 characters'),
  body('duration').optional().isInt({ min: 1 })
], validate, ctrl.banMember);

router.put('/members/:memberId/unban', [
  param('memberId').isUUID().withMessage('Invalid member ID')
], validate, ctrl.unbanMember);

router.put('/members/:memberId/convert', [
  param('memberId').isUUID().withMessage('Invalid member ID'),
  body('planId').isUUID().withMessage('Plan ID is required'),
  body('reason').isString().trim().notEmpty().withMessage('Reason is required')
], validate, ctrl.convertMembership);

router.post('/members/:memberId/photos/:photoId', [
  param('memberId').isUUID(),
  param('photoId').isUUID(),
  body('status').isIn(['approved', 'rejected']).withMessage('Status is required'),
  body('rejectionReason').optional().isString().trim()
], validate, ctrl.approvePhoto);

router.get('/members/:memberId/activity-log', [
  param('memberId').isUUID(),
  query('page').optional().isInt({ min: 1 }).default(1),
  query('limit').optional().isInt({ min: 1, max: 100 }).default(50)
], validate, ctrl.getMemberActivityLog);

router.get('/activity-log', [
  query('page').optional().isInt({ min: 1 }).default(1),
  query('limit').optional().isInt({ min: 1, max: 100 }).default(50),
  query('adminId').optional().isUUID(),
  query('action').optional().isString(),
  query('dateFrom').optional().isISO8601(),
  query('dateTo').optional().isISO8601()
], validate, ctrl.getAdminActivityLog);

router.post('/franchises', [
  body('name').isString().trim().notEmpty(),
  body('code').isString().trim().notEmpty(),
  body('ownerName').isString().trim().notEmpty(),
  body('email').isEmail(),
  body('phone').matches(/^[6-9]\d{9}$/),
  body('address').isString().trim().notEmpty(),
  body('city').isString().trim().notEmpty(),
  body('state').isString().trim().notEmpty(),
  body('commission').optional().isFloat({ min: 0, max: 100 })
], validate, ctrl.createFranchise);

router.put('/franchises/:franchiseId', [
  param('franchiseId').isUUID(),
  body('name').optional().isString().trim(),
  body('ownerName').optional().isString().trim(),
  body('email').optional().isEmail(),
  body('phone').optional().matches(/^[6-9]\d{9}$/),
  body('commission').optional().isFloat({ min: 0, max: 100 }),
  body('status').optional().isIn(['active', 'inactive', 'suspended'])
], validate, ctrl.updateFranchise);

router.get('/franchises', [
  query('page').optional().isInt({ min: 1 }).default(1),
  query('limit').optional().isInt({ min: 1, max: 50 }).default(20),
  query('status').optional().isIn(['active', 'inactive', 'suspended'])
], validate, ctrl.getFranchises);

router.get('/franchises/:franchiseId/members', [
  param('franchiseId').isUUID(),
  query('page').optional().isInt({ min: 1 }).default(1),
  query('limit').optional().isInt({ min: 1, max: 50 }).default(20),
  query('status').optional().isIn(['active', 'pending', 'banned']),
  query('dateFrom').optional().isISO8601(),
  query('dateTo').optional().isISO8601()
], validate, ctrl.getFranchiseMembers);

router.get('/franchises/:franchiseId/revenue', [
  param('franchiseId').isUUID(),
  query('dateFrom').optional().isISO8601(),
  query('dateTo').optional().isISO8601()
], validate, ctrl.getFranchiseRevenue);

router.post('/franchises/:franchiseId/centres', [
  param('franchiseId').isUUID(),
  body('name').isString().trim().notEmpty(),
  body('code').isString().trim().notEmpty(),
  body('address').isString().trim().notEmpty(),
  body('city').isString().trim().notEmpty(),
  body('state').isString().trim().notEmpty()
], validate, ctrl.createCentre);

router.put('/centres/:centreId', [
  param('centreId').isUUID(),
  body('name').optional().isString().trim(),
  body('address').optional().isString().trim(),
  body('city').optional().isString().trim(),
  body('status').optional().isIn(['active', 'inactive', 'suspended'])
], validate, ctrl.updateCentre);

router.post('/geo/countries', [
  body('name').isString().trim().notEmpty(),
  body('code').isString().trim().isLength({ min: 2, max: 3 }),
  body('phoneCode').optional().isString(),
  body('currency').optional().isString()
], validate, ctrl.addCountry);

router.post('/geo/states', [
  body('countryId').isUUID(),
  body('name').isString().trim().notEmpty(),
  body('code').isString().trim().notEmpty(),
  body('capital').optional().isString()
], validate, ctrl.addState);

router.post('/geo/districts', [
  body('stateId').isUUID(),
  body('name').isString().trim().notEmpty(),
  body('code').isString().trim().notEmpty()
], validate, ctrl.addDistrict);

router.post('/geo/talukas', [
  body('districtId').isUUID(),
  body('name').isString().trim().notEmpty(),
  body('code').isString().trim().notEmpty()
], validate, ctrl.addTaluka);

router.post('/geo/villages', [
  body('talukaId').isUUID(),
  body('name').isString().trim().notEmpty(),
  body('pincode').optional().isString()
], validate, ctrl.addVillage);

router.put('/geo/:type/:id', [
  param('type').isIn(['country', 'state', 'district', 'taluka', 'village']),
  param('id').isUUID(),
  body('name').optional().isString().trim(),
  body('isActive').optional().isBoolean()
], validate, ctrl.updateGeoEntry);

router.post('/geo/bulk-import', [
  body('talukaId').isUUID(),
  body('villages').isArray({ min: 1 })
], validate, ctrl.bulkImportVillages);

router.post('/geo/bulk-import-csv', [
  body('talukaId').isUUID(),
  body('csvData').isString().trim().notEmpty()
], validate, ctrl.bulkImportCSV);

router.get('/geo/village-requests', [
  query('page').optional().isInt({ min: 1 }).default(1),
  query('limit').optional().isInt({ min: 1, max: 50 }).default(20)
], validate, ctrl.getPendingVillageRequests);

router.put('/geo/village-requests/:requestId/approve', [
  param('requestId').isUUID()
], validate, ctrl.approveVillageRequest);

router.put('/geo/village-requests/:requestId/reject', [
  param('requestId').isUUID(),
  body('reason').isString().trim().notEmpty()
], validate, ctrl.rejectVillageRequest);

router.get('/reports/members', [
  query('status').optional().isIn(['active', 'pending', 'banned']),
  query('planId').optional().isUUID(),
  query('gender').optional().isIn(['male', 'female']),
  query('dateFrom').optional().isISO8601(),
  query('dateTo').optional().isISO8601()
], validate, ctrl.getMemberReport);

router.get('/reports/revenue', [
  query('dateFrom').optional().isISO8601(),
  query('dateTo').optional().isISO8601(),
  query('franchiseId').optional().isUUID()
], validate, ctrl.getRevenueReport);

router.get('/reports/renewals', ctrl.getRenewalReport);

router.get('/reports/commissions', [
  query('dateFrom').optional().isISO8601(),
  query('dateTo').optional().isISO8601()
], validate, ctrl.getCommissionReport);

router.post('/cms/pages', [
  body('slug').isString().trim().notEmpty(),
  body('title').isString().trim().notEmpty(),
  body('content').isString(),
  body('status').optional().isIn(['draft', 'published', 'archived']),
  body('pageType').optional().isString(),
  body('displayOrder').optional().isInt()
], validate, ctrl.createPage);

router.get('/cms/pages', [
  query('page').optional().isInt({ min: 1 }).default(1),
  query('limit').optional().isInt({ min: 1, max: 50 }).default(20),
  query('status').optional().isIn(['draft', 'published', 'archived']),
  query('pageType').optional().isString()
], validate, ctrl.getPages);

router.get('/cms/pages/:pageId', [
  param('pageId').isUUID()
], validate, ctrl.getPage);

router.put('/cms/pages/:pageId', [
  param('pageId').isUUID(),
  body('title').optional().isString().trim(),
  body('content').optional().isString(),
  body('status').optional().isIn(['draft', 'published', 'archived'])
], validate, ctrl.updatePage);

router.delete('/cms/pages/:pageId', [
  param('pageId').isUUID()
], validate, ctrl.deletePage);

router.get('/cms/settings', [
  query('category').optional().isIn(['general', 'email', 'sms', 'payment', 'tax', 'advertisement', 'seo', 'social'])
], validate, ctrl.getSettings);

router.get('/cms/settings/:key', [
  param('key').isString().trim().notEmpty()
], validate, ctrl.getSetting);

router.put('/cms/settings/:key', [
  param('key').isString().trim().notEmpty(),
  body('value').notEmpty(),
  body('category').isIn(['general', 'email', 'sms', 'payment', 'tax', 'advertisement', 'seo', 'social']),
  body('description').optional().isString()
], validate, ctrl.updateSetting);

router.post('/cms/settings/bulk', [
  body('settings').isArray({ min: 1 })
], validate, ctrl.bulkUpdateSettings);

router.post('/cms/banners', [
  body('title').isString().trim().notEmpty(),
  body('imageUrl').isURL(),
  body('position').isIn(['homepage', 'sidebar', 'footer', 'popup', 'banner']),
  body('linkUrl').optional().isURL(),
  body('linkType').optional().isIn(['external', 'internal', 'profile', 'search']),
  body('target').optional().isIn(['all', 'free', 'premium', 'male', 'female']),
  body('startDate').optional().isISO8601(),
  body('endDate').optional().isISO8601(),
  body('isActive').optional().isBoolean(),
  body('displayOrder').optional().isInt()
], validate, ctrl.createBanner);

router.get('/cms/banners', [
  query('page').optional().isInt({ min: 1 }).default(1),
  query('limit').optional().isInt({ min: 1, max: 50 }).default(20),
  query('position').optional().isIn(['homepage', 'sidebar', 'footer', 'popup', 'banner']),
  query('isActive').optional().isBoolean()
], validate, ctrl.getBanners);

router.put('/cms/banners/:bannerId', [
  param('bannerId').isUUID(),
  body('title').optional().isString().trim(),
  body('imageUrl').optional().isURL(),
  body('isActive').optional().isBoolean()
], validate, ctrl.updateBanner);

router.delete('/cms/banners/:bannerId', [
  param('bannerId').isUUID()
], validate, ctrl.deleteBanner);

export const superAdminRouter = router;
