import { db } from '../../config/database';
import logger from '../../config/logger';
import { v4 as uuidv4 } from 'uuid';

export class WebhookService {
  async logEvent(provider: string, eventType: string, payload: any): Promise<void> {
    try {
      await db('webhook_events').insert({
        id: uuidv4(),
        provider,
        event_type: eventType,
        payload: JSON.stringify(payload),
        status: 'received',
        created_at: new Date(),
      });
    } catch (error) {
      logger.error('Failed to log webhook event', { provider, eventType, error });
    }
  }

  async listEvents(page = 1, limit = 50, provider?: string): Promise<{ data: any[]; page: number; pageSize: number; total: number; totalPages: number }> {
    let query = db('webhook_events');
    if (provider) query = query.where('provider', provider);
    const total = (await query.clone().count('id as count').first()) as any;
    const totalCount = parseInt(total?.count || '0', 10);
    const data = await query.orderBy('created_at', 'desc').offset((page - 1) * limit).limit(limit);
    return { data, page, pageSize: limit, total: totalCount, totalPages: Math.ceil(totalCount / limit) };
  }
}

export const webhookService = new WebhookService();
