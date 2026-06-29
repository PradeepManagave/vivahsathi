// ============================================================
// Membership Controller
// ============================================================

import { Request, Response, NextFunction } from 'express';
import { MembershipService } from './membership.service';
import { successResponse } from '../../shared/utils/response';

export class MembershipController {
  private membershipService: MembershipService;

  constructor() {
    this.membershipService = new MembershipService();
  }

  async getPlans(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user?.id;
      const plans = await this.membershipService.getPlans(userId);

      res.json(successResponse(plans));
    } catch (error) {
      next(error);
    }
  }

  async getPlanById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { planId } = req.params;
      const plan = await this.membershipService.getPlanById(planId);

      res.json(successResponse(plan));
    } catch (error) {
      next(error);
    }
  }

  async getMyMembership(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.id;
      const membership = await this.membershipService.getMyMembership(userId);

      res.json(successResponse(membership));
    } catch (error) {
      next(error);
    }
  }

  async getMyUsage(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.id;
      const usage = await this.membershipService.getMyUsage(userId);

      res.json(successResponse(usage));
    } catch (error) {
      next(error);
    }
  }

  async getMyHistory(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.id;
      const history = await this.membershipService.getMyHistory(userId);

      res.json(successResponse(history));
    } catch (error) {
      next(error);
    }
  }

  async upgradePlan(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.id;
      const { planId, paymentMethod = 'razorpay' } = req.body;

      const result = await this.membershipService.upgradePlan(userId, planId, paymentMethod);

      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  }

  async cancelMembership(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.id;
      const { reason } = req.body;

      await this.membershipService.cancelMembership(userId, reason);

      res.json(successResponse(null, 'Membership cancelled successfully'));
    } catch (error) {
      next(error);
    }
  }

  async renewMembership(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.id;
      const { planId } = req.body;

      const result = await this.membershipService.renewMembership(userId, planId);

      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  }

  async getPrepaidPacks(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const packs = await this.membershipService.getPrepaidPacks();

      res.json(successResponse(packs));
    } catch (error) {
      next(error);
    }
  }
}
