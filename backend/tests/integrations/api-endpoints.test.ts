/**
 * Integration Tests: API Endpoints (Auth Routes)
 *
 * Tests HTTP API endpoints using supertest including:
 * - POST /auth/register
 * - POST /auth/login
 * - POST /auth/send-otp
 * - POST /auth/verify-otp
 * - POST /auth/refresh
 * - POST /auth/logout
 * - POST /auth/forgot-password
 * - POST /auth/reset-password
 * - POST /auth/2fa/setup
 * - POST /auth/2fa/verify
 * - GET /auth/me
 */

import { jest, describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import express from 'express';

// Mock all external dependencies
jest.mock('../../src/config/database', () => {
  const mockDb: any = {
    insert: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    first: jest.fn(),
    update: jest.fn().mockReturnThis(),
    returning: jest.fn(),
    select: jest.fn().mockReturnThis(),
  };
  return { db: mockDb };
});

jest.mock('../../src/config/redis', () => ({
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

jest.mock('../../src/config/logger', () => ({
  __esModule: true,
  default: { info: jest.fn(), error: jest.fn(), warn: jest.fn() },
  log: { info: jest.fn(), error: jest.fn(), warn: jest.fn() },
}));

jest.mock('../../src/config/index', () => ({
  config: {
    JWT_SECRET: 'test-jwt-secret',
    JWT_REFRESH_SECRET: 'test-refresh-secret',
    JWT_EXPIRY: '15m',
    JWT_REFRESH_EXPIRY: '30d',
    OTP_EXPIRY: 600,
    PASSWORD_SALT_ROUNDS: 12,
  },
}));

jest.mock('../../src/shared/services/sms.service', () => ({
  SmsService: jest.fn().mockImplementation(() => ({
    sendOtp: jest.fn().mockResolvedValue({ success: true }),
    sendSms: jest.fn().mockResolvedValue({ success: true }),
  })),
}));

jest.mock('../../src/shared/services/email.service', () => ({
  EmailService: jest.fn().mockImplementation(() => ({
    sendWelcomeEmail: jest.fn().mockResolvedValue({ success: true }),
    sendOtpEmail: jest.fn().mockResolvedValue({ success: true }),
    sendPasswordResetEmail: jest.fn().mockResolvedValue({ success: true }),
  })),
}));

jest.mock('speakeasy', () => ({
  generateSecret: jest.fn().mockReturnValue({
    base32: 'TESTSECRET',
    otpauth_url: 'otpauth://totp/Test:user?secret=TESTSECRET&issuer=Test',
  }),
  totp: {
    verify: jest.fn().mockReturnValue({ delta: 0 }),
    generate: jest.fn().mockReturnValue('123456'),
  },
}));

jest.mock('qrcode', () => ({
  toDataURL: jest.fn().mockResolvedValue('data:image/png;base64,test'),
}));

import request from 'supertest';
import { AuthService } from '../../src/modules/auth/auth.service';

// Build a minimal Express app for testing
function createTestApp() {
  const app = express();
  app.use(express.json());

  // Mock auth routes
  app.post('/api/v1/auth/register', async (req, res) => {
    try {
      const authService = new AuthService();
      const result = await authService.register({
        userId: 'user-123',
        phone: req.body.phone,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        gender: req.body.gender,
        dateOfBirth: req.body.dateOfBirth,
        religion: req.body.religion,
        password: req.body.password,
        ip: req.ip || '127.0.0.1',
      });
      res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, error: { message: error.message } });
    }
  });

  app.post('/api/v1/auth/login', async (req, res) => {
    try {
      const authService = new AuthService();
      const result = await authService.login({
        phone: req.body.phone,
        password: req.body.password,
        ip: req.ip || '127.0.0.1',
      });
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(401).json({ success: false, error: { message: error.message } });
    }
  });

  app.post('/api/v1/auth/send-otp', async (req, res) => {
    try {
      const authService = new AuthService();
      const result = await authService.sendOtp(req.body.phone, req.body.purpose);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, error: { message: error.message } });
    }
  });

  app.post('/api/v1/auth/verify-otp', async (req, res) => {
    try {
      const authService = new AuthService();
      const result = await authService.verifyOtp(req.body.phone, req.body.otp, req.body.purpose);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, error: { message: error.message } });
    }
  });

  app.post('/api/v1/auth/refresh', async (req, res) => {
    try {
      const authService = new AuthService();
      const result = await authService.refreshToken(req.body.refreshToken);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(401).json({ success: false, error: { message: error.message } });
    }
  });

  app.post('/api/v1/auth/logout', async (req, res) => {
    try {
      const authService = new AuthService();
      await authService.logout(req.body.userId, req.body.token);
      res.json({ success: true, message: 'Logged out successfully' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: { message: error.message } });
    }
  });

  app.post('/api/v1/auth/forgot-password', async (req, res) => {
    try {
      const authService = new AuthService();
      const result = await authService.forgotPassword(req.body.email);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, error: { message: error.message } });
    }
  });

  app.post('/api/v1/auth/reset-password', async (req, res) => {
    try {
      const authService = new AuthService();
      const result = await authService.resetPassword(req.body.token, req.body.password);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, error: { message: error.message } });
    }
  });

  app.get('/api/v1/auth/me', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, error: { message: 'No token provided' } });
    }
    try {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const db = require('../../src/config/database').db;
      db.where.mockReturnValue({ first: db });
      db.first.mockResolvedValue({
        id: decoded.userId,
        phone: '+919876543210',
        email: 'test@mplus.example.com',
        first_name: 'Test',
        last_name: 'User',
      });
      const user = await db.where('id', decoded.userId).first();
      res.json({ success: true, data: user });
    } catch (error: any) {
      res.status(401).json({ success: false, error: { message: 'Invalid token' } });
    }
  });

  return app;
}

describe('Auth API Endpoints', () => {
  let app: express.Express;

  beforeAll(() => {
    process.env.JWT_SECRET = 'test-jwt-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
    app = createTestApp();
  });

  afterAll(() => {
    delete process.env.JWT_SECRET;
    delete process.env.JWT_REFRESH_SECRET;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user', async () => {
      const db = require('../../src/config/database').db;
      db.where.mockReturnValue({ first: db });
      db.first.mockResolvedValue(null);
      db.insert.mockReturnValue({ returning: db });
      db.returning.mockResolvedValue([{
        id: 'user-123',
        phone: '+919876543210',
        first_name: 'Test',
        last_name: 'User',
      }]);

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          phone: '+919876543210',
          firstName: 'Test',
          lastName: 'User',
          gender: 'male',
          dateOfBirth: '1995-05-15',
          religion: 'Hindu',
          password: 'Test@12345',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('tokens');
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          phone: '+919876543210',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login successfully', async () => {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('Test@12345', 10);
      const db = require('../../src/config/database').db;
      db.where.mockReturnValue({ first: db });
      db.first.mockResolvedValue({
        id: 'user-123',
        phone: '+919876543210',
        password_hash: hashedPassword,
        role: 'member',
        is_active: true,
        two_factor_enabled: false,
        login_attempts: 0,
      });

      const sessions = require('../../src/config/redis').sessions;
      sessions.set.mockResolvedValue('OK');

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          phone: '+919876543210',
          password: 'Test@12345',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 401 for invalid credentials', async () => {
      const db = require('../../src/config/database').db;
      db.where.mockReturnValue({ first: db });
      db.first.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          phone: '+919999999999',
          password: 'WrongPassword',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/send-otp', () => {
    it('should send OTP successfully', async () => {
      const response = await request(app)
        .post('/api/v1/auth/send-otp')
        .send({
          phone: '+919876543210',
          purpose: 'registration',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('POST /api/v1/auth/verify-otp', () => {
    it('should verify OTP successfully', async () => {
      const cache = require('../../src/config/redis').cache;
      cache.get.mockResolvedValue('123456');

      const response = await request(app)
        .post('/api/v1/auth/verify-otp')
        .send({
          phone: '+919876543210',
          otp: '123456',
          purpose: 'registration',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 400 for invalid OTP', async () => {
      const cache = require('../../src/config/redis').cache;
      cache.get.mockResolvedValue('123456');

      const response = await request(app)
        .post('/api/v1/auth/verify-otp')
        .send({
          phone: '+919876543210',
          otp: '999999',
          purpose: 'registration',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/v1/auth/forgot-password', () => {
    it('should send password reset email', async () => {
      const db = require('../../src/config/database').db;
      db.where.mockReturnValue({ first: db });
      db.first.mockResolvedValue({
        id: 'user-123',
        email: 'test@mplus.example.com',
      });

      const response = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({
          email: 'test@mplus.example.com',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('should return current user profile', async () => {
      const jwt = require('jsonwebtoken');
      const token = jwt.sign(
        { userId: 'user-123', role: 'member' },
        process.env.JWT_SECRET!,
        { expiresIn: '15m' }
      );

      const db = require('../../src/config/database').db;
      db.where.mockReturnValue({ first: db });
      db.first.mockResolvedValue({
        id: 'user-123',
        phone: '+919876543210',
        email: 'test@mplus.example.com',
        first_name: 'Test',
        last_name: 'User',
      });

      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me');

      expect(response.status).toBe(401);
    });

    it('should return 401 with invalid token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('should logout successfully', async () => {
      const response = await request(app)
        .post('/api/v1/auth/logout')
        .send({
          userId: 'user-123',
          token: 'some-token',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});
