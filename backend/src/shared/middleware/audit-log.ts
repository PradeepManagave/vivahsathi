// ============================================================
// Audit Log Middleware
// ============================================================

import { Request, Response, NextFunction } from 'express';
import { db } from '../../config/database';
import logger from '../../config/logger';

interface AuditLogData {
  userId?: string;
  action: string;
  resourceType?: string;
  resourceId?: string;
  resourceName?: string;
  description?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

// Log levels for different severity
const LOG_LEVELS = {
  INFO: 'info',
  WARNING: 'warn',
  ERROR: 'error',
  CRITICAL: 'error'
};

const SENSITIVE_ACTIONS = [
  'LOGIN',
  'LOGOUT',
  'REGISTER',
  'PASSWORD_CHANGE',
  'PASSWORD_RESET',
  '2FA_ENABLE',
  '2FA_DISABLE',
  'MEMBERSHIP_UPGRADE',
  'MEMBERSHIP_CANCEL',
  'PROFILE_UPDATE',
  'PROFILE_DELETE',
  'MEMBER_BAN',
  'MEMBER_UNBAN',
  'ADMIN_LOGIN',
  'PERMISSION_CHANGE'
];

const SENSITIVE_FIELDS = [
  'password',
  'password_hash',
  'two_factor_secret',
  'two_factor_recovery_codes',
  'verification_token',
  'api_key',
  'secret'
];

/**
 * Audit Log Middleware
 * Logs all administrative actions to database
 */
export function auditLog(action: string, options?: {
  resourceType?: string;
  getResourceId?: (req: Request) => string | undefined;
  getDescription?: (req: Request, res: Response) => string;
  getNewValues?: (req: Request, res: Response) => Record<string, unknown>;
  getOldValues?: (req: Request) => Record<string, unknown>;
  isSensitive?: boolean;
}) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();

    // Capture original response end
    const originalEnd = res.end;
    res.end = function (chunk?: unknown, encoding?: unknown, callback?: unknown) {
      const duration = Date.now() - startTime;
      const isSensitive = options?.isSensitive || SENSITIVE_ACTIONS.includes(action);

      // Only log successful operations (2xx status codes)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const auditData: AuditLogData = {
          userId: req.user?.id,
          action,
          resourceType: options?.resourceType,
          resourceId: options?.getResourceId?.(req),
          description: options?.getDescription?.(req, res),
          newValues: options?.getNewValues?.(req, res),
          oldValues: options?.getOldValues?.(req)
        };

        // Async logging (don't block response)
        logAuditEvent(auditData, {
          method: req.method,
          path: req.path,
          ip: req.ip || 'unknown',
          userAgent: req.get('user-agent'),
          duration,
          statusCode: res.statusCode
        }, isSensitive);
      }

      // Call original end
      return originalEnd.call(this, chunk, encoding, callback);
    };

    next();
  };
}

/**
 * Log audit event to database and logger
 */
async function logAuditEvent(
  data: AuditLogData,
  context: {
    method: string;
    path: string;
    ip: string;
    userAgent?: string;
    duration: number;
    statusCode: number;
  },
  isSensitive: boolean
) {
  try {
    // Sanitize sensitive data
    const sanitizedData = sanitizeData(data as unknown as Record<string, unknown>);

    // Log to database
    await db('activity_logs').insert({
      id: require('uuid').v4(),
      user_id: data.userId || null,
      actor_type: data.userId ? 'user' : 'system',
      action: data.action,
      resource_type: data.resourceType || null,
      resource_id: data.resourceId || null,
      resource_name: data.resourceName || null,
      description: data.description || null,
      old_values: data.oldValues ? JSON.stringify(data.oldValues) : null,
      new_values: data.newValues ? JSON.stringify(sanitizeData(data.newValues)) : null,
      ip_address: context.ip || null,
      user_agent: context.userAgent || null,
      metadata: JSON.stringify({
        method: context.method,
        path: context.path,
        duration: context.duration,
        statusCode: context.statusCode
      }),
      created_at: new Date()
    });

    // Log to application logger
    const logLevel = isSensitive ? LOG_LEVELS.WARNING : LOG_LEVELS.INFO;
    logger[logLevel]('Audit event', {
      action: data.action,
      userId: data.userId,
      resourceType: data.resourceType,
      resourceId: data.resourceId,
      path: context.path,
      ip: context.ip,
      statusCode: context.statusCode
    });
  } catch (error) {
    // Don't fail the request if audit logging fails
    logger.error('Failed to write audit log', { error, data, context });
  }
}

/**
 * Remove sensitive fields from data
 */
function sanitizeData(data: Record<string, unknown>): Record<string, unknown> {
  const sanitized = { ...data };

  for (const key of Object.keys(sanitized)) {
    if (SENSITIVE_FIELDS.some((field) => key.toLowerCase().includes(field.toLowerCase()))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeData(sanitized[key] as Record<string, unknown>);
    }
  }

  return sanitized;
}

/**
 * Pre-configured audit loggers for common actions
 */
export const auditLogs = {
  // Auth actions
  login: auditLog('LOGIN', { resourceType: 'session', isSensitive: true }),
  logout: auditLog('LOGOUT', { resourceType: 'session', isSensitive: true }),
  register: auditLog('REGISTER', { resourceType: 'user', isSensitive: true }),
  passwordChange: auditLog('PASSWORD_CHANGE', { resourceType: 'user', isSensitive: true }),
  passwordReset: auditLog('PASSWORD_RESET', { resourceType: 'user', isSensitive: true }),

  // 2FA actions
  twoFaSetup: auditLog('2FA_SETUP', { resourceType: 'user', isSensitive: true }),
  twoFaEnable: auditLog('2FA_ENABLE', { resourceType: 'user', isSensitive: true }),
  twoFaDisable: auditLog('2FA_DISABLE', { resourceType: 'user', isSensitive: true }),

  // Profile actions
  profileUpdate: auditLog('PROFILE_UPDATE', { resourceType: 'profile' }),
  profileDelete: auditLog('PROFILE_DELETE', { resourceType: 'profile', isSensitive: true }),

  // Membership actions
  membershipUpgrade: auditLog('MEMBERSHIP_UPGRADE', { resourceType: 'membership', isSensitive: true }),
  membershipCancel: auditLog('MEMBERSHIP_CANCEL', { resourceType: 'membership' }),
  paymentReceived: auditLog('PAYMENT_RECEIVED', { resourceType: 'payment', isSensitive: true }),

  // Admin actions
  memberBan: auditLog('MEMBER_BAN', { resourceType: 'user', isSensitive: true }),
  memberUnban: auditLog('MEMBER_UNBAN', { resourceType: 'user' }),
  adminLogin: auditLog('ADMIN_LOGIN', { resourceType: 'session', isSensitive: true }),
  franchiseCreate: auditLog('FRANCHISE_CREATE', { resourceType: 'franchise' }),
  franchiseUpdate: auditLog('FRANCHISE_UPDATE', { resourceType: 'franchise' })
};

/**
 * Query audit logs
 */
export async function queryAuditLogs(filters: {
  userId?: string;
  action?: string;
  resourceType?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  pageSize?: number;
}) {
  let query = db('activity_logs').select('*');

  if (filters.userId) {
    query = query.where('user_id', filters.userId);
  }

  if (filters.action) {
    query = query.where('action', filters.action);
  }

  if (filters.resourceType) {
    query = query.where('resource_type', filters.resourceType);
  }

  if (filters.startDate) {
    query = query.where('created_at', '>=', filters.startDate);
  }

  if (filters.endDate) {
    query = query.where('created_at', '<=', filters.endDate);
  }

  const page = filters.page || 1;
  const pageSize = filters.pageSize || 50;
  const offset = (page - 1) * pageSize;

  const [{ count }] = await query.clone().count('id as count');
  const logs = await query
    .orderBy('created_at', 'desc')
    .limit(pageSize)
    .offset(offset);

  return {
    logs,
    total: Number(count),
    page,
    pageSize,
    totalPages: Math.ceil(Number(count) / pageSize)
  };
}
