/**
 * Integration Tests: Email Service (SendGrid/SMTP)
 *
 * Tests email delivery including:
 * - Welcome emails
 * - OTP emails
 * - Payment receipts
 * - Password reset emails
 * - Match notification emails
 */

import { jest, describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';

// Mock nodemailer
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({
      messageId: 'test-message-id-123',
      envelope: { from: 'noreply@mplus.example.com', to: ['test@mplus.example.com'] },
    }),
    verify: jest.fn().mockResolvedValue(true),
  }),
}));

// Mock SendGrid
jest.mock('@sendgrid/mail', () => ({
  setApiKey: jest.fn(),
  send: jest.fn().mockResolvedValue([
    {
      statusCode: 202,
      headers: { 'x-message-id': 'sg-test-123' },
    },
  ]),
}));

import nodemailer from 'nodemailer';
import { EmailService } from '../../../src/shared/services/email.service';

describe('Email Service Integration', () => {
  let emailService: EmailService;

  beforeAll(() => {
    process.env.SMTP_HOST = 'smtp.test.com';
    process.env.SMTP_PORT = '587';
    process.env.SMTP_USER = 'test@mplus.example.com';
    process.env.SMTP_PASSWORD = 'test_password';
    process.env.SMTP_FROM_NAME = 'M-Plus Matrimony';
    process.env.SMTP_FROM_EMAIL = 'noreply@mplus.example.com';
  });

  afterAll(() => {
    delete process.env.SMTP_HOST;
    delete process.env.SMTP_PORT;
    delete process.env.SMTP_USER;
    delete process.env.SMTP_PASSWORD;
    delete process.env.SMTP_FROM_NAME;
    delete process.env.SMTP_FROM_EMAIL;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    emailService = new EmailService();
  });

  describe('Generic Email Sending', () => {
    it('should send email successfully', async () => {
      const result = await emailService.sendEmail({
        to: 'recipient@mplus.example.com',
        subject: 'Test Email',
        html: '<h1>Test</h1>',
        text: 'Test',
      });

      expect(result.success).toBe(true);
      expect(result.messageId).toBeDefined();
    });

    it('should handle email send failure gracefully', async () => {
      const mockedNodemailer = nodemailer as jest.Mocked<typeof nodemailer>;
      mockedNodemailer.createTransport.mockReturnValueOnce({
        sendMail: jest.fn().mockRejectedValue(new Error('SMTP connection failed')),
        verify: jest.fn(),
      } as any);

      const failingService = new EmailService();
      const result = await failingService.sendEmail({
        to: 'test@mplus.example.com',
        subject: 'Test',
        html: '<p>Test</p>',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should include proper headers and metadata', async () => {
      const sendMailMock = jest.fn().mockResolvedValue({ messageId: 'test-123' });
      const mockedNodemailer = nodemailer as jest.Mocked<typeof nodemailer>;
      mockedNodemailer.createTransport.mockReturnValueOnce({
        sendMail: sendMailMock,
        verify: jest.fn(),
      } as any);

      const service = new EmailService();
      await service.sendEmail({
        to: 'test@mplus.example.com',
        subject: 'Test Subject',
        html: '<p>Content</p>',
      });

      expect(sendMailMock).toHaveBeenCalledWith(
        expect.objectContaining({
          from: expect.stringContaining('M-Plus Matrimony'),
          to: 'test@mplus.example.com',
          subject: 'Test Subject',
        })
      );
    });
  });

  describe('Welcome Email', () => {
    it('should send welcome email to new user', async () => {
      const result = await emailService.sendWelcomeEmail(
        'newuser@mplus.example.com',
        'John'
      );

      expect(result.success).toBe(true);
      expect(result.messageId).toBeDefined();
    });

    it('should personalize welcome email with first name', async () => {
      const sendMailMock = jest.fn().mockResolvedValue({ messageId: 'test-123' });
      const mockedNodemailer = nodemailer as jest.Mocked<typeof nodemailer>;
      mockedNodemailer.createTransport.mockReturnValueOnce({
        sendMail: sendMailMock,
        verify: jest.fn(),
      } as any);

      const service = new EmailService();
      await service.sendWelcomeEmail('test@mplus.example.com', 'Priya');

      const mailCall = sendMailMock.mock.calls[0][0];
      expect(mailCall.html).toContain('Priya');
    });
  });

  describe('OTP Email', () => {
    it('should send OTP email with verification code', async () => {
      const result = await emailService.sendOtpEmail(
        'test@mplus.example.com',
        '123456'
      );

      expect(result.success).toBe(true);
    });

    it('should include OTP in email body', async () => {
      const sendMailMock = jest.fn().mockResolvedValue({ messageId: 'test-123' });
      const mockedNodemailer = nodemailer as jest.Mocked<typeof nodemailer>;
      mockedNodemailer.createTransport.mockReturnValueOnce({
        sendMail: sendMailMock,
        verify: jest.fn(),
      } as any);

      const service = new EmailService();
      await service.sendOtpEmail('test@mplus.example.com', '654321');

      const mailCall = sendMailMock.mock.calls[0][0];
      expect(mailCall.html).toContain('654321');
    });
  });

  describe('Payment Receipt', () => {
    it('should send payment receipt with invoice details', async () => {
      const result = await emailService.sendPaymentReceipt(
        'test@mplus.example.com',
        {
          invoiceNumber: 'INV-2026-001',
          amount: 1180,
          currency: 'INR',
          planName: 'Gold Plan',
          paymentDate: new Date(),
          paymentId: 'pay_test_123',
        }
      );

      expect(result.success).toBe(true);
    });

    it('should format amount in INR currency', async () => {
      const sendMailMock = jest.fn().mockResolvedValue({ messageId: 'test-123' });
      const mockedNodemailer = nodemailer as jest.Mocked<typeof nodemailer>;
      mockedNodemailer.createTransport.mockReturnValueOnce({
        sendMail: sendMailMock,
        verify: jest.fn(),
      } as any);

      const service = new EmailService();
      await service.sendPaymentReceipt('test@mplus.example.com', {
        invoiceNumber: 'INV-2026-002',
        amount: 2500,
        currency: 'INR',
        planName: 'Diamond Plan',
        paymentDate: new Date(),
        paymentId: 'pay_test_456',
      });

      const mailCall = sendMailMock.mock.calls[0][0];
      expect(mailCall.html).toContain('2,500');
      expect(mailCall.html).toContain('Diamond Plan');
    });
  });

  describe('Password Reset Email', () => {
    it('should send password reset link', async () => {
      const result = await emailService.sendPasswordResetEmail(
        'test@mplus.example.com',
        'https://mplus.example.com/reset?token=abc123'
      );

      expect(result.success).toBe(true);
    });
  });

  describe('Match Notification', () => {
    it('should send match notification email', async () => {
      const result = await emailService.sendMatchNotification(
        'test@mplus.example.com',
        {
          matchName: 'Priya K.',
          compatibilityScore: 90,
          profileUrl: 'https://mplus.example.com/profile/priya-123',
        }
      );

      expect(result.success).toBe(true);
    });
  });

  describe('Bulk Emails', () => {
    it('should send bulk marketing email to multiple recipients', async () => {
      const recipients = [
        'user1@mplus.example.com',
        'user2@mplus.example.com',
        'user3@mplus.example.com',
      ];

      const results = await emailService.sendBulkEmail(recipients, {
        subject: 'Special Offer',
        html: '<h1>50% Off!</h1>',
      });

      expect(Array.isArray(results)).toBe(true);
      expect(results).toHaveLength(3);
    });
  });
});
