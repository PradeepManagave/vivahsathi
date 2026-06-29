// ============================================================
// Input Validation Middleware
// ============================================================

import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain, body, param, query } from 'express-validator';
import { ValidationError } from '../utils/errors';

/**
 * Validate request with express-validator chains
 */
export function validate(validations: ValidationChain[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);

    if (errors.isEmpty()) {
      next();
      return;
    }

    const fieldErrors = errors.array().map((err) => ({
      field: 'path' in err ? err.path : 'unknown',
      message: err.msg,
      type: err.type
    }));

    next(new ValidationError('Validation failed', fieldErrors));
  };
}

/**
 * Validate ID parameter
 */
export function validateIdParam(paramName: string = 'id') {
  return param(paramName)
    .isUUID(4)
    .withMessage(`Invalid ${paramName}`);
}

/**
 * Validate pagination parameters
 */
export function validatePagination() {
  return [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer')
      .toInt(),
    query('pageSize')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Page size must be between 1 and 100')
      .toInt()
  ];
}

/**
 * Common validation chains
 */
export const commonValidations = {
  // Phone number (Indian mobile)
  phone: body('phone')
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Invalid Indian mobile number')
    .trim(),

  // Email
  email: body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email address'),

  // Password
  password: body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])/)
    .withMessage('Password must contain uppercase, lowercase, number and special character'),

  // Name
  firstName: body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be 2-50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('First name can only contain letters'),

  lastName: body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be 2-50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Last name can only contain letters'),

  // Gender
  gender: body('gender')
    .isIn(['male', 'female', 'other'])
    .withMessage('Invalid gender'),

  // Date of birth
  dateOfBirth: body('dateOfBirth')
    .isISO8601()
    .withMessage('Invalid date format')
    .custom((value) => {
      const dob = new Date(value);
      const today = new Date();
      const age = Math.floor((today.getTime() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      if (age < 18) throw new Error('Must be at least 18 years old');
      if (age > 100) throw new Error('Invalid date of birth');
      return true;
    }),

  // OTP
  otp: body('otp')
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('OTP must be 6 digits'),

  // UUID
  uuid: (field: string) =>
    body(field)
      .isUUID(4)
      .withMessage(`Invalid ${field}`),

  // Slug
  slug: body('slug')
    .optional()
    .trim()
    .isLength({ min: 1, max: 150 })
    .withMessage('Slug must be 1-150 characters')
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage('Slug can only contain lowercase letters, numbers, and hyphens'),

  // Search query
  searchQuery: query('q')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be 1-100 characters'),

  // Sort field
  sortBy: query('sortBy')
    .optional()
    .trim()
    .isIn(['created_at', 'updated_at', 'name', 'id'])
    .withMessage('Invalid sort field'),

  // Sort order
  sortOrder: query('sortOrder')
    .optional()
    .trim()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc')
};

/**
 * Sanitize input - remove HTML tags and trim
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>]/g, '') // Remove angle brackets
    .substring(0, 10000); // Limit length
}

/**
 * Check for SQL injection patterns
 */
export function detectSqlInjection(input: string): boolean {
  const patterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|INTO|FROM|WHERE)\b)/i,
    /(--|;|\/\*|\*\/|@@|char\(|nchar\(|varchar\(|nvarchar\(|alter|begin|cast|create|cursor|declare|delete|drop|end|exec|execute|fetch|insert|kill|select|sys|sysobjects|syscolumns|table|update)/i,
    /(\bor\b|\band\b|\bnot\b|\bis\b|\bnull\b)/i
  ];

  return patterns.some((pattern) => pattern.test(input));
}

/**
 * Rate limit validation for sensitive operations
 */
export function rateLimitKeyGenerator(req: Request): string {
  const ip = req.ip || 'unknown';
  const path = req.path;
  return `${ip}:${path}`;
}
