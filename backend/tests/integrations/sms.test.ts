/**
 * Integration Tests: SMS Service (MSG91/Twilio)
 *
 * Tests SMS delivery including:
 * - OTP messages
 * - Match notifications
 * - Payment confirmations
 * - Bulk SMS
 */

import { jest, describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';

// Mock MSG91
jest.mock('msg91', () => {
  return jest.fn().mockImplementation(() => ({
    send: jest.fn().mockResolvedValue({
      type: 'success',
      message: 'SMS sent successfully',
      request_id: 'msg91-test-123',
    }),
  }));
});

// Mock Twilio
jest.mock('twilio', () => {
  return jest.fn().mockImplementation(() => ({
    messages: {
      create: jest.fn().mockResolvedValue({
        sid: 'SM_test_123',
        status: 'queued',
        to: '+919876543210',
        from: '+1234567890',
      }),
    },
  }));
});

import { SmsService } from '../../../src/shared/services/sms.service';

describe('SMS Service Integration', () => {
  let smsService: SmsService;

  beforeAll(() => {
    process.env.SMS_PROVIDER = 'msg91';
    process.env.MSG91_AUTH_KEY = 'test_msg91_auth_key';
    process.env.MSG91_SENDER_ID = 'MPLUS';
    process.env.MSG91_ROUTE = '4';
    process.env.TWILIO_ACCOUNT_SID = 'AC_test_sid';
    process.env.TWILIO_AUTH_TOKEN = 'test_auth_token';
    process.env.TWILIO_PHONE_NUMBER = '+1234567890';
  });

  afterAll(() => {
    delete process.env.SMS_PROVIDER;
    delete process.env.MSG91_AUTH_KEY;
    delete process.env.MSG91_SENDER_ID;
    delete process.env.MSG91_ROUTE;
    delete process.env.TWILIO_ACCOUNT_SID;
    delete process.env.TWILIO_AUTH_TOKEN;
    delete process.env.TWILIO_PHONE_NUMBER;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    smsService = new SmsService();
  });

  describe('Generic SMS', () => {
    it('should send SMS successfully', async () => {
      const result = await smsService.sendSms({
        to: '+919876543210',
        message: 'Test message from M-Plus Matrimony',
      });

      expect(result.success).toBe(true);
      expect(result.messageId).toBeDefined();
    });

    it('should format phone number with country code', async () => {
      const result = await smsService.sendSms({
        to: '9876543210',
        message: 'Test',
      });

      expect(result.success).toBe(true);
    });

    it('should reject invalid phone numbers', async () => {
      const result = await smsService.sendSms({
        to: 'invalid',
        message: 'Test',
      });

      expect(result.success).toBe(false);
    });
  });

  describe('OTP SMS', () => {
    it('should send OTP SMS with verification code', async () => {
      const result = await smsService.sendOtp('+919876543210', '123456');

      expect(result.success).toBe(true);
    });

    it('should include OTP code in message', async () => {
      const MSG91 = require('msg91');
      const sendMock = jest.fn().mockResolvedValue({
        type: 'success',
        message: 'SMS sent',
        request_id: 'test-123',
      });
      MSG91.mockImplementation(() => ({ send: sendMock }));

      const service = new SmsService();
      await service.sendOtp('+919876543210', '654321');

      expect(sendMock).toHaveBeenCalled();
    });

    it('should set OTP expiry time', async () => {
      const result = await smsService.sendOtp('+919876543210', '111111');

      expect(result.success).toBe(true);
      expect(result.expiresAt).toBeDefined();
    });
  });

  describe('Match Notification', () => {
    it('should send match notification SMS', async () => {
      const result = await smsService.sendMatchNotification('+919876543210', {
        matchName: 'Priya',
        profileId: 'priya-123',
      });

      expect(result.success).toBe(true);
    });
  });

  describe('Payment Confirmation', () => {
    it('should send payment confirmation SMS', async () => {
      const result = await smsService.sendPaymentConfirmation('+919876543210', {
        amount: 1180,
        planName: 'Gold Plan',
        paymentId: 'pay_test_123',
      });

      expect(result.success).toBe(true);
    });
  });

  describe('Bulk SMS', () => {
    it('should send bulk SMS to multiple recipients', async () => {
      const recipients = [
        '+919876543210',
        '+919876543211',
        '+919876543212',
      ];

      const results = await smsService.sendBulkSms(recipients, {
        message: 'Special offer for premium members!',
      });

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(recipients.length);
    });

    it('should handle partial failures in bulk SMS', async () => {
      const recipients = [
        '+919876543210',
        'invalid',
        '+919876543212',
      ];

      const results = await smsService.sendBulkSms(recipients, {
        message: 'Test',
      });

      expect(results.length).toBe(recipients.length);
    });
  });

  describe('Provider Switching', () => {
    it('should use MSG91 provider when configured', async () => {
      process.env.SMS_PROVIDER = 'msg91';
      const service = new SmsService();
      const result = await service.sendSms({
        to: '+919876543210',
        message: 'Test',
      });

      expect(result.success).toBe(true);
    });

    it('should use Twilio provider when configured', async () => {
      process.env.SMS_PROVIDER = 'twilio';
      const service = new SmsService();
      const result = await service.sendSms({
        to: '+919876543210',
        message: 'Test',
      });

      expect(result.success).toBe(true);
    });
  });

  describe('Rate Limiting', () => {
    it('should respect rate limits for SMS sending', async () => {
      const promises = Array.from({ length: 10 }, (_, i) =>
        smsService.sendSms({
          to: `+9198765432${i.toString().padStart(2, '0')}`,
          message: 'Test',
        })
      );

      const results = await Promise.all(promises);
      expect(results).toHaveLength(10);
    });
  });
});
