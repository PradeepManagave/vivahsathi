import { config } from '../../config/index';
import logger from '../../config/logger';
import axios from 'axios';

interface WhatsAppMessage {
  to: string;
  templateName?: string;
  parameters?: Record<string, string>;
  body?: string;
}

export class WhatsAppService {
  private static baseUrl = 'https://graph.facebook.com/v18.0';
  private static phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
  private static accessToken = process.env.WHATSAPP_ACCESS_TOKEN || '';

  static async sendTemplate(message: WhatsAppMessage) {
    if (!this.phoneNumberId || !this.accessToken) {
      logger.warn('WhatsApp not configured');
      return;
    }

    try {
      const payload: any = {
        messaging_product: 'whatsapp',
        to: message.to,
        type: 'template',
        template: {
          name: message.templateName,
          language: { code: 'en' },
          components: message.parameters ? [{
            type: 'body',
            parameters: Object.entries(message.parameters).map(([key, value]) => ({ type: 'text', text: value }))
          }] : undefined,
        },
      };

      await axios.post(`${this.baseUrl}/${this.phoneNumberId}/messages`, payload, {
        headers: { Authorization: `Bearer ${this.accessToken}`, 'Content-Type': 'application/json' },
      });
      logger.info(`WhatsApp template sent to ${message.to}`);
    } catch (err: any) {
      logger.error('WhatsApp send failed:', err?.response?.data || err.message);
    }
  }

  static async sendText(to: string, body: string) {
    if (!this.phoneNumberId || !this.accessToken) {
      logger.warn('WhatsApp not configured');
      return;
    }

    try {
      await axios.post(`${this.baseUrl}/${this.phoneNumberId}/messages`, {
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: { body },
      }, {
        headers: { Authorization: `Bearer ${this.accessToken}`, 'Content-Type': 'application/json' },
      });
      logger.info(`WhatsApp text sent to ${to}`);
    } catch (err: any) {
      logger.error('WhatsApp text send failed:', err?.response?.data || err.message);
    }
  }

  static async sendOtp(to: string, otp: string) {
    return this.sendTemplate({
      to,
      templateName: 'otp_verification',
      parameters: { otp },
    });
  }

  static async sendInterestAlert(to: string, fromName: string) {
    return this.sendTemplate({
      to,
      templateName: 'interest_received',
      parameters: { name: fromName },
    });
  }
}
