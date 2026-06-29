// ============================================================
// Payment Controller
// ============================================================

import { Request, Response, NextFunction } from 'express';
import { PaymentService } from './payment.service';
import { successResponse } from '../../shared/utils/response';

export class PaymentController {
  private paymentService: PaymentService;

  constructor() {
    this.paymentService = new PaymentService();
  }

  async createOrder(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.id;
      const { planId, couponCode } = req.body;

      const order = await this.paymentService.createOrder(userId, planId, couponCode);

      res.json(successResponse(order));
    } catch (error) {
      next(error);
    }
  }

  async verifyPayment(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.id;
      const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

      const result = await this.paymentService.verifyPayment(
        userId,
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature
      );

      res.json(successResponse(result, 'Payment verified successfully'));
    } catch (error) {
      next(error);
    }
  }

  async handleWebhook(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const payload = req.body;
      const signature = req.headers['x-razorpay-signature'] as string;

      await this.paymentService.handleWebhook(payload, signature);

      res.json(successResponse({ received: true }));
    } catch (error) {
      next(error);
    }
  }

  async recordOfflinePayment(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const staffId = req.user!.id;
      const { userId, planId, amount, paymentMode, transactionRef, notes } = req.body;

      const result = await this.paymentService.recordOfflinePayment(
        staffId,
        userId,
        planId,
        amount,
        paymentMode,
        transactionRef,
        notes
      );

      res.status(201).json(successResponse(result, 'Payment recorded successfully'));
    } catch (error) {
      next(error);
    }
  }

  async getPaymentHistory(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.id;
      const { page = 1, limit = 20, status } = req.query;

      const result = await this.paymentService.getPaymentHistory(
        userId,
        parseInt(page as string),
        parseInt(limit as string),
        status as string | undefined
      );

      res.json(successResponse(result.data, undefined, {
        page: result.page,
        pageSize: result.pageSize,
        total: result.total,
        totalPages: result.totalPages
      }));
    } catch (error) {
      next(error);
    }
  }

  async getInvoice(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.id;
      const { paymentId } = req.params;

      const invoice = await this.paymentService.getInvoice(userId, paymentId);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="invoice-${paymentId}.pdf"`);
      res.send(invoice);
    } catch (error) {
      next(error);
    }
  }

  async getPendingPayments(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { page = 1, limit = 20 } = req.query;

      const result = await this.paymentService.getPendingPayments(
        parseInt(page as string),
        parseInt(limit as string)
      );

      res.json(successResponse(result.data, undefined, {
        page: result.page,
        pageSize: result.pageSize,
        total: result.total,
        totalPages: result.totalPages
      }));
    } catch (error) {
      next(error);
    }
  }

  async getPaymentStats(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { startDate, endDate, groupBy } = req.query;

      const stats = await this.paymentService.getPaymentStats(
        startDate as string | undefined,
        endDate as string | undefined,
        groupBy as string | undefined
      );

      res.json(successResponse(stats));
    } catch (error) {
      next(error);
    }
  }

  async refundPayment(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const adminId = req.user!.id;
      const { paymentId } = req.params;
      const { amount, reason } = req.body;

      const result = await this.paymentService.refundPayment(adminId, paymentId, amount, reason);

      res.json(successResponse(result, 'Refund processed successfully'));
    } catch (error) {
      next(error);
    }
  }

  async purchasePrepaidPack(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.id;
      const { packId } = req.body;

      const order = await this.paymentService.purchasePrepaidPack(userId, packId);

      res.json(successResponse(order));
    } catch (error) {
      next(error);
    }
  }
}
