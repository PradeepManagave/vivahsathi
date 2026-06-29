// ============================================================
// Logger Configuration - Winston
// ============================================================

import winston from 'winston';
import path from 'path';
import { config } from './index';

// Custom format for console
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ level, message, timestamp, stack, ...meta }) => {
    let log = `${timestamp} [${level.toUpperCase()}] ${message}`;
    
    // Add metadata if present
    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta)}`;
    }
    
    // Add stack trace for errors
    if (stack) {
      log += `\n${stack}`;
    }
    
    return log;
  })
);

// Custom format for file (JSON)
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
};

// Colors for console
const colors = {
  error: '\x1b[31m', // Red
  warn: '\x1b[33m',  // Yellow
  info: '\x1b[36m',  // Cyan
  http: '\x1b[35m',  // Magenta
  debug: '\x1b[90m', // Gray
  reset: '\x1b[0m'
};

// Add colors to winston
winston.addColors(colors);

// Create transports array
const transports: winston.transport[] = [];

// Console transport (always enabled in non-test)
if (config.LOG_CONSOLE_ENABLED !== false && config.NODE_ENV !== 'test') {
  transports.push(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize({ all: true }),
        consoleFormat
      )
    })
  );
}

// File transports for production
if (config.LOG_FILE_ENABLED && config.NODE_ENV !== 'test') {
  const logPath = config.LOG_FILE_PATH || './logs';
  
  // Error log
  transports.push(
    new winston.transports.File({
      filename: path.join(logPath, 'error.log'),
      level: 'error',
      format: fileFormat,
      maxsize: config.LOG_FILE_MAX_SIZE || 100 * 1024 * 1024, // 100MB
      maxFiles: config.LOG_FILE_MAX_FILES || 14,
      tailable: true
    })
  );
  
  // Combined log
  transports.push(
    new winston.transports.File({
      filename: path.join(logPath, 'combined.log'),
      format: fileFormat,
      maxsize: config.LOG_FILE_MAX_SIZE || 100 * 1024 * 1024,
      maxFiles: config.LOG_FILE_MAX_FILES || 14,
      tailable: true
    })
  );
  
  // HTTP log
  transports.push(
    new winston.transports.File({
      filename: path.join(logPath, 'http.log'),
      level: 'http',
      format: fileFormat,
      maxsize: 50 * 1024 * 1024,
      maxFiles: 7,
      tailable: true
    })
  );
}

// Create logger instance
const logger = winston.createLogger({
  level: config.LOG_LEVEL || 'info',
  levels,
  defaultMeta: {
    service: 'mplus-api',
    env: config.NODE_ENV
  },
  transports
});

// Create stream for Morgan HTTP logging
export const httpLogStream = {
  write: (message: string) => {
    logger.http(message.trim());
  }
};

// Helper methods for structured logging
export const log = {
  // User actions
  user: {
    login: (userId: string, ip: string) => 
      logger.info('User logged in', { userId, ip, action: 'USER_LOGIN' }),
    logout: (userId: string) => 
      logger.info('User logged out', { userId, action: 'USER_LOGOUT' }),
    register: (userId: string, role: string) => 
      logger.info('User registered', { userId, role, action: 'USER_REGISTER' }),
    failedLogin: (email: string, ip: string, reason: string) => 
      logger.warn('Login failed', { email, ip, reason, action: 'LOGIN_FAILED' })
  },
  
  // Profile actions
  profile: {
    created: (userId: string, profileId: string) => 
      logger.info('Profile created', { userId, profileId, action: 'PROFILE_CREATED' }),
    updated: (userId: string, profileId: string, changes: string[]) => 
      logger.info('Profile updated', { userId, profileId, changes, action: 'PROFILE_UPDATED' }),
    viewed: (viewerId: string, profileId: string) => 
      logger.info('Profile viewed', { viewerId, profileId, action: 'PROFILE_VIEWED' })
  },
  
  // Membership actions
  membership: {
    upgraded: (userId: string, fromPlan: string, toPlan: string) => 
      logger.info('Membership upgraded', { userId, fromPlan, toPlan, action: 'MEMBERSHIP_UPGRADED' }),
    expired: (userId: string, plan: string) => 
      logger.info('Membership expired', { userId, plan, action: 'MEMBERSHIP_EXPIRED' }),
    activated: (userId: string, plan: string) =>
      logger.info('Membership activated', { userId, plan, action: 'MEMBERSHIP_ACTIVATED' }),
    cancelled: (userId: string, reason?: string) =>
      logger.info('Membership cancelled', { userId, reason, action: 'MEMBERSHIP_CANCELLED' }),
    contactViewed: (userId: string, count: number) =>
      logger.info('Contact viewed', { userId, count, action: 'CONTACT_VIEWED' }),
    accessDenied: (userId: string, feature: string, reason: string) =>
      logger.warn('Membership access denied', { userId, feature, reason, action: 'ACCESS_DENIED' })
  },
  
  // Payment actions
  payment: {
    completed: (userId: string, paymentId: string, amount: number) =>
      logger.info('Payment completed', { userId, paymentId, amount, action: 'PAYMENT_COMPLETED' }),
    failed: (paymentId: string, reason: string) =>
      logger.warn('Payment failed', { paymentId, reason, action: 'PAYMENT_FAILED' }),
    refunded: (adminId: string, paymentId: string, amount?: number) =>
      logger.info('Payment refunded', { adminId, paymentId, amount, action: 'PAYMENT_REFUNDED' }),
    offline: (staffId: string, userId: string, amount: number, mode: string) =>
      logger.info('Offline payment recorded', { staffId, userId, amount, mode, action: 'OFFLINE_PAYMENT' }),
    exported: (adminId: string, type: string, count: number) =>
      logger.info('Payment data exported', { adminId, type, count, action: 'PAYMENT_EXPORTED' })
  },
  
  // Admin actions
  admin: {
    memberBanned: (adminId: string, targetUserId: string, reason: string) => 
      logger.warn('Member banned', { adminId, targetUserId, reason, action: 'MEMBER_BANNED' }),
    memberApproved: (adminId: string, targetUserId: string) => 
      logger.info('Member approved', { adminId, targetUserId, action: 'MEMBER_APPROVED' }),
    franchiseCreated: (adminId: string, franchiseId: string) => 
      logger.info('Franchise created', { adminId, franchiseId, action: 'FRANCHISE_CREATED' }),
    dataExported: (adminId: string, type: string, count: number) =>
      logger.info('Data exported', { adminId, type, count, action: 'DATA_EXPORTED' })
  },
  
  // Security events
  security: {
    rateLimitExceeded: (ip: string, endpoint: string) => 
      logger.warn('Rate limit exceeded', { ip, endpoint, action: 'RATE_LIMIT_EXCEEDED' }),
    invalidToken: (ip: string, tokenType: string) => 
      logger.warn('Invalid token', { ip, tokenType, action: 'INVALID_TOKEN' }),
    xssAttempt: (ip: string, payload: string) => 
      logger.warn('XSS attempt detected', { ip, payload: payload.substring(0, 100), action: 'XSS_ATTEMPT' }),
    sqlInjectionAttempt: (ip: string, payload: string) => 
      logger.warn('SQL injection attempt', { ip, payload: payload.substring(0, 100), action: 'SQL_INJECTION' }),
    invalidWebhookSignature: () =>
      logger.warn('Invalid webhook signature received', { action: 'INVALID_WEBHOOK_SIGNATURE' }),
    sensitiveDataRemoved: (type: string) =>
      logger.info('Sensitive data removed', { type, action: 'SENSITIVE_DATA_REMOVED' }),
    imageValidationFailed: (error: string) =>
      logger.warn('Image validation failed', { error, action: 'IMAGE_VALIDATION_FAILED' }),
    captchaFailed: (errors: string[]) =>
      logger.warn('CAPTCHA verification failed', { errors, action: 'CAPTCHA_FAILED' }),
    captchaLowScore: (score: number, captchaAction?: string) =>
      logger.warn('CAPTCHA score too low', { score, captchaAction, action: 'CAPTCHA_LOW_SCORE' }),
    captchaActionMismatch: (received: string, expected: string) =>
      logger.warn('CAPTCHA action mismatch', { received, expected, action: 'CAPTCHA_ACTION_MISMATCH' }),
    adminAccessWithout2fa: (userId: string) =>
      logger.warn('Admin access without 2FA', { userId, action: 'ADMIN_NO_2FA' })
  },
  
  // System events
  system: {
    started: (port: number) => 
      logger.info(`Server started on port ${port}`, { action: 'SERVER_STARTED' }),
    shutdown: (reason: string) => 
      logger.info('Server shutting down', { reason, action: 'SERVER_SHUTDOWN' }),
    error: (error: Error, context?: Record<string, unknown>) => 
      logger.error('System error', { error: error.message, stack: error.stack, ...context, action: 'SYSTEM_ERROR' })
  }
};

export default logger;
