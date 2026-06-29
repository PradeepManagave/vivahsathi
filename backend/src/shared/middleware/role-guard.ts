// ============================================================
// Role Guard Middleware
// ============================================================

import { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../utils/errors';
import { UserRole } from '../../types/index';

// Role hierarchy levels
const ROLE_LEVELS: Record<UserRole, number> = {
  guest: 0,
  free_member: 1,
  paid_member: 2,
  centre_staff: 3,
  centre_admin: 4,
  franchise_admin: 4,
  super_admin: 5
};

/**
 * Require specific roles
 */
export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new ForbiddenError('Authentication required');
    }

    const userRole = req.user.role;

    // Super admin has access to everything
    if (userRole === 'super_admin') {
      next();
      return;
    }

    // Check if user's role is in allowed roles
    if (!allowedRoles.includes(userRole)) {
      throw new ForbiddenError(
        `Access denied. Required roles: ${allowedRoles.join(', ')}. Your role: ${userRole}`
      );
    }

    next();
  };
}

/**
 * Require minimum role level
 */
export function requireMinRole(minRole: UserRole) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new ForbiddenError('Authentication required');
    }

    const userRole = req.user.role;
    const userLevel = ROLE_LEVELS[userRole] ?? 0;
    const requiredLevel = ROLE_LEVELS[minRole] ?? 0;

    // Super admin bypasses level checks
    if (userRole === 'super_admin') {
      next();
      return;
    }

    if (userLevel < requiredLevel) {
      throw new ForbiddenError(
        `Access denied. Minimum required role: ${minRole} (Level ${requiredLevel}). Your role: ${userRole} (Level ${userLevel})`
      );
    }

    next();
  };
}

/**
 * Require admin role (centre or super)
 */
export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    throw new ForbiddenError('Authentication required');
  }

  const adminRoles: UserRole[] = ['centre_admin', 'centre_staff', 'super_admin'];

  if (!adminRoles.includes(req.user.role)) {
    throw new ForbiddenError('Admin access required');
  }

  next();
}

/**
 * Require super admin
 */
export function requireSuperAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    throw new ForbiddenError('Authentication required');
  }

  if (req.user.role !== 'super_admin') {
    throw new ForbiddenError('Super admin access required');
  }

  next();
}

/**
 * Require paid member or above
 */
export function requirePaidMember(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    throw new ForbiddenError('Authentication required');
  }

  const paidRoles: UserRole[] = ['paid_member', 'centre_staff', 'centre_admin', 'super_admin'];

  if (!paidRoles.includes(req.user.role)) {
    throw new ForbiddenError('Premium membership required for this feature');
  }

  next();
}

/**
 * Require franchise access
 */
export function requireFranchiseAccess(franchiseIdParam: string = 'id') {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new ForbiddenError('Authentication required');
    }

    // Super admin has access to all franchises
    if (req.user.role === 'super_admin') {
      next();
      return;
    }

    // Centre admin/staff can only access their own franchise
    const adminRoles: UserRole[] = ['centre_admin', 'centre_staff'];

    if (adminRoles.includes(req.user.role)) {
      // In production, you'd verify that req.user.franchiseId matches req.params[franchiseIdParam]
      next();
      return;
    }

    throw new ForbiddenError('Franchise access required');
  };
}

/**
 * Check role level
 */
export function hasMinRole(userRole: UserRole, minRole: UserRole): boolean {
  return (ROLE_LEVELS[userRole] ?? 0) >= (ROLE_LEVELS[minRole] ?? 0);
}

/**
 * Check if admin role
 */
export function isAdmin(role: UserRole): boolean {
  return ['centre_admin', 'centre_staff', 'super_admin'].includes(role);
}

/**
 * Check if member role (free or paid)
 */
export function isMember(role: UserRole): boolean {
  return ['free_member', 'paid_member'].includes(role);
}

/**
 * Check if paid member
 */
export function isPaidMember(role: UserRole): boolean {
  return role === 'paid_member';
}
