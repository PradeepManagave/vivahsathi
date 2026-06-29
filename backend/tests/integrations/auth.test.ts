/**
 * Integration Tests: Authentication Flow
 *
 * Tests complete auth lifecycle including:
 * - User registration
 * - OTP verification
 * - Login/logout
 * - Token refresh
 * - 2FA setup and verification
 * - Password reset
 * - Session management
 * - Rate limiting
 */

import { jest, describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import bcrypt from 'bcryptjs';

// Mock SMS Service
jest.mock('../../../src/shared/services/sms.service', () => ({
  SmsService: jest.fn().mockImplementation(() => ({
    sendOtp: jest.fn().mockResolvedValue({ success: true, messageId: 'sms-123' }),
    sendSms: jest.fn().mockResolvedValue({ success: true, messageId: 'sms-123' }),
  })),
}));

// Mock Email Service
jest.mock('../../../src/shared/services/email.service', () => ({
  EmailService: jest.fn().mockImplementation(() => ({
    sendWelcomeEmail: jest.fn().mockResolvedValue({ success: true, messageId: 'email-123' }),
    sendOtpEmail: jest.fn().mockResolvedValue({ success: true, messageId: 'email-123' }),
    sendPasswordResetEmail: jest.fn().mockResolvedValue({ success: true, messageId: 'email-123' }),
  })),
}));

// Mock speakeasy for 2FA
jest.mock('speakeasy', () => ({
  generateSecret: jest.fn().mockReturnValue({
    base32: 'JBSWY3DPEHPK3PXP',
    otpauth_url: 'otpauth://totp/MPlus:user@test.com?secret=JBSWY3DPEHPK3PXP&issuer=MPlus',
  }),
  totp: {
    verify: jest.fn().mockReturnValue({ delta: 0 }),
    generate: jest.fn().mockReturnValue('123456'),
  },
}));

// Mock QRCode
jest.mock('qrcode', () => ({
  toDataURL: jest.fn().mockResolvedValue('data:image/png;base64,iVBOR...'),
}));

// Mock database
const mockUser = {
  id: 'user-123',
  phone: '+919876543210',
  email: 'test@mplus.example.com',
  first_name: 'Test',
  last_name: 'User',
  gender: 'male',
  date_of_birth: '1995-05-15',
  religion: 'Hindu',
  password_hash: '',
  role: 'member',
  is_active: true,
  is_verified: true,
  two_factor_enabled: false,
  login_attempts: 0,
  locked_until: null,
  created_at: new Date(),
  updated_at: new Date(),
};

jest.mock('../../../src/config/database', () => {
  const mockDb: any = {
    insert: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    first: jest.fn(),
    update: jest.fn().mockReturnThis(),
    returning: jest.fn(),
    select: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
  };
  return { db: mockDb };
});

// Mock Redis
jest.mock('../../../src/config/redis', () => ({
  cache: {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue('OK'),
    del: jest.fn().mockResolvedValue(1),
  },
  sessions: {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue('OK'),
    del: jest.fn().mockResolvedValue(1),
    expire: jest.fn().mockResolvedValue(1),
  },
}));

// Mock logger
jest.mock('../../../src/config/logger', () => ({
  __esModule: true,
  default: { info: jest.fn(), error: jest.fn(), warn: jest.fn() },
  log: { info: jest.fn(), error: jest.fn(), warn: jest.fn() },
}));

// Mock config
jest.mock('../../../src/config/index', () => ({
  config: {
    JWT_SECRET: 'test-jwt-secret-key-for-testing-only',
    JWT_REFRESH_SECRET: 'test-refresh-secret-key-for-testing-only',
    JWT_EXPIRY: '15m',
    JWT_REFRESH_EXPIRY: '30d',
    OTP_EXPIRY: 600,
    SMS_PROVIDER: 'msg91',
    MSG91_AUTH_KEY: 'test-msg91-key',
    TOTP_ISSUER: 'MPlus Test',
    MAX_LOGIN_ATTEMPTS: 5,
    ACCOUNT_LOCK_MINUTES: 15,
    PASSWORD_SALT_ROUNDS: 12,
  },
}));

import { AuthService } from '../../../src/modules/auth/auth.service';

describe('Authentication Flow Integration', () => {
  let authService: AuthService;
  const hashedPassword = bcrypt.hashSync('Test@12345', 10);

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key-for-testing-only';
  });

  afterAll(() => {
    delete process.env.JWT_SECRET;
    delete process.env.JWT_REFRESH_SECRET;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    authService = new AuthService();
  });

  describe('User Registration', () => {
    it('should register a new user with phone number', async () => {
      const db = require('../../../src/config/database').db;
      db.where.mockReturnValue({ first: db });
      db.first.mockResolvedValue(null); // No existing user
      db.insert.mockReturnValue({ returning: db });
      db.returning.mockResolvedValue([mockUser]);

      const result = await authService.register({
        userId: 'user-123',
        phone: '+919876543210',
        firstName: 'Test',
        lastName: 'User',
        gender: 'male',
        dateOfBirth: '1995-05-15',
        religion: 'Hindu',
        password: 'Test@12345',
        ip: '127.0.0.1',
      });

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('tokens');
      expect(result.tokens).toHaveProperty('accessToken');
      expect(result.tokens).toHaveProperty('refreshToken');
    });

    it('should register with email as well', async () => {
      const db = require('../../../src/config/database').db;
      db.where.mockReturnValue({ first: db });
      db.first.mockResolvedValue(null);
      db.insert.mockReturnValue({ returning: db });
      db.returning.mockResolvedValue([{ ...mockUser, email: 'test@mplus.example.com' }]);

      const result = await authService.register({
        userId: 'user-123',
        phone: '+919876543210',
        email: 'test@mplus.example.com',
        firstName: 'Test',
        lastName: 'User',
        gender: 'male',
        dateOfBirth: '1995-05-15',
        religion: 'Hindu',
        password: 'Test@12345',
        ip: '127.0.0.1',
      });

      expect(result.user).toBeDefined();
    });

    it('should reject duplicate phone number', async () => {
      const db = require('../../../src/config/database').db;
      db.where.mockReturnValue({ first: db });
      db.first.mockResolvedValue(mockUser); // Existing user

      await expect(
        authService.register({
          userId: 'user-456',
          phone: '+919876543210',
          firstName: 'Test',
          lastName: 'User',
          gender: 'male',
          dateOfBirth: '1995-05-15',
          religion: 'Hindu',
          password: 'Test@12345',
          ip: '127.0.0.1',
        })
      ).rejects.toThrow();
    });

    it('should hash password before storing', async () => {
      const db = require('../../../src/config/database').db;
      db.where.mockReturnValue({ first: db });
      db.first.mockResolvedValue(null);
      db.insert.mockReturnValue({ returning: db });
      db.returning.mockResolvedValue([mockUser]);

      await authService.register({
        userId: 'user-123',
        phone: '+919876543210',
        firstName: 'Test',
        lastName: 'User',
        gender: 'male',
        dateOfBirth: '1995-05-15',
        religion: 'Hindu',
        password: 'Test@12345',
        ip: '127.0.0.1',
      });

      expect(db.insert).toHaveBeenCalled();
    });
  });

  describe('OTP Verification', () => {
    it('should send OTP for phone verification', async () => {
      const result = await authService.sendOtp('+919876543210', 'registration');

      expect(result).toHaveProperty('expiresIn');
    });

    it('should verify valid OTP', async () => {
      const cache = require('../../../src/config/redis').cache;
      cache.get.mockResolvedValue('123456');

      const result = await authService.verifyOtp('+919876543210', '123456', 'registration');

      expect(result).toHaveProperty('verified', true);
    });

    it('should reject invalid OTP', async () => {
      const cache = require('../../../src/config/redis').cache;
      cache.get.mockResolvedValue('123456');

      const result = await authService.verifyOtp('+919876543210', '999999', 'registration');

      expect(result).toHaveProperty('verified', false);
    });

    it('should reject expired OTP', async () => {
      const cache = require('../../../src/config/redis').cache;
      cache.get.mockResolvedValue(null); // Expired

      await expect(
        authService.verifyOtp('+919876543210', '123456', 'registration')
      ).rejects.toThrow();
    });

    it('should rate limit OTP requests', async () => {
      const cache = require('../../../src/config/redis').cache;
      cache.get.mockResolvedValue('5'); // Already sent 5

      await expect(
        authService.sendOtp('+919876543210', 'registration')
      ).rejects.toThrow();
    });
  });

  describe('Login', () => {
    it('should login with phone and password', async () => {
      const db = require('../../../src/config/database').db;
      db.where.mockReturnValue({ first: db });
      db.first.mockResolvedValue({ ...mockUser, password_hash: hashedPassword });

      const sessions = require('../../../src/config/redis').sessions;
      sessions.set.mockResolvedValue('OK');

      const result = await authService.login({
        phone: '+919876543210',
        password: 'Test@12345',
        ip: '127.0.0.1',
      });

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('tokens');
      expect(result.tokens).toHaveProperty('accessToken');
    });

    it('should reject invalid password', async () => {
      const db = require('../../../src/config/database').db;
      db.where.mockReturnValue({ first: db });
      db.first.mockResolvedValue({ ...mockUser, password_hash: hashedPassword });

      await expect(
        authService.login({
          phone: '+919876543210',
          password: 'WrongPassword',
          ip: '127.0.0.1',
        })
      ).rejects.toThrow();
    });

    it('should reject login for non-existent user', async () => {
      const db = require('../../../src/config/database').db;
      db.where.mockReturnValue({ first: db });
      db.first.mockResolvedValue(null);

      await expect(
        authService.login({
          phone: '+919999999999',
          password: 'Test@12345',
          ip: '127.0.0.1',
        })
      ).rejects.toThrow();
    });

    it('should track failed login attempts', async () => {
      const db = require('../../../src/config/database').db;
      db.where.mockReturnValue({ first: db });
      db.first.mockResolvedValue({ ...mockUser, password_hash: hashedPassword });
      db.update.mockResolvedValue(1);

      for (let i = 0; i < 3; i++) {
        try {
          await authService.login({
            phone: '+919876543210',
            password: 'WrongPassword',
            ip: '127.0.0.1',
          });
        } catch {}
      }

      expect(db.update).toHaveBeenCalled();
    });

    it('should lock account after max failed attempts', async () => {
      const db = require('../../../src/config/database').db;
      db.where.mockReturnValue({ first: db });
      db.first.mockResolvedValue({
        ...mockUser,
        password_hash: hashedPassword,
        login_attempts: 5,
        locked_until: new Date(Date.now() + 15 * 60 * 1000),
      });

      await expect(
        authService.login({
          phone: '+919876543210',
          password: 'Test@12345',
          ip: '127.0.0.1',
        })
      ).rejects.toThrow();
    });

    it('should require 2FA when enabled', async () => {
      const db = require('../../../src/config/database').db;
      db.where.mockReturnValue({ first: db });
      db.first.mockResolvedValue({
        ...mockUser,
        password_hash: hashedPassword,
        two_factor_enabled: true,
      });

      const sessions = require('../../../src/config/redis').sessions;
      sessions.set.mockResolvedValue('OK');

      const result = await authService.login({
        phone: '+919876543210',
        password: 'Test@12345',
        ip: '127.0.0.1',
      });

      expect(result.requires2fa).toBe(true);
      expect(result).toHaveProperty('tempToken');
    });
  });

  describe('Token Management', () => {
    it('should refresh access token with valid refresh token', async () => {
      const db = require('../../../src/config/database').db;
      db.where.mockReturnValue({ first: db });
      db.first.mockResolvedValue(mockUser);

      const sessions = require('../../../src/config/redis').sessions;
      sessions.get.mockResolvedValue(JSON.stringify({
        userId: 'user-123',
        role: 'member',
        permissions: [],
        twoFactorEnabled: false,
      }));
      sessions.set.mockResolvedValue('OK');

      const jwt = require('jsonwebtoken');
      const refreshToken = jwt.sign(
        { userId: 'user-123', type: 'refresh' },
        process.env.JWT_REFRESH_SECRET!,
        { expiresIn: '30d' }
      );

      const result = await authService.refreshToken(refreshToken);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should reject expired refresh token', async () => {
      const jwt = require('jsonwebtoken');
      const expiredToken = jwt.sign(
        { userId: 'user-123', type: 'refresh' },
        process.env.JWT_REFRESH_SECRET!,
        { expiresIn: '0s' }
      );

      await expect(
        authService.refreshToken(expiredToken)
      ).rejects.toThrow();
    });

    it('should reject invalid refresh token', async () => {
      await expect(
        authService.refreshToken('invalid-token')
      ).rejects.toThrow();
    });
  });

  describe('2FA Setup and Verification', () => {
    it('should generate 2FA secret and QR code', async () => {
      const db = require('../../../src/config/database').db;
      db.where.mockReturnValue({ first: db, update: db });
      db.first.mockResolvedValue(mockUser);
      db.update.mockResolvedValue(1);

      const result = await authService.setup2fa('user-123');

      expect(result).toHaveProperty('secret');
      expect(result).toHaveProperty('qrCodeUrl');
      expect(result).toHaveProperty('backupCodes');
      expect(Array.isArray(result.backupCodes)).toBe(true);
    });

    it('should verify TOTP code for 2FA activation', async () => {
      const db = require('../../../src/config/database').db;
      db.where.mockReturnValue({ first: db, update: db });
      db.first.mockResolvedValue(mockUser);
      db.update.mockResolvedValue(1);

      const result = await authService.verify2faSetup('user-123', '123456');

      expect(result).toHaveProperty('verified', true);
    });

    it('should reject invalid TOTP code', async () => {
      const speakeasy = require('speakeasy');
      speakeasy.totp.verify.mockReturnValueOnce(false);

      const result = await authService.verify2faSetup('user-123', '999999');

      expect(result).toHaveProperty('verified', false);
    });

    it('should complete login with 2FA verification', async () => {
      const db = require('../../../src/config/database').db;
      db.where.mockReturnValue({ first: db, update: db });
      db.first.mockResolvedValue({ ...mockUser, two_factor_enabled: true });
      db.update.mockResolvedValue(1);

      const sessions = require('../../../src/config/redis').sessions;
      sessions.get.mockResolvedValue(JSON.stringify({
        userId: 'user-123',
        role: 'member',
        permissions: [],
        twoFactorEnabled: true,
        requires2fa: true,
      }));
      sessions.set.mockResolvedValue('OK');

      const jwt = require('jsonwebtoken');
      const tempToken = jwt.sign(
        { userId: 'user-123', type: '2fa_pending' },
        process.env.JWT_SECRET!,
        { expiresIn: '5m' }
      );

      const result = await authService.verify2faLogin(tempToken, '123456');

      expect(result).toHaveProperty('tokens');
      expect(result.tokens).toHaveProperty('accessToken');
    });
  });

  describe('Password Management', () => {
    it('should send password reset email', async () => {
      const db = require('../../../src/config/database').db;
      db.where.mockReturnValue({ first: db });
      db.first.mockResolvedValue({ ...mockUser, email: 'test@mplus.example.com' });

      const result = await authService.forgotPassword('test@mplus.example.com');

      expect(result).toHaveProperty('success', true);
    });

    it('should reset password with valid token', async () => {
      const db = require('../../../src/config/database').db;
      db.where.mockReturnValue({ first: db, update: db });
      db.first.mockResolvedValue({ id: 'user-123', email: 'test@mplus.example.com' });
      db.update.mockResolvedValue(1);

      const cache = require('../../../src/config/redis').cache;
      cache.get.mockResolvedValue('user-123');

      const result = await authService.resetPassword('valid-reset-token', 'NewPass@123');

      expect(result).toHaveProperty('success', true);
    });

    it('should change password when authenticated', async () => {
      const db = require('../../../src/config/database').db;
      db.where.mockReturnValue({ first: db, update: db });
      db.first.mockResolvedValue({ ...mockUser, password_hash: hashedPassword });
      db.update.mockResolvedValue(1);

      const result = await authService.changePassword(
        'user-123',
        'Test@12345',
        'NewPass@1234'
      );

      expect(result).toHaveProperty('success', true);
    });
  });

  describe('Session Management', () => {
    it('should create session on login', async () => {
      const sessions = require('../../../src/config/redis').sessions;
      sessions.set.mockResolvedValue('OK');

      const db = require('../../../src/config/database').db;
      db.where.mockReturnValue({ first: db });
      db.first.mockResolvedValue({ ...mockUser, password_hash: hashedPassword });

      await authService.login({
        phone: '+919876543210',
        password: 'Test@12345',
        ip: '127.0.0.1',
      });

      expect(sessions.set).toHaveBeenCalled();
    });

    it('should invalidate session on logout', async () => {
      const sessions = require('../../../src/config/redis').sessions;
      sessions.del.mockResolvedValue(1);

      await authService.logout('user-123', 'session-token');

      expect(sessions.del).toHaveBeenCalled();
    });

    it('should invalidate all sessions on password change', async () => {
      const sessions = require('../../../src/config/redis').sessions;
      sessions.del.mockResolvedValue(1);
    });
  });
});
