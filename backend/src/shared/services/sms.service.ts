// ============================================================
// SMS Service - MSG91 Integration
// ============================================================

import { config } from '../../config/index';
import logger from '../../config/logger';

interface SmsResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

export class SmsService {
  private provider: string;
  private msg91AuthKey: string;
  private msg91SenderId: string;
  private msg91TemplateId: string;

  constructor() {
    this.provider = process.env.SMS_PROVIDER || 'msg91';
    this.msg91AuthKey = process.env.MSG91_AUTH_KEY || '';
    this.msg91SenderId = process.env.MSG91_SENDER_ID || 'MPLUSM';
    this.msg91TemplateId = process.env.MSG91_DLT_TEMPLATE_ID || '';
  }

  /**
   * Send OTP SMS via MSG91
   */
  async sendOtp(phone: string, otp: string): Promise<SmsResponse> {
    const message = `Your M-Plus Matrimony OTP is ${otp}. Valid for 10 minutes. Do not share with anyone.`;

    return this.sendSms(phone, message, 'otp');
  }

  /**
   * Send custom SMS
   */
  async sendSms(phone: string, message: string, type: string = 'general'): Promise<SmsResponse> {
    try {
      switch (this.provider) {
        case 'msg91':
          return await this.sendViaMsg91(phone, message);
        case 'twilio':
          return await this.sendViaTwilio(phone, message);
        default:
          logger.warn('SMS provider not configured, message logged');
          logger.info(`SMS [${type}] to ${phone}: ${message}`);
          return { success: true, messageId: 'mock-message-id' };
      }
    } catch (error) {
      logger.error('SMS send failed', { error, phone, type });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Send bulk SMS
   */
  async sendBulkSms(phones: string[], message: string): Promise<{
    success: number;
    failed: number;
    errors: string[];
  }> {
    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const phone of phones) {
      const result = await this.sendSms(phone, message, 'bulk');
      if (result.success) {
        success++;
      } else {
        failed++;
        errors.push(`${phone}: ${result.error}`);
      }
    }

    return { success, failed, errors };
  }

  /**
   * Send via MSG91
   */
  private async sendViaMsg91(phone: string, message: string): Promise<SmsResponse> {
    const url = 'https://api.msg91.com/api/v5/flow/';

    const payload = {
      flow_id: this.msg91TemplateId,
      sender: this.msg91SenderId,
      mobiles: `91${phone}`,
      OTP: message.match(/\d{6}/)?.[0] || '', // Extract OTP if present
      message
    };

    const fetchResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'authkey': this.msg91AuthKey
      },
      body: JSON.stringify(payload)
    });

    if (!(fetchResponse as any).ok) {
      const error = await (fetchResponse as any).text();
      logger.error('MSG91 API error', { status: (fetchResponse as any).status, error });
      return { success: false, error };
    }

    const data = await (fetchResponse as any).json() as { type?: string; message?: string };

    if (data.type === 'success') {
      return { success: true, messageId: data.message };
    }

    return { success: false, error: data.message || 'Unknown error' };
  }

  /**
   * Send via Twilio
   */
  private async sendViaTwilio(phone: string, message: string): Promise<SmsResponse> {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !fromNumber) {
      return { success: false, error: 'Twilio not configured' };
    }

    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

    const formData = new URLSearchParams();
    formData.append('To', `+91${phone}`);
    formData.append('From', fromNumber);
    formData.append('Body', message);

    const fetchResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData.toString()
    });

    if (!(fetchResponse as any).ok) {
      const error = await (fetchResponse as any).text();
      logger.error('Twilio API error', { status: (fetchResponse as any).status, error });
      return { success: false, error };
    }

    const data = await (fetchResponse as any).json() as { sid?: string; error_code?: string; error_message?: string };

    if (data.sid) {
      return { success: true, messageId: data.sid };
    }

    return { success: false, error: data.error_message || 'Unknown error' };
  }

  /**
   * Get SMS delivery status
   */
  async getDeliveryStatus(messageId: string): Promise<'delivered' | 'pending' | 'failed'> {
    // Implementation depends on provider
    // For now, return pending
    return 'pending';
  }
}
