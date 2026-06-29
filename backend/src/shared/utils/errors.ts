// ============================================================
// Custom Error Classes
// ============================================================

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;
  public readonly details?: Record<string, unknown>;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    details?: Record<string, unknown>
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Authentication Errors
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized', details?: Record<string, unknown>) {
    super(message, 401, 'UNAUTHORIZED', details);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden', details?: Record<string, unknown>) {
    super(message, 403, 'FORBIDDEN', details);
  }
}

export class TokenExpiredError extends AppError {
  constructor(message: string = 'Token expired') {
    super(message, 401, 'TOKEN_EXPIRED');
  }
}

export class InvalidTokenError extends AppError {
  constructor(message: string = 'Invalid token') {
    super(message, 401, 'INVALID_TOKEN');
  }
}

// Validation Errors
export class ValidationError extends AppError {
  public readonly errors: FieldError[];

  constructor(message: string = 'Validation failed', errors: FieldError[] = []) {
    super(message, 400, 'VALIDATION_ERROR', { errors });
    this.errors = errors;
  }
}

export interface FieldError {
  field: string;
  message: string;
  code?: string;
}

// Resource Errors
export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource', identifier?: string) {
    const message = identifier
      ? `${resource} with identifier '${identifier}' not found`
      : `${resource} not found`;
    super(message, 404, 'NOT_FOUND');
  }
}

export class DuplicateError extends AppError {
  constructor(resource: string, field: string, value: string) {
    super(
      `${resource} with ${field} '${value}' already exists`,
      409,
      'DUPLICATE_RESOURCE'
    );
  }
}

// Membership Errors
export class MembershipExpiredError extends AppError {
  constructor() {
    super('Your membership has expired. Please renew to continue.', 403, 'MEMBERSHIP_EXPIRED');
  }
}

export class MembershipLimitError extends AppError {
  constructor(limit: string) {
    super(`You have reached your ${limit} limit. Upgrade for more.`, 403, 'MEMBERSHIP_LIMIT_EXCEEDED');
  }
}

export class UpgradeRequiredError extends AppError {
  constructor(requiredPlan: string) {
    super(`This feature requires ${requiredPlan} membership.`, 403, 'UPGRADE_REQUIRED');
  }
}

// Permission Errors
export class PermissionDeniedError extends AppError {
  constructor(action: string) {
    super(`You do not have permission to ${action}.`, 403, 'PERMISSION_DENIED');
  }
}

// Rate Limit Errors
export class RateLimitError extends AppError {
  constructor(retryAfter?: number) {
    super(
      'Too many requests. Please try again later.',
      429,
      'RATE_LIMIT_EXCEEDED',
      { retryAfter }
    );
  }
}

// Profile Errors
export class ProfileIncompleteError extends AppError {
  constructor(missingFields: string[]) {
    super(
      'Your profile is incomplete. Please fill in the required fields.',
      400,
      'PROFILE_INCOMPLETE',
      { missingFields }
    );
  }
}

export class PhotoLimitError extends AppError {
  constructor(limit: number) {
    super(
      `You can only upload up to ${limit} photos.`,
      400,
      'PHOTO_LIMIT_EXCEEDED'
    );
  }
}

// KYC Errors
export class KYCNotVerifiedError extends AppError {
  constructor() {
    super('Please complete your Video KYC to access this feature.', 403, 'KYC_NOT_VERIFIED');
  }
}

export class KYCInProgressError extends AppError {
  constructor() {
    super('Your KYC verification is already in progress.', 400, 'KYC_IN_PROGRESS');
  }
}

// Interest Errors
export class InterestAlreadySentError extends AppError {
  constructor() {
    super('You have already sent an interest to this profile.', 400, 'INTEREST_ALREADY_SENT');
  }
}

export class SelfInterestError extends AppError {
  constructor() {
    super('You cannot send an interest to yourself.', 400, 'SELF_INTEREST');
  }
}

// Maintenance Error
export class MaintenanceError extends AppError {
  constructor(message?: string) {
    super(
      message || 'System under maintenance. Please try again later.',
      503,
      'MAINTENANCE_MODE'
    );
  }
}
