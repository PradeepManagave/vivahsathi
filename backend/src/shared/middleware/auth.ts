// ============================================================
// Auth Middleware - Complete with 2FA Support
// ============================================================

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../../config/index';
import logger, { log } from '../../config/logger';
import { UnauthorizedError, ForbiddenError, AppError } from '../utils/errors';
import { UserRole } from '../../types/index';
import { ADMIN_ROLES } from '../constants/roles';

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      userId?: string;
      sessionId?: string;
    }
  }
}

interface AuthUser {
  id: string;
  email?: string;
  phone?: string;
  role: UserRole;
  status: string;
  twoFactorEnabled?: boolean;
}

interface TokenPayload {
  id: string;
  email?: string;
  phone?: string;
  role: UserRole;
  status: string;
  iat?: number;
  exp?: number;
}

interface TempTokenPayload {
  userId: string;
  sessionId?: string;
  purpose: string;
  iat?: number;
  exp?: number;
}

// ============================================================
// Authentication Middleware
// ============================================================

/**
 * Authenticate user using JWT
 */
export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedError('No authorization token provided');
    }

    if (!authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Invalid authorization format. Use Bearer token');
    }

    const token = authHeader.substring(7);

    if (!token) {
      throw new UnauthorizedError('No token provided');
    }

    // Verify token
    const decoded = jwt.verify(token, config.JWT_SECRET, {
      algorithms: ['HS256']
    }) as TokenPayload;

    // Attach user to request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      phone: decoded.phone,
      role: decoded.role,
      status: decoded.status
    };
    req.userId = decoded.id;

    // Check if user is banned
    if (decoded.status === 'banned') {
      throw new ForbiddenError('Your account has been banned');
    }

    // Check if user is inactive
    if (decoded.status === 'inactive') {
      throw new ForbiddenError('Your account is inactive');
    }

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      next(new UnauthorizedError('Token has expired'));
      return;
    }

    if (error instanceof jwt.JsonWebTokenError) {
      logger.warn('Invalid JWT token', { error: error.message });
      next(new UnauthorizedError('Invalid token'));
      return;
    }

    next(error);
  }
}

/**
 * Optional authentication - doesn't fail if no token
 */
export function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      next();
      return;
    }

    const token = authHeader.substring(7);

    if (!token) {
      next();
      return;
    }

    try {
      const decoded = jwt.verify(token, config.JWT_SECRET, {
        algorithms: ['HS256']
      }) as TokenPayload;

      req.user = {
        id: decoded.id,
        email: decoded.email,
        phone: decoded.phone,
        role: decoded.role,
        status: decoded.status
      };
      req.userId = decoded.id;
    } catch {
      // Continue without authentication
    }

    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Require authentication
 */
export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    throw new UnauthorizedError('Authentication required');
  }
  next();
}

/**
 * Verify temporary token (for 2FA flow)
 */
export function verifyTempToken(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const { tempToken } = req.body;

    if (!tempToken) {
      throw new AppError('Temporary token required', 400, 'TEMP_TOKEN_REQUIRED');
    }

    const decoded = jwt.verify(tempToken, config.JWT_SECRET) as TempTokenPayload;

    if (decoded.purpose !== '2fa_verify') {
      throw new UnauthorizedError('Invalid temporary token');
    }

    // Attach to request for next middleware
    req.user = {
      id: decoded.userId,
      role: 'paid_member', // Will be updated with actual role
      status: 'active'
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      next(new UnauthorizedError('Temporary token has expired'));
      return;
    }
    next(error);
  }
}

/**
 * Check if 2FA is required for admin users
 */
export function check2faRequired(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    throw new UnauthorizedError('Authentication required');
  }

  if (ADMIN_ROLES.includes(req.user.role)) {
    log.security.adminAccessWithout2fa(req.user.id);
  }

  next();
}
