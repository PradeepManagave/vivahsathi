import { Router } from 'express';
import { authenticate } from '../../shared/middleware/auth';
import { asyncHandler } from '../../shared/middleware/error-handler';
import { analyticsController } from './analytics.controller';

const router = Router();

router.use(authenticate);

router.get('/dashboard', asyncHandler(analyticsController.getDashboardStats.bind(analyticsController)));
router.get('/revenue', asyncHandler(analyticsController.getRevenueReport.bind(analyticsController)));
router.get('/activity', asyncHandler(analyticsController.getActivityReport.bind(analyticsController)));

export const analyticsRouter = router;
