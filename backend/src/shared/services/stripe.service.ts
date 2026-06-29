import Stripe from 'stripe';
import logger from '../../config/logger';
import { config } from '../../config/index';
import { ValidationError } from '../../shared/utils/errors';

export class StripeService {
  private stripe: Stripe | null = null;

  constructor() {
    if (config.STRIPE_SECRET_KEY) {
      this.stripe = new Stripe(config.STRIPE_SECRET_KEY, {
        apiVersion: '2024-06-20',
      });
    }
  }

  get isConfigured(): boolean {
    return !!this.stripe;
  }

  async createPaymentIntent(amount: number, currency = 'inr', metadata?: Record<string, string>): Promise<Stripe.PaymentIntent> {
    if (!this.stripe) throw new ValidationError('Stripe not configured');

    return this.stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency,
      metadata,
      automatic_payment_methods: { enabled: true },
    });
  }

  async confirmPayment(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    if (!this.stripe) throw new ValidationError('Stripe not configured');

    return this.stripe.paymentIntents.confirm(paymentIntentId);
  }

  async retrievePaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    if (!this.stripe) throw new ValidationError('Stripe not configured');

    return this.stripe.paymentIntents.retrieve(paymentIntentId);
  }

  async createRefund(paymentIntentId: string, amount?: number): Promise<Stripe.Refund> {
    if (!this.stripe) throw new ValidationError('Stripe not configured');

    return this.stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined,
    });
  }

  verifyWebhookSignature(payload: string | Buffer, signature: string): Stripe.Event {
    if (!this.stripe) throw new ValidationError('Stripe not configured');
    if (!config.STRIPE_WEBHOOK_SECRET) throw new ValidationError('Stripe webhook secret not configured');

    return this.stripe.webhooks.constructEvent(payload, signature, config.STRIPE_WEBHOOK_SECRET);
  }

  async listPaymentMethods(customerId: string): Promise<Stripe.PaymentMethod[]> {
    if (!this.stripe) throw new ValidationError('Stripe not configured');

    const methods = await this.stripe.paymentMethods.list({ customer: customerId, type: 'card' });
    return methods.data;
  }

  async createProduct(name: string, description?: string): Promise<Stripe.Product> {
    if (!this.stripe) throw new ValidationError('Stripe not configured');

    return this.stripe.products.create({ name, description });
  }

  async createPrice(productId: string, amount: number, currency = 'inr', interval?: 'month' | 'year'): Promise<Stripe.Price> {
    if (!this.stripe) throw new ValidationError('Stripe not configured');

    return this.stripe.prices.create({
      product: productId,
      unit_amount: Math.round(amount * 100),
      currency,
      recurring: interval ? { interval } : undefined,
    });
  }

  async createCheckoutSession(
    priceId: string,
    successUrl: string,
    cancelUrl: string,
    customerEmail?: string,
    metadata?: Record<string, string>
  ): Promise<Stripe.Checkout.Session> {
    if (!this.stripe) throw new ValidationError('Stripe not configured');

    return this.stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: customerEmail,
      metadata,
    });
  }
}
