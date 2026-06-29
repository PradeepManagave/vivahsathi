/**
 * Test Utilities - Mocks, Helpers, and Fixtures
 */

import { jest } from '@jest/globals';

/**
 * Generate a test user object
 */
export const createTestUser = (overrides: Record<string, unknown> = {}) => ({
  id: 'test-user-id-123',
  email: 'test@mplus.example.com',
  phone: '+919876543210',
  firstName: 'Test',
  lastName: 'User',
  passwordHash: '$2a$10$test.hash.value.here',
  isVerified: true,
  isActive: true,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  ...overrides,
});

/**
 * Generate a test payment order
 */
export const createTestOrder = (overrides: Record<string, unknown> = {}) => ({
  id: 'order_test_123',
  userId: 'test-user-id-123',
  planId: 'plan-gold',
  amount: 118000, // ₹1180 in paise
  baseAmount: 1000,
  gstAmount: 180,
  currency: 'INR',
  status: 'pending',
  paymentMethod: 'razorpay',
  createdAt: new Date(),
  ...overrides,
});

/**
 * Generate a test Razorpay webhook payload
 */
export const createRazorpayWebhookPayload = (overrides: Record<string, unknown> = {}) => ({
  entity: 'event',
  account_id: 'acc_test_123',
  event: 'payment.captured',
  contains: ['payment'],
  payload: {
    payment: {
      entity: {
        id: 'pay_test_123',
        entity: 'payment',
        amount: 118000,
        currency: 'INR',
        status: 'captured',
        order_id: 'order_test_123',
        method: 'card',
        description: 'M-Plus Matrimony Gold Plan',
        vpa: null,
        email: 'test@mplus.example.com',
        contact: '+919876543210',
        fee: 2360,
        tax: 432,
        error_code: null,
        error_description: null,
        created_at: Math.floor(Date.now() / 1000),
      },
    },
  },
  created_at: Math.floor(Date.now() / 1000),
  ...overrides,
});

/**
 * Mock the Razorpay SDK
 */
export const mockRazorpay = () => {
  const mockOrders = {
    create: jest.fn().mockResolvedValue({
      id: 'order_test_123',
      entity: 'order',
      amount: 118000,
      amount_paid: 0,
      amount_due: 118000,
      currency: 'INR',
      receipt: 'test_receipt',
      status: 'created',
      attempts: 0,
      notes: {},
      created_at: Math.floor(Date.now() / 1000),
    }),
    fetch: jest.fn().mockResolvedValue({
      id: 'order_test_123',
      status: 'paid',
    }),
  };

  const mockPayments = {
    fetch: jest.fn().mockResolvedValue({
      id: 'pay_test_123',
      status: 'captured',
      amount: 118000,
    }),
  };

  const mockUtils = {
    validateWebhookSignature: jest.fn().mockReturnValue(true),
  };

  return {
    orders: mockOrders,
    payments: mockPayments,
    utils: mockUtils,
  };
};

/**
 * Mock the Email Service
 */
export const mockEmailService = () => ({
  sendEmail: jest.fn().mockResolvedValue({
    success: true,
    messageId: 'test-message-id-123',
  }),
  sendWelcomeEmail: jest.fn().mockResolvedValue({
    success: true,
    messageId: 'test-message-id-123',
  }),
  sendOtpEmail: jest.fn().mockResolvedValue({
    success: true,
    messageId: 'test-message-id-123',
  }),
  sendPaymentReceipt: jest.fn().mockResolvedValue({
    success: true,
    messageId: 'test-message-id-123',
  }),
});

/**
 * Mock the SMS Service
 */
export const mockSmsService = () => ({
  sendSms: jest.fn().mockResolvedValue({
    success: true,
    messageId: 'sms-test-123',
  }),
  sendOtp: jest.fn().mockResolvedValue({
    success: true,
    messageId: 'sms-otp-123',
  }),
});

/**
 * Mock the S3 Client
 */
export const mockS3Client = () => ({
  send: jest.fn().mockResolvedValue({
    ETag: '"test-etag"',
    VersionId: 'test-version-id',
    Location: 'https://test-bucket.s3.amazonaws.com/test-key',
    Key: 'test-key',
    Bucket: 'test-bucket',
  }),
});

/**
 * Mock the Elasticsearch Client
 */
export const mockElasticsearchClient = () => ({
  index: jest.fn().mockResolvedValue({
    _index: 'profiles',
    _id: 'test-id',
    _version: 1,
    result: 'created',
  }),
  search: jest.fn().mockResolvedValue({
    hits: {
      total: { value: 1, relation: 'eq' },
      hits: [
        {
          _index: 'profiles',
          _id: 'test-id',
          _score: 1.0,
          _source: { name: 'Test Profile' },
        },
      ],
    },
  }),
  update: jest.fn().mockResolvedValue({
    _index: 'profiles',
    _id: 'test-id',
    _version: 2,
    result: 'updated',
  }),
  delete: jest.fn().mockResolvedValue({
    _index: 'profiles',
    _id: 'test-id',
    _version: 3,
    result: 'deleted',
  }),
});

/**
 * Wait for a specified number of milliseconds
 */
export const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Generate a random string for testing
 */
export const randomString = (length: number = 10): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};
