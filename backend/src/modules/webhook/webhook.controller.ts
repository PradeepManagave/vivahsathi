import { Request, Response, NextFunction } from 'express';
import { webhookService } from './webhook.service';
import { successResponse } from '../../shared/utils/response';

export class WebhookController {
  async listEvents(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = '1', limit = '50', provider } = req.query;
      const result = await webhookService.listEvents(parseInt(page as string, 10), parseInt(limit as string, 10), provider as string);
      res.json(successResponse(result));
    } catch (error) { next(error); }
  }
}

export const webhookController = new WebhookController();
