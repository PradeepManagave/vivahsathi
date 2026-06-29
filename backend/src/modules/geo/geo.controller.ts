// ============================================================
// Geo Controller
// ============================================================

import { Request, Response, NextFunction } from 'express';
import { GeoService } from './geo.service';
import { successResponse } from '../../shared/utils/response';

export class GeoController {
  private geoService: GeoService;

  constructor() {
    this.geoService = new GeoService();
  }

  async getCountries(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const countries = await this.geoService.getCountries();

      res.json(successResponse(countries));
    } catch (error) {
      next(error);
    }
  }

  async getStates(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { countryId } = req.params;
      const states = await this.geoService.getStates(countryId);

      res.json(successResponse(states));
    } catch (error) {
      next(error);
    }
  }

  async getDistricts(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { stateId } = req.params;
      const districts = await this.geoService.getDistricts(stateId);

      res.json(successResponse(districts));
    } catch (error) {
      next(error);
    }
  }

  async getTalukas(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { districtId } = req.params;
      const talukas = await this.geoService.getTalukas(districtId);

      res.json(successResponse(talukas));
    } catch (error) {
      next(error);
    }
  }

  async getVillages(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { search, talukaId, page = '1', limit = '20' } = req.query;

      const result = await this.geoService.getVillages({
        search: search as string,
        talukaId: talukaId as string,
        page: parseInt(page as string),
        limit: parseInt(limit as string)
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

  async requestVillage(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.id;
      const { name, talukaId, pincode, description } = req.body;

      const result = await this.geoService.requestVillage({
        userId,
        name,
        talukaId,
        pincode,
        description
      });

      res.status(201).json(successResponse(result, 'Village request submitted successfully. It will be reviewed by an administrator.'));
    } catch (error) {
      next(error);
    }
  }

  async searchLocations(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { q, level } = req.query;

      const results = await this.geoService.searchLocations(
        q as string,
        level as 'country' | 'state' | 'district' | 'taluka' | 'village' | undefined
      );

      res.json(successResponse(results));
    } catch (error) {
      next(error);
    }
  }

  async getHierarchy(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { locationType, id } = req.params;

      const hierarchy = await this.geoService.getHierarchy(
        locationType as 'country' | 'state' | 'district' | 'taluka' | 'village',
        id
      );

      res.json(successResponse(hierarchy));
    } catch (error) {
      next(error);
    }
  }

  async getLocationByPincode(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { pincode } = req.params;

      const location = await this.geoService.getLocationByPincode(pincode);

      res.json(successResponse(location));
    } catch (error) {
      next(error);
    }
  }
}
