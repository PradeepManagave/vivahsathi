// ============================================================
// Auth Routes - Express Router
// ============================================================

import { Router } from 'express';
import { body } from 'express-validator';
import rateLimit from 'express-rate-limit';
import { validate } from '../../shared/middleware/validate';
import { authenticate } from '../../shared/middleware/auth';
import { requireRole } from '../../shared/middleware/role-guard';
import { asyncHandler } from '../../shared/middleware/error-handler';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

const router = Router();

const authService = new AuthService();
const authController = new AuthController(authService);

const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many login attempts. Please try again after 15 minutes.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.ip || 'unknown';
  },
  skip: (_req) => {
    return false;
  }
});

const otpRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many OTP requests. Please try again after an hour.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false
});

const passwordResetRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many password reset attempts. Please try again after an hour.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false
});

// ============================================================
// Validation Rules
// ============================================================

const sendOtpValidation = [
  body('phone')
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Invalid Indian mobile number')
    .trim(),
  body('countryCode')
    .optional()
    .default('+91')
    .isString()
    .withMessage('Country code must be a string')
];

const verifyOtpValidation = [
  body('phone')
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Invalid Indian mobile number')
    .trim(),
  body('otp')
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('OTP must be 6 digits')
];

const registerValidation = [
  body('phone')
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Invalid Indian mobile number'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email address'),
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be 2-50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('First name can only contain letters'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be 2-50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Last name can only contain letters'),
  body('gender')
    .isIn(['male', 'female', 'other'])
    .withMessage('Invalid gender'),
  body('dateOfBirth')
    .isISO8601()
    .withMessage('Invalid date of birth')
    .custom((value) => {
      const dob = new Date(value);
      const today = new Date();
      const age = Math.floor((today.getTime() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      if (age < 18) throw new Error('Must be at least 18 years old');
      if (age > 100) throw new Error('Invalid date of birth');
      return true;
    }),
  body('religion')
    .trim()
    .notEmpty()
    .withMessage('Religion is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain uppercase, lowercase, number and special character'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
  body('acceptTerms')
    .isBoolean()
    .withMessage('You must accept terms and conditions')
    .equals('true')
    .withMessage('You must accept terms and conditions')
];

const loginValidation = [
  body('identifier')
    .custom((value) => {
      // Allow email or mobile
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const mobileRegex = /^[6-9]\d{9}$/;
      if (!emailRegex.test(value) && !mobileRegex.test(value)) {
        throw new Error('Enter valid email or mobile number');
      }
      return true;
    }),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  body('fcmToken')
    .optional()
    .isString()
    .withMessage('FCM token must be a string')
];

const forgotPasswordValidation = [
  body('identifier')
    .custom((value) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const mobileRegex = /^[6-9]\d{9}$/;
      if (!emailRegex.test(value) && !mobileRegex.test(value)) {
        throw new Error('Enter valid email or mobile number');
      }
      return true;
    })
];

const resetPasswordValidation = [
  body('token')
    .notEmpty()
    .withMessage('Token is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain uppercase, lowercase, number and special character'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    })
];

const verifyResetTokenValidation = [
  body('token')
    .notEmpty()
    .withMessage('Token is required')
];

const setup2faValidation = [
  body('method')
    .optional()
    .isIn(['totp', 'authenticator'])
    .withMessage('Invalid 2FA method')
];

const verify2faValidation = [
  body('code')
    .isString()
    .isLength({ min: 6, max: 6 })
    .withMessage('Invalid 2FA code')
];

const refreshTokenValidation = [
  body('refreshToken')
    .notEmpty()
    .withMessage('Refresh token is required')
];

// ============================================================
// Routes
// ============================================================

/**
 * POST /api/auth/send-otp
 * Send OTP to mobile number
 * Public endpoint with rate limiting (5 per hour per mobile)
 */
router.post(
  '/send-otp',
  otpRateLimiter,
  validate(sendOtpValidation),
  asyncHandler(authController.sendOtp)
);

router.post(
  '/verify-otp',
  validate(verifyOtpValidation),
  asyncHandler(authController.verifyOtp)
);

router.post(
  '/register',
  authenticate,
  validate(registerValidation),
  asyncHandler(authController.register)
);

router.post(
  '/login',
  loginRateLimiter,
  validate(loginValidation),
  asyncHandler(authController.login)
);

router.post(
  '/logout',
  authenticate,
  asyncHandler(authController.logout)
);

router.post(
  '/refresh',
  validate(refreshTokenValidation),
  asyncHandler(authController.refreshToken)
);

router.post(
  '/forgot-password',
  passwordResetRateLimiter,
  validate(forgotPasswordValidation),
  asyncHandler(authController.forgotPassword)
);

router.post(
  '/verify-reset-token',
  validate(verifyResetTokenValidation),
  asyncHandler(authController.verifyResetToken)
);

router.post(
  '/reset-password',
  validate(resetPasswordValidation),
  asyncHandler(authController.resetPassword)
);

router.get(
  '/me',
  authenticate,
  asyncHandler(authController.getCurrentUser)
);

router.get(
  '/session',
  authenticate,
  asyncHandler(authController.getSession)
);

// ============================================================
// 2FA Routes (Admin Only)
// ============================================================

/**
 * POST /api/auth/2fa/setup
 * Setup 2FA for admin accounts (mandatory for super_admin and franchise_admin)
 * Requires TOTP authenticator app
 */
router.post(
  '/2fa/setup',
  authenticate,
  requireRole('super_admin', 'franchise_admin'),
  validate(setup2faValidation),
  asyncHandler(authController.setup2fa)
);

router.post(
  '/2fa/enable',
  authenticate,
  requireRole('super_admin', 'franchise_admin'),
  validate(verify2faValidation),
  asyncHandler(authController.enable2fa)
);

router.post(
  '/2fa/disable',
  authenticate,
  requireRole('super_admin', 'franchise_admin'),
  validate(verify2faValidation),
  asyncHandler(authController.disable2fa)
);

router.post(
  '/2fa/verify',
  [
    body('identifier')
      .custom((value) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const mobileRegex = /^[6-9]\d{9}$/;
        if (!emailRegex.test(value) && !mobileRegex.test(value)) {
          throw new Error('Enter valid email or mobile number');
        }
        return true;
      }),
    body('password')
      .notEmpty()
      .withMessage('Password is required'),
    body('code')
      .isString()
      .isLength({ min: 6, max: 6 })
      .withMessage('Invalid 2FA code')
  ],
  validate([]),
  asyncHandler(authController.verify2fa)
);

router.post(
  '/2fa/backup-codes',
  authenticate,
  requireRole('super_admin', 'franchise_admin'),
  asyncHandler(authController.generateBackupCodes)
);

// ============================================================
// Social Login Routes
// ============================================================

const socialLoginValidation = [
  body('accessToken')
    .notEmpty()
    .withMessage('Access token is required'),
];

router.post(
  '/social/google',
  loginRateLimiter,
  validate(socialLoginValidation),
  asyncHandler(authController.socialLoginGoogle)
);

router.post(
  '/social/facebook',
  loginRateLimiter,
  validate(socialLoginValidation),
  asyncHandler(authController.socialLoginFacebook)
);

export { router as authRouter };
