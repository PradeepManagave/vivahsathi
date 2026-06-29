import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { FranchiseCentreController } from './franchise-centre.controller';
import { authenticate } from '../../shared/middleware/auth';
import { requireRole } from '../../shared/middleware/role-guard';
import { validate } from '../../shared/middleware/validate';

const router = Router();
const controller = new FranchiseCentreController();

router.use(authenticate);
router.use(requireRole('centre_staff', 'centre_admin', 'super_admin'));

router.get('/dashboard', controller.getDashboard);

router.get('/members', [
  query('page').optional().isInt({ min: 1 }).default(1),
  query('limit').optional().isInt({ min: 1, max: 50 }).default(20),
  query('status').optional().isIn(['active', 'pending', 'banned']),
  query('planId').optional().isUUID(),
  query('search').optional().isString()
], validate, controller.getCentreMembers);

router.post('/members/register', [
  body('firstName').isString().trim().notEmpty().isLength({ min: 2, max: 100 }),
  body('lastName').isString().trim().notEmpty().isLength({ min: 2, max: 100 }),
  body('gender').isIn(['male', 'female', 'other']),
  body('dateOfBirth').isISO8601(),
  body('phone').matches(/^[6-9]\d{9}$/),
  body('email').optional().isEmail(),
  body('religion').optional().isString(),
  body('caste').optional().isString(),
  body('education').optional().isString(),
  body('occupation').optional().isString(),
  body('city').optional().isString(),
  body('photoUrl').optional().isURL()
], validate, controller.registerWalkinMember);

router.post('/members/:memberId/changes', [
  param('memberId').isUUID()
], controller.submitMemberChanges);

router.get('/walkin-registrations', [
  query('status').optional().isIn(['pending', 'submitted', 'approved', 'rejected', 'user_created']),
  query('page').optional().isInt({ min: 1 }).default(1),
  query('limit').optional().isInt({ min: 1, max: 50 }).default(20)
], validate, controller.getWalkinRegistrations);

router.get('/appointments', [
  query('date').optional().isDate(),
  query('staffId').optional().isUUID()
], validate, controller.getAppointments);

router.get('/slots', [
  query('startDate').isDate().withMessage('Start date is required'),
  query('endDate').isDate().withMessage('End date is required'),
  query('staffId').optional().isUUID()
], validate, controller.getAppointmentSlots);

router.post('/slots', [
  body('slotType').isIn(['video_kyc', 'profile_setup', 'renewal', 'counseling', 'general']),
  body('slotDate').isDate(),
  body('startTime').matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
  body('endTime').matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
  body('maxBookings').optional().isInt({ min: 1, max: 10 }).default(1),
  body('staffId').optional().isUUID(),
  body('notes').optional().isString()
], validate, controller.createAppointmentSlot);

router.post('/appointments/:slotId/book', [
  param('slotId').isUUID(),
  body('memberId').optional().isUUID(),
  body('memberName').isString().trim().notEmpty(),
  body('memberPhone').matches(/^[6-9]\d{9}$/),
  body('memberEmail').optional().isEmail(),
  body('notes').optional().isString()
], validate, controller.bookAppointment);

router.delete('/appointments/:appointmentId', [
  param('appointmentId').isUUID(),
  body('reason').optional().isString()
], validate, controller.cancelAppointment);

router.post('/payments/offline', [
  body('memberId').isUUID(),
  body('amount').isDecimal({ decimal_digits: '0,2' }),
  body('paymentMode').isIn(['cash', 'cheque', 'bank_transfer', 'upi', 'card']),
  body('transactionRef').optional().isString(),
  body('planId').optional().isUUID(),
  body('notes').optional().isString()
], validate, controller.recordOfflinePayment);

router.get('/staff', controller.getStaff);

router.post('/staff', [
  body('userId').isUUID(),
  body('role').isIn(['counselor', 'coordinator', 'manager', 'data_entry']),
  body('permissions').optional().isArray(),
  body('isHead').optional().isBoolean()
], validate, controller.addStaff);

router.put('/staff/:staffId', [
  param('staffId').isUUID(),
  body('role').optional().isIn(['counselor', 'coordinator', 'manager', 'data_entry']),
  body('permissions').optional().isArray(),
  body('isHead').optional().isBoolean(),
  body('isActive').optional().isBoolean()
], validate, controller.updateStaff);

router.delete('/staff/:staffId', [
  param('staffId').isUUID()
], validate, controller.removeStaff);

router.get('/reports/dashboard', controller.getDashboard);

router.get('/reports/commissions', [
  query('dateFrom').optional().isISO8601(),
  query('dateTo').optional().isISO8601()
], validate, controller.getCommissionReport);

router.get('/approvals/pending', [
  query('page').optional().isInt({ min: 1 }).default(1),
  query('limit').optional().isInt({ min: 1, max: 50 }).default(20)
], validate, controller.getPendingApprovals);

export const franchiseCentreRouter = router;
