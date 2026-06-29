import axios from 'axios';
import logger from '../../config/logger';
import { config } from '../../config/index';
import { ValidationError } from '../../shared/utils/errors';

interface PayPalOrder {
  id: string;
  status: string;
  purchase_units: Array<{
    amount: { currency_code: string; value: string };
    description?: string;
    reference_id?: string;
  }>;
  payer?: { email_address: string; payer_id: string };
}

interface PayPalCaptureResult {
  id: string;
  status: string;
  purchase_units: Array<{
    payments: {
      captures: Array<{ id: string; status: string; amount: { value: string; currency_code: string } }>;
    };
  }>;
}

export class PayPalService {
  private baseUrl: string;
  private clientId: string;
  private clientSecret: string;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor() {
    this.baseUrl = config.PAYPAL_MODE === 'live'
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com';
    this.clientId = config.PAYPAL_CLIENT_ID || '';
    this.clientSecret = config.PAYPAL_CLIENT_SECRET || '';
  }

  get isConfigured(): boolean {
    return !!(this.clientId && this.clientSecret);
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry) return this.accessToken!;

    try {
      const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
      const { data } = await axios.post(
        `${this.baseUrl}/v1/oauth2/token`,
        'grant_type=client_credentials',
        {
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
      this.accessToken = data.access_token;
      this.tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
      return data.access_token;
    } catch (error) {
      logger.error('PayPal auth failed', { error });
      throw new ValidationError('PayPal authentication failed');
    }
  }

  async createOrder(amount: number, currency = 'INR', description?: string): Promise<PayPalOrder> {
    if (!this.isConfigured) throw new ValidationError('PayPal not configured');

    const token = await this.getAccessToken();
    const { data } = await axios.post(
      `${this.baseUrl}/v2/checkout/orders`,
      {
        intent: 'CAPTURE',
        purchase_units: [{
          amount: { currency_code: currency, value: amount.toFixed(2) },
          description: description || 'VivahSathi Membership',
        }],
      },
      { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }
    );

    return data;
  }

  async captureOrder(orderId: string): Promise<PayPalCaptureResult> {
    if (!this.isConfigured) throw new ValidationError('PayPal not configured');

    const token = await this.getAccessToken();
    const { data } = await axios.post(
      `${this.baseUrl}/v2/checkout/orders/${orderId}/capture`,
      {},
      { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }
    );

    return data;
  }

  async verifyWebhook(headers: Record<string, string>, body: string): Promise<boolean> {
    if (!this.isConfigured) return false;
    try {
      const token = await this.getAccessToken();
      const { status } = await axios.post(
        `${this.baseUrl}/v1/notifications/verify-webhook-signature`,
        {
          auth_algo: headers['paypal-auth-algo'],
          cert_url: headers['paypal-cert-url'],
          transmission_id: headers['paypal-transmission-id'],
          transmission_sig: headers['paypal-transmission-sig'],
          transmission_time: headers['paypal-transmission-time'],
          webhook_id: config.PAYPAL_WEBHOOK_ID,
          webhook_event: JSON.parse(body),
        },
        { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );
      return status === 200;
    } catch {
      return false;
    }
  }

  async refundPayment(captureId: string, amount?: number): Promise<any> {
    if (!this.isConfigured) throw new ValidationError('PayPal not configured');

    const token = await this.getAccessToken();
    const payload: any = {};
    if (amount) payload.amount = { value: amount.toFixed(2), currency_code: 'INR' };

    const { data } = await axios.post(
      `${this.baseUrl}/v2/payments/captures/${captureId}/refund`,
      payload,
      { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }
    );

    return data;
  }
}
