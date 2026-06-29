import { Request, Response, NextFunction } from 'express';
import { analyticsService } from './analytics.service';
import { successResponse } from '../../shared/utils/response';

export class AnalyticsController {
  async getDashboardStats(req: Request, res: Response, next: NextFunction) {
    try {
      const centreId = (req as any).user?.centreId;
      const stats = await analyticsService.getDashboardStats(centreId);
      res.json(successResponse(stats));
    } catch (error) { next(error); }
  }

  async getRevenueReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { period = 'monthly', from, to } = req.query;
      const report = await analyticsService.getRevenueReport(period as any, from as string, to as string);
      res.json(successResponse(report));
    } catch (error) { next(error); }
  }

  async getActivityReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { from, to } = req.query;
      const report = await analyticsService.getActivityReport(from as string, to as string);
      res.json(successResponse(report));
    } catch (error) { next(error); }
  }
}

export const analyticsController = new AnalyticsController();
