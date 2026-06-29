// ============================================================
// Search Controller
// ============================================================

import { Request, Response, NextFunction } from 'express';
import { SearchService } from './search.service';
import { SearchIndexer } from './search-indexer.service';
import { CompatibilityService } from './compatibility.service';
import { successResponse } from '../../shared/utils/response';
import logger, { log } from '../../config/logger';
import { isAdminRole } from '../../shared/constants/roles';
import { ForbiddenError } from '../../shared/utils/errors';

export class SearchController {
  private searchService: SearchService;
  private searchIndexer: SearchIndexer;
  private compatibilityService: CompatibilityService;

  constructor() {
    this.searchService = new SearchService();
    this.searchIndexer = new SearchIndexer();
    this.compatibilityService = new CompatibilityService();
  }

  async searchProfiles(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const viewerId = req.user?.id;
      const viewerRole = req.user?.role;
      const isAdmin = viewerRole && isAdminRole(viewerRole);

      const filters = {
        gender: req.query.gender as string,
        ageMin: req.query.age_min ? parseInt(req.query.age_min as string) : undefined,
        ageMax: req.query.age_max ? parseInt(req.query.age_max as string) : undefined,
        community: req.query.community as string,
        religion: req.query.religion as string,
        caste: req.query.caste as string,
        motherTongue: req.query.mother_tongue as string,
        cityId: req.query.city_id as string,
        stateId: req.query.state_id as string,
        districtId: req.query.district_id as string,
        countryId: req.query.country_id as string,
        education: req.query.education as string,
        educationLevel: req.query.education_level as string,
        occupation: req.query.occupation as string,
        occupationCategory: req.query.occupation_category as string,
        incomeMin: req.query.income_min ? parseInt(req.query.income_min as string) : undefined,
        incomeMax: req.query.income_max ? parseInt(req.query.income_max as string) : undefined,
        heightMin: req.query.height_min ? parseInt(req.query.height_min as string) : undefined,
        heightMax: req.query.height_max ? parseInt(req.query.height_max as string) : undefined,
        manglik: req.query.manglik as string,
        diet: req.query.diet as string,
        maritalStatus: req.query.marital_status as string,
        familyType: req.query.family_type as string,
        physicalStatus: req.query.physical_status as string,
        kycVerified: req.query.kyc_verified === 'true',
        isPremium: req.query.is_premium === 'true',
        keyword: req.query.keyword as string,
        name: req.query.name as string,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
        sort: (req.query.sort as string) || 'relevance'
      };

      const result = await this.searchService.searchProfiles(filters, {
        viewerId,
        isAdmin,
        includeCompatibility: !!viewerId
      });

      res.json(successResponse(result.data, undefined, {
        page: result.page,
        pageSize: result.pageSize,
        total: result.total,
        totalPages: result.totalPages
      }));
    } catch (error) {
      next(error);
    }
  }

  async quickSearch(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const viewerId = req.user?.id;
      const viewerRole = req.user?.role;
      const isAdmin = viewerRole && isAdminRole(viewerRole);

      const filters = {
        gender: req.query.gender as string,
        ageMin: req.query.age_min ? parseInt(req.query.age_min as string) : 21,
        ageMax: req.query.age_max ? parseInt(req.query.age_max as string) : 35,
        community: req.query.community as string,
        religion: req.query.religion as string,
        city: req.query.city as string,
        state: req.query.state as string,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
        sort: 'relevance'
      };

      const result = await this.searchService.quickSearch(filters, {
        viewerId,
        isAdmin,
        includeCompatibility: !!viewerId
      });

      res.json(successResponse(result.data, undefined, {
        page: result.page,
        pageSize: result.pageSize,
        total: result.total,
        totalPages: result.totalPages
      }));
    } catch (error) {
      next(error);
    }
  }

  async getProfileById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { profileId } = req.params;
      const viewerId = req.user?.id;
      const viewerRole = req.user?.role;
      const isAdmin = viewerRole && isAdminRole(viewerRole);

      const profile = await this.searchService.getProfileById(profileId, viewerId, isAdmin);

      if (!profile) {
        res.status(404).json(successResponse(null, 'Profile not found'));
        return;
      }

      res.json(successResponse(profile));
    } catch (error) {
      next(error);
    }
  }

  async getSuggestions(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { q, type, limit } = req.query;

      const suggestions = await this.searchService.getSuggestions(
        q as string,
        type as 'names' | 'cities' | 'occupations' | 'educations' | 'all',
        parseInt(limit as string) || 10
      );

      res.json(successResponse(suggestions));
    } catch (error) {
      next(error);
    }
  }

  async searchByCity(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { cityId } = req.params;
      const viewerId = req.user?.id;
      const viewerRole = req.user?.role;
      const isAdmin = viewerRole && isAdminRole(viewerRole);

      const filters = {
        cityId,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20
      };

      const result = await this.searchService.searchByLocation(filters, {
        viewerId,
        isAdmin,
        includeCompatibility: !!viewerId
      });

      res.json(successResponse(result.data, undefined, {
        page: result.page,
        pageSize: result.pageSize,
        total: result.total,
        totalPages: result.totalPages
      }));
    } catch (error) {
      next(error);
    }
  }

  async searchByOccupation(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { category } = req.params;
      const viewerId = req.user?.id;
      const viewerRole = req.user?.role;
      const isAdmin = viewerRole && isAdminRole(viewerRole);

      const filters = {
        occupationCategory: category,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20
      };

      const result = await this.searchService.searchByOccupation(filters, {
        viewerId,
        isAdmin,
        includeCompatibility: !!viewerId
      });

      res.json(successResponse(result.data, undefined, {
        page: result.page,
        pageSize: result.pageSize,
        total: result.total,
        totalPages: result.totalPages
      }));
    } catch (error) {
      next(error);
    }
  }

  async searchByEducation(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { level } = req.params;
      const viewerId = req.user?.id;
      const viewerRole = req.user?.role;
      const isAdmin = viewerRole && isAdminRole(viewerRole);

      const filters = {
        educationLevel: level,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20
      };

      const result = await this.searchService.searchByEducation(filters, {
        viewerId,
        isAdmin,
        includeCompatibility: !!viewerId
      });

      res.json(successResponse(result.data, undefined, {
        page: result.page,
        pageSize: result.pageSize,
        total: result.total,
        totalPages: result.totalPages
      }));
    } catch (error) {
      next(error);
    }
  }

  async getRecentlyJoined(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const viewerId = req.user?.id;
      const viewerRole = req.user?.role;
      const isAdmin = viewerRole && isAdminRole(viewerRole);

      const filters = {
        days: parseInt(req.query.days as string) || 30,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20
      };

      const result = await this.searchService.getRecentlyJoined(filters, {
        viewerId,
        isAdmin,
        includeCompatibility: !!viewerId
      });

      res.json(successResponse(result.data, undefined, {
        page: result.page,
        pageSize: result.pageSize,
        total: result.total,
        totalPages: result.totalPages
      }));
    } catch (error) {
      next(error);
    }
  }

  async getPremiumMembers(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const viewerId = req.user?.id;
      const viewerRole = req.user?.role;
      const isAdmin = viewerRole && isAdminRole(viewerRole);

      const filters = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20
      };

      const result = await this.searchService.getPremiumMembers(filters, {
        viewerId,
        isAdmin,
        includeCompatibility: !!viewerId
      });

      res.json(successResponse(result.data, undefined, {
        page: result.page,
        pageSize: result.pageSize,
        total: result.total,
        totalPages: result.totalPages
      }));
    } catch (error) {
      next(error);
    }
  }

  async getFeaturedProfiles(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const viewerId = req.user?.id;

      const filters = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10
      };

      const result = await this.searchService.getFeaturedProfiles(filters, viewerId);

      res.json(successResponse(result.data, undefined, {
        page: result.page,
        pageSize: result.pageSize,
        total: result.total,
        totalPages: result.totalPages
      }));
    } catch (error) {
      next(error);
    }
  }

  async getSavedSearches(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.id;
      const savedSearches = await this.searchService.getSavedSearches(userId);

      res.json(successResponse(savedSearches));
    } catch (error) {
      next(error);
    }
  }

  async saveSearch(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.id;
      const { name, filters, notify_on_new } = req.body;

      const savedSearch = await this.searchService.saveSearch(userId, {
        name,
        filters,
        notifyOnNew: notify_on_new
      });

      res.status(201).json(successResponse(savedSearch, 'Search saved successfully'));
    } catch (error) {
      next(error);
    }
  }

  async deleteSavedSearch(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.id;
      const { searchId } = req.params;

      await this.searchService.deleteSavedSearch(userId, searchId);

      res.json(successResponse(null, 'Saved search deleted'));
    } catch (error) {
      next(error);
    }
  }

  async getMatchPercentage(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.id;
      const { profileId } = req.params;

      const match = await this.compatibilityService.calculateMatchPercentage(
        userId,
        profileId
      );

      res.json(successResponse(match));
    } catch (error) {
      next(error);
    }
  }

  async exportResults(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const adminId = req.user!.id;
      const { filters, format, max_records } = req.body;

      const result = await this.searchService.exportResults(
        adminId,
        filters || {},
        format as 'csv' | 'excel',
        max_records
      );

      if (format === 'excel') {
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="search-results-${Date.now()}.xlsx"`);
      } else {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="search-results-${Date.now()}.csv"`);
      }

      res.send(result);
    } catch (error) {
      next(error);
    }
  }

  async triggerReindex(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const adminId = req.user!.id;
      const { full } = req.body;

      await this.searchIndexer.triggerReindex(full || false, adminId);

      res.json(successResponse({ status: 'reindex_triggered' }, 'Reindex triggered successfully'));
    } catch (error) {
      next(error);
    }
  }
}
