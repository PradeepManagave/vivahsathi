// ============================================================
// Membership Enforcement Middleware
// ============================================================

import { Request, Response, NextFunction } from 'express';
import { membershipService } from '../../modules/membership/membership.service';
import { ForbiddenError, MembershipExpiredError, UpgradeRequiredError, MembershipLimitError } from '../utils/errors';
import logger, { log } from '../../config/logger';

export function requireActiveMembership(
  options: { feature?: string } = {}
) {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        throw new ForbiddenError('Authentication required');
      }

      const membership = await membershipService.getMyMembership(userId);

      if (!membership) {
        throw new UpgradeRequiredError('Premium membership');
      }

      if (membership.status !== 'active') {
        throw new MembershipExpiredError();
      }

      if (new Date(membership.endDate) < new Date()) {
        throw new MembershipExpiredError();
      }

      req.userMembership = membership;

      next();
    } catch (error) {
      next(error);
    }
  };
}

export function requireContactAccess() {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        throw new ForbiddenError('Authentication required');
      }

      const access = await membershipService.checkContactAccess(userId);

      if (!access.allowed) {
        log.membership.accessDenied(userId, 'contact_view', access.reason || 'limit_exceeded');
        throw new UpgradeRequiredError('Contact viewing');
      }

      const viewCount = await membershipService.incrementContactView(userId);

      log.membership.contactViewed(userId, viewCount);

      res.setHeader('X-Contacts-Viewed-Today', viewCount.toString());

      next();
    } catch (error) {
      next(error);
    }
  };
}

export function requireVideoChatAccess() {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        throw new ForbiddenError('Authentication required');
      }

      const access = await membershipService.checkVideoChatAccess(userId);

      if (!access.allowed) {
        log.membership.accessDenied(userId, 'video_chat', access.reason || 'membership_required');
        throw new UpgradeRequiredError('Video chat');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

export function requireSocialLinksAccess() {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        next();
        return;
      }

      const membership = await membershipService.getMyMembership(userId);

      if (!membership || !membership.plan.canAddSocialLinks) {
        throw new UpgradeRequiredError('Social links');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

export function requireAdFree() {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        req.showAds = true;
        next();
        return;
      }

      const membership = await membershipService.getMyMembership(userId);

      req.showAds = !membership || !membership.plan.isAdFree;

      next();
    } catch (error) {
      req.showAds = true;
      next();
    }
  };
}

export function checkPhotoLimit(photoCount: number) {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        next();
        return;
      }

      const membership = await membershipService.getMyMembership(userId);

      const maxPhotos = membership?.plan.maxPhotos || 3;

      if (photoCount >= maxPhotos) {
        throw new MembershipLimitError(`photo upload (${maxPhotos} photos)`);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

declare global {
  namespace Express {
    interface Request {
      userMembership?: {
        id: string;
        planId: string;
        plan: {
          maxContactsPerDay?: number;
          canViewContacts: boolean;
          canVideoChat: boolean;
          canAddSocialLinks: boolean;
          isAdFree: boolean;
        };
      };
      showAds?: boolean;
    }
  }
}
