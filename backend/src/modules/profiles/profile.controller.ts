// ============================================================
// Profile Controller
// ============================================================

import { Request, Response, NextFunction } from 'express';
import { ProfileService } from './profile.service';
import { PhotoService } from './photo.service';
import { ApiResponse } from '../../types/index';
import { successResponse } from '../../shared/utils/response';
import { ValidationError } from '../../shared/utils/errors';
import { WhatsAppService } from '../../shared/services/whatsapp.service';
import { config } from '../../config/index';

export class ProfileController {
  private profileService: ProfileService;
  private photoService: PhotoService;

  constructor() {
    this.profileService = new ProfileService();
    this.photoService = new PhotoService();
  }

  async getProfile(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { userId } = req.params;
      const viewerId = req.user?.id;
      const visibility = req.profileVisibility!;

      const profile = await this.profileService.getProfile(
        userId,
        viewerId,
        visibility
      );

      res.json(successResponse(profile));
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.id;
      const profileData = req.body;

      const result = await this.profileService.updateProfile(userId, profileData);

      res.json(successResponse(result, 'Profile updated successfully'));
    } catch (error) {
      next(error);
    }
  }

  async uploadPhoto(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.file) {
        throw new ValidationError('Photo file is required');
      }

      const userId = req.user!.id;
      const { displayOrder, isPrimary, visibility } = req.body;

      const photo = await this.photoService.uploadPhoto(userId, req.file, {
        displayOrder: displayOrder ? parseInt(displayOrder) : undefined,
        isPrimary: isPrimary === 'true',
        visibility: visibility || 'all'
      });

      res.json(successResponse(photo, 'Photo uploaded successfully. It will be visible after admin approval.'));
    } catch (error) {
      next(error);
    }
  }

  async updatePhoto(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.id;
      const { photoId } = req.params;
      const updateData = req.body;

      const photo = await this.photoService.updatePhoto(userId, photoId, updateData);

      res.json(successResponse(photo, 'Photo updated successfully'));
    } catch (error) {
      next(error);
    }
  }

  async deletePhoto(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.id;
      const { photoId } = req.params;

      await this.photoService.deletePhoto(userId, photoId);

      res.json(successResponse(null, 'Photo deleted successfully'));
    } catch (error) {
      next(error);
    }
  }

  async updatePartnerPreference(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.id;
      const preferenceData = req.body;

      const result = await this.profileService.updatePartnerPreference(
        userId,
        preferenceData
      );

      res.json(successResponse(result, 'Partner preferences updated successfully'));
    } catch (error) {
      next(error);
    }
  }

  async getFamilyInfo(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { userId } = req.params;
      const viewerId = req.user?.id;
      const visibility = req.profileVisibility!;

      const familyInfo = await this.profileService.getFamilyInfo(
        userId,
        viewerId,
        visibility
      );

      res.json(successResponse(familyInfo));
    } catch (error) {
      next(error);
    }
  }

  async updateFamilyInfo(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.id;
      const familyData = req.body;

      const result = await this.profileService.updateFamilyInfo(userId, familyData);

      res.json(successResponse(result, 'Family information updated successfully'));
    } catch (error) {
      next(error);
    }
  }

  async getHoroscope(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { userId } = req.params;
      const viewerId = req.user?.id;
      const visibility = req.profileVisibility!;

      const horoscope = await this.profileService.getHoroscope(
        userId,
        viewerId,
        visibility
      );

      res.json(successResponse(horoscope));
    } catch (error) {
      next(error);
    }
  }

  async updateHoroscope(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.id;
      const horoscopeData = req.body;

      const result = await this.profileService.updateHoroscope(userId, horoscopeData);

      res.json(successResponse(result, 'Horoscope information updated successfully'));
    } catch (error) {
      next(error);
    }
  }

  async getProfileCompletion(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.id;

      const completion = await this.profileService.getProfileCompletion(userId);

      res.json(successResponse(completion));
    } catch (error) {
      next(error);
    }
  }

  async generateShareLink(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.id;
      const profileInfo = await this.profileService.getProfileSharingInfo(userId);

      const shareUrl = `${config.CORS_ORIGIN}/profile/by-username/${profileInfo.profileSlug}`;
      const shortUrl = shareUrl;

      res.json(successResponse({
        shareUrl,
        shortUrl,
        title: `Check out ${profileInfo.displayName}'s profile on VivahSathi`,
        description: `View ${profileInfo.displayName}'s matrimony profile on VivahSathi`
      }));
    } catch (error) {
      next(error);
    }
  }

  async shareProfile(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.id;
      const { platform, recipientPhone } = req.body;
      const profileInfo = await this.profileService.getProfileSharingInfo(userId);

      const shareUrl = `${config.CORS_ORIGIN}/profile/by-username/${profileInfo.profileSlug}`;

      let sent = false;
      if (platform === 'whatsapp' && recipientPhone) {
        await WhatsAppService.sendTemplate({
          to: recipientPhone,
          templateName: 'profile_share',
          parameters: {
            name: profileInfo.displayName,
            profileUrl: shareUrl
          }
        });
        sent = true;
      }

      res.json(successResponse({
        shareUrl,
        platform,
        sent
      }, 'Profile shared successfully'));
    } catch (error) {
      next(error);
    }
  }
}
