import { Request, Response } from 'express';
import { FranchiseService } from './franchise.service';
import { success, created } from '../../shared/utils/response';
import { AppError } from '../../shared/utils/errors';

export class FranchiseController {
  private service: FranchiseService;

  constructor() {
    this.service = new FranchiseService();
  }

  create = async (req: Request, res: Response) => {
    try {
      const franchise = await this.service.create(req.body);
      created(res, franchise, 'Franchise created');
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to create franchise', 500, 'CREATE_FAILED');
    }
  };

  getAll = async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
      const status = req.query.status as string;

      const result = await this.service.getAll(page, limit, status);
      success(res, result);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to get franchises', 500, 'GET_FAILED');
    }
  };

  getById = async (req: Request, res: Response) => {
    try {
      const { franchiseId } = req.params;
      const franchise = await this.service.getById(franchiseId!);
      success(res, franchise);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to get franchise', 500, 'GET_FAILED');
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const { franchiseId } = req.params;
      const franchise = await this.service.update(franchiseId!, req.body);
      success(res, franchise, 'Franchise updated');
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to update franchise', 500, 'UPDATE_FAILED');
    }
  };

  getCentres = async (req: Request, res: Response) => {
    try {
      const { franchiseId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);

      const result = await this.service.getCentres(franchiseId!, page, limit);
      success(res, result);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to get centres', 500, 'GET_FAILED');
    }
  };

  createCentre = async (req: Request, res: Response) => {
    try {
      const { franchiseId } = req.params;
      const centre = await this.service.createCentre(franchiseId!, req.body);
      created(res, centre, 'Centre created');
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to create centre', 500, 'CREATE_FAILED');
    }
  };

  getPerformance = async (req: Request, res: Response) => {
    try {
      const { franchiseId } = req.params;
      const period = (req.query.period as 'month' | 'quarter' | 'year') || 'month';

      const performance = await this.service.getPerformance(franchiseId!, period);
      success(res, performance);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to get performance', 500, 'GET_FAILED');
    }
  };

  getRevenueShare = async (req: Request, res: Response) => {
    try {
      const { franchiseId } = req.params;
      const revenueShare = await this.service.getRevenueShare(franchiseId!);
      success(res, revenueShare);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to get revenue share', 500, 'GET_FAILED');
    }
  };

  getPayouts = async (req: Request, res: Response) => {
    try {
      const { franchiseId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
      const result = await this.service.getPayouts(franchiseId!, page, limit);
      success(res, result);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to get payouts', 500, 'GET_FAILED');
    }
  };

  createPayout = async (req: Request, res: Response) => {
    try {
      const adminId = req.user!.id;
      const { franchiseId } = req.params;
      const { amount, notes } = req.body;
      const payout = await this.service.createPayout(franchiseId!, adminId, amount, notes);
      created(res, payout, 'Payout created');
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to create payout', 500, 'CREATE_FAILED');
    }
  };

  processPayout = async (req: Request, res: Response) => {
    try {
      const adminId = req.user!.id;
      const { payoutId } = req.params;
      const { transactionRef } = req.body;
      const payout = await this.service.processPayout(payoutId!, adminId, transactionRef);
      success(res, payout, 'Payout processed');
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to process payout', 500, 'PROCESS_FAILED');
    }
  };

  getPayoutSummary = async (req: Request, res: Response) => {
    try {
      const { franchiseId } = req.params;
      const summary = await this.service.getPayoutSummary(franchiseId!);
      success(res, summary);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to get payout summary', 500, 'GET_FAILED');
    }
  };

  getBranding = async (req: Request, res: Response) => {
    try {
      const franchise = req.franchise;
      if (!franchise) {
        throw new AppError('No franchise branding for this domain', 404, 'NOT_FOUND');
      }
      success(res, franchise);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to get branding', 500, 'GET_FAILED');
    }
  };

  updateBranding = async (req: Request, res: Response) => {
    try {
      const { franchiseId } = req.params;
      const branding = await this.service.updateBranding(franchiseId!, req.body);
      success(res, branding, 'Branding updated');
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to update branding', 500, 'UPDATE_FAILED');
    }
  };

  getCentrePerformance = async (req: Request, res: Response) => {
    try {
      const { franchiseId, centreId } = req.params;
      const period = (req.query.period as 'month' | 'quarter' | 'year') || 'month';

      const performance = await this.service.getCentrePerformance(franchiseId!, centreId!, period);
      success(res, performance);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to get centre performance', 500, 'GET_FAILED');
    }
  };
}
