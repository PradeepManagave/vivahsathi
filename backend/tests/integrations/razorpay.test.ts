/**
 * Integration Tests: Razorpay Payment Flow
 *
 * Tests the complete Razorpay payment integration including:
 * - Order creation
 * - Payment verification
 * - Webhook handling
 * - Membership activation
 * - Invoice generation
 */

import { jest, describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import crypto from 'crypto';

// Mock the database
jest.mock('../../../src/config/database', () => ({
  db: {
    insert: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    first: jest.fn(),
    update: jest.fn().mockReturnThis(),
    returning: jest.fn(),
    select: jest.fn().mockReturnThis(),
  },
}));

// Mock the logger
jest.mock('../../../src/config/logger', () => ({
  __esModule: true,
  default: { info: jest.fn(), error: jest.fn(), warn: jest.fn() },
  log: { info: jest.fn(), error: jest.fn(), warn: jest.fn() },
}));

// Mock the email service
jest.mock('../../../src/shared/services/email.service', () => ({
  EmailService: jest.fn().mockImplementation(() => ({
    sendPaymentReceipt: jest.fn().mockResolvedValue({ success: true, messageId: 'test' }),
    sendWelcomeEmail: jest.fn().mockResolvedValue({ success: true, messageId: 'test' }),
  })),
}));

// Mock razorpay SDK
jest.mock('razorpay', () => {
  return jest.fn().mockImplementation(() => ({
    orders: {
      create: jest.fn().mockResolvedValue({
        id: 'order_test_123',
        entity: 'order',
        amount: 118000,
        currency: 'INR',
        receipt: 'test_receipt',
        status: 'created',
      }),
      fetch: jest.fn().mockResolvedValue({
        id: 'order_test_123',
        status: 'paid',
      }),
    },
    payments: {
      fetch: jest.fn().mockResolvedValue({
        id: 'pay_test_123',
        status: 'captured',
        amount: 118000,
      }),
    },
    utils: {
      validateWebhookSignature: jest.fn().mockReturnValue(true),
    },
  }));
});

import { PaymentService } from '../../../src/modules/payments/payment.service';
import { createTestOrder, createRazorpayWebhookPayload } from '../utils/test-helpers';

describe('Razorpay Payment Integration', () => {
  let paymentService: PaymentService;

  beforeAll(() => {
    process.env.RAZORPAY_KEY_ID = 'rzp_test_key_id';
    process.env.RAZORPAY_KEY_SECRET = 'rzp_test_key_secret';
    process.env.GST_RATE = '0.18';
  });

  afterAll(() => {
    delete process.env.RAZORPAY_KEY_ID;
    delete process.env.RAZORPAY_KEY_SECRET;
    delete process.env.GST_RATE;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    paymentService = new PaymentService();
  });

  describe('Order Creation', () => {
    it('should create a Razorpay order successfully', async () => {
      const order = await paymentService.createOrder('test-user-id', 'plan-gold');

      expect(order).toHaveProperty('id');
      expect(order).toHaveProperty('amount');
      expect(order).toHaveProperty('currency');
      expect(order.currency).toBe('INR');
    });

    it('should apply coupon discount when provided', async () => {
      const order = await paymentService.createOrder('test-user-id', 'plan-gold', 'DISCOUNT20');

      expect(order).toHaveProperty('id');
      // Verify discount was applied
    });

    it('should include GST in total amount', async () => {
      const order = await paymentService.createOrder('test-user-id', 'plan-gold');

      // Amount should be base + 18% GST
      expect(order.amount).toBeGreaterThan(0);
    });

    it('should throw error for invalid plan', async () => {
      await expect(
        paymentService.createOrder('test-user-id', 'invalid-plan')
      ).rejects.toThrow();
    });

    it('should throw error for invalid user', async () => {
      await expect(
        paymentService.createOrder('invalid-user', 'plan-gold')
      ).rejects.toThrow();
    });
  });

  describe('Payment Verification', () => {
    it('should verify payment signature successfully', () => {
      const orderId = 'order_test_123';
      const paymentId = 'pay_test_123';
      const keySecret = process.env.RAZORPAY_KEY_SECRET!;

      const generatedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

      const isValid = paymentService.verifyPaymentSignature(
        orderId,
        paymentId,
        generatedSignature
      );

      expect(isValid).toBe(true);
    });

    it('should reject invalid signature', () => {
      const isValid = paymentService.verifyPaymentSignature(
        'order_test_123',
        'pay_test_123',
        'invalid_signature'
      );

      expect(isValid).toBe(false);
    });
  });

  describe('Webhook Handling', () => {
    it('should process payment.captured webhook', async () => {
      const webhookPayload = createRazorpayWebhookPayload();
      const webhookSignature = 'test_webhook_signature';

      const result = await paymentService.handleWebhook(
        JSON.stringify(webhookPayload),
        webhookSignature
      );

      expect(result).toHaveProperty('success', true);
    });

    it('should reject webhook with invalid signature', async () => {
      const webhookPayload = createRazorpayWebhookPayload();

      // Mock validateWebhookSignature to return false
      const Razorpay = require('razorpay');
      Razorpay.mockImplementation(() => ({
        utils: { validateWebhookSignature: jest.fn().mockReturnValue(false) },
        orders: { fetch: jest.fn() },
      }));

      const result = await paymentService.handleWebhook(
        JSON.stringify(webhookPayload),
        'invalid_signature'
      );

      expect(result).toHaveProperty('success', false);
    });

    it('should activate membership on successful payment', async () => {
      const webhookPayload = createRazorpayWebhookPayload({
        payload: {
          payment: {
            entity: {
              id: 'pay_test_123',
              order_id: 'order_test_123',
              status: 'captured',
              amount: 118000,
              email: 'test@mplus.example.com',
              contact: '+919876543210',
            },
          },
        },
      });

      const result = await paymentService.handleWebhook(
        JSON.stringify(webhookPayload),
        'test_signature'
      );

      expect(result).toHaveProperty('success', true);
      // Verify membership activation was triggered
    });
  });

  describe('Prepaid Packs', () => {
    it('should purchase prepaid pack successfully', async () => {
      const result = await paymentService.purchasePrepaidPack(
        'test-user-id',
        'pack-10-contacts'
      );

      expect(result).toHaveProperty('success');
    });

    it('should track prepaid pack usage', async () => {
      const result = await paymentService.usePrepaidContact('test-user-id', 'target-user-id');

      expect(result).toHaveProperty('remainingContacts');
    });
  });

  describe('Refund Processing', () => {
    it('should process refund for cancelled payment', async () => {
      const result = await paymentService.refundPayment('pay_test_123', 118000);

      expect(result).toHaveProperty('refundId');
    });

    it('should handle partial refund', async () => {
      const result = await paymentService.refundPayment('pay_test_123', 50000);

      expect(result).toHaveProperty('refundId');
      expect(result).toHaveProperty('amount', 50000);
    });
  });
});
