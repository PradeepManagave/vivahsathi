// ============================================================
// Profile Visibility Middleware
// ============================================================

import { Request, Response, NextFunction } from 'express';
import { db } from '../../config/database';
import { UserRole } from '../../types/index';
import { isAdminRole } from '../../shared/constants/roles';

export type VisibilityLevel = 'minimal' | 'basic' | 'full' | 'admin';

interface VisibilityContext {
  viewerRole: UserRole;
  viewerId?: string;
  profileUserId: string;
  isOwnProfile: boolean;
  hasAcceptedInterest: boolean;
  isPaidMember: boolean;
}

export async function getProfileVisibility(
  context: VisibilityContext
): Promise<VisibilityLevel> {
  const { viewerRole, isOwnProfile, hasAcceptedInterest, isPaidMember } = context;

  if (isAdminRole(viewerRole)) {
    return 'admin';
  }

  if (isOwnProfile) {
    return 'full';
  }

  if (viewerRole === 'guest' || viewerRole === undefined) {
    return 'minimal';
  }

  if (isPaidMember && hasAcceptedInterest) {
    return 'full';
  }

  if (isPaidMember) {
    return 'basic';
  }

  if (hasAcceptedInterest) {
    return 'basic';
  }

  return 'basic';
}

export function createProfileVisibilityMiddleware(
  fieldPermissions: Record<VisibilityLevel, string[]>
) {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { userId } = req.params;
      const viewerId = req.user?.id;
      const viewerRole = req.user?.role || 'guest';

      if (!userId) {
        next();
        return;
      }

      const isOwnProfile = viewerId === userId;

      let hasAcceptedInterest = false;
      let isPaidMember = false;

      if (viewerId && viewerId !== userId) {
        const [interest, membership] = await Promise.all([
          db('interests')
            .where('sender_id', viewerId)
            .where('receiver_id', userId)
            .where('status', 'accepted')
            .first(),
          db('user_memberships')
            .where('user_id', viewerId)
            .where('status', 'active')
            .where('end_date', '>', new Date())
            .first()
        ]);

        hasAcceptedInterest = !!interest;
        isPaidMember = !!membership;
      }

      const visibilityLevel = await getProfileVisibility({
        viewerRole,
        viewerId,
        profileUserId: userId,
        isOwnProfile,
        hasAcceptedInterest,
        isPaidMember
      });

      req.profileVisibility = visibilityLevel;
      req.allowedFields = fieldPermissions[visibilityLevel];

      next();
    } catch (error) {
      next(error);
    }
  };
}

declare global {
  namespace Express {
    interface Request {
      profileVisibility?: VisibilityLevel;
      allowedFields?: string[];
    }
  }
}

export function filterProfileFields<T extends Record<string, unknown>>(
  profile: T,
  allowedFields: string[],
  visibility: VisibilityLevel
): Partial<T> {
  if (visibility === 'admin') {
    return profile;
  }

  const filtered: Partial<T> = {};

  for (const field of allowedFields) {
    if (field in profile) {
      (filtered as Record<string, unknown>)[field] = profile[field];
    }
  }

  return filtered;
}

export function shouldShowContactDetails(visibility: VisibilityLevel): boolean {
  return visibility === 'full' || visibility === 'admin';
}

export function shouldShowSocialLinks(visibility: VisibilityLevel): boolean {
  return visibility === 'full' || visibility === 'admin';
}
