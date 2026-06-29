import { Request, Response, NextFunction } from 'express';
import { marketplaceService } from './marketplace.service';
import { successResponse } from '../../shared/utils/response';

export class MarketplaceController {
  async listVendors(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = '1', limit = '20', categoryId, search, location, sort, isVerified } = req.query;
      const result = await marketplaceService.listVendors({
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10),
        categoryId: categoryId as string,
        search: search as string,
        location: location as string,
        sort: sort as string,
        isVerified: isVerified === 'true',
      });
      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  }

  async getVendor(req: Request, res: Response, next: NextFunction) {
    try {
      const vendor = await marketplaceService.getVendorById(req.params.id);
      res.json(successResponse(vendor));
    } catch (error) {
      next(error);
    }
  }

  async createVendor(req: Request, res: Response, next: NextFunction) {
    try {
      const vendor = await marketplaceService.createVendor(req.body);
      res.status(201).json(successResponse(vendor, 'Vendor created successfully'));
    } catch (error) {
      next(error);
    }
  }

  async updateVendor(req: Request, res: Response, next: NextFunction) {
    try {
      const vendor = await marketplaceService.updateVendor(req.params.id, req.body);
      res.json(successResponse(vendor, 'Vendor updated successfully'));
    } catch (error) {
      next(error);
    }
  }

  async deleteVendor(req: Request, res: Response, next: NextFunction) {
    try {
      await marketplaceService.deleteVendor(req.params.id);
      res.json(successResponse(null, 'Vendor deleted successfully'));
    } catch (error) {
      next(error);
    }
  }

  async listClassifieds(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = '1', limit = '20', categoryId, search, location, sort, userId } = req.query;
      const result = await marketplaceService.listClassifieds({
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10),
        categoryId: categoryId as string,
        search: search as string,
        location: location as string,
        sort: sort as string,
        userId: userId as string,
      });
      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  }

  async getClassified(req: Request, res: Response, next: NextFunction) {
    try {
      const classified = await marketplaceService.getClassifiedById(req.params.id);
      res.json(successResponse(classified));
    } catch (error) {
      next(error);
    }
  }

  async createClassified(req: Request, res: Response, next: NextFunction) {
    try {
      const classified = await marketplaceService.createClassified({ ...req.body, postedByUserId: (req as any).user?.id });
      res.status(201).json(successResponse(classified, 'Classified created successfully'));
    } catch (error) {
      next(error);
    }
  }

  async updateClassified(req: Request, res: Response, next: NextFunction) {
    try {
      const classified = await marketplaceService.updateClassified(req.params.id, req.body);
      res.json(successResponse(classified, 'Classified updated successfully'));
    } catch (error) {
      next(error);
    }
  }

  async deleteClassified(req: Request, res: Response, next: NextFunction) {
    try {
      await marketplaceService.deleteClassified(req.params.id);
      res.json(successResponse(null, 'Classified deleted successfully'));
    } catch (error) {
      next(error);
    }
  }

  async toggleClassifiedFavorite(req: Request, res: Response, next: NextFunction) {
    try {
      await marketplaceService.toggleClassifiedFavorite(req.params.id);
      res.json(successResponse(null, 'Favorite toggled'));
    } catch (error) {
      next(error);
    }
  }

  async listCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const type = req.query.type as string | undefined;
      const categories = await marketplaceService.listCategories(type as any);
      res.json(successResponse(categories));
    } catch (error) {
      next(error);
    }
  }

  async getCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await marketplaceService.getCategoryById(req.params.id);
      res.json(successResponse(category));
    } catch (error) {
      next(error);
    }
  }

  async createCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await marketplaceService.createCategory(req.body);
      res.status(201).json(successResponse(category, 'Category created successfully'));
    } catch (error) {
      next(error);
    }
  }

  async updateCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await marketplaceService.updateCategory(req.params.id, req.body);
      res.json(successResponse(category, 'Category updated successfully'));
    } catch (error) {
      next(error);
    }
  }

  async deleteCategory(req: Request, res: Response, next: NextFunction) {
    try {
      await marketplaceService.deleteCategory(req.params.id);
      res.json(successResponse(null, 'Category deleted successfully'));
    } catch (error) {
      next(error);
    }
  }

  async getVendorsByCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = '1', limit = '20' } = req.query;
      const result = await marketplaceService.getVendorsByCategory(req.params.id, parseInt(page as string, 10), parseInt(limit as string, 10));
      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  }

  async getClassifiedsByCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = '1', limit = '20' } = req.query;
      const result = await marketplaceService.getClassifiedsByCategory(req.params.id, parseInt(page as string, 10), parseInt(limit as string, 10));
      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  }

  async submitVendorInquiry(req: Request, res: Response, next: NextFunction) {
    try {
      await marketplaceService.submitVendorInquiry({ vendorId: req.params.id, userId: (req as any).user?.id, ...req.body });
      res.status(201).json(successResponse(null, 'Inquiry submitted successfully'));
    } catch (error) {
      next(error);
    }
  }

  async listVendorInquiries(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = '1', limit = '20' } = req.query;
      const result = await marketplaceService.listVendorInquiries(req.params.id, parseInt(page as string, 10), parseInt(limit as string, 10));
      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  }

  async submitReview(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const { vendorId } = req.params;
      const { rating, comment } = req.body;
      const review = await marketplaceService.submitReview(vendorId, userId, parseInt(rating, 10), comment);
      res.json(successResponse(review, 'Review submitted successfully'));
    } catch (error) {
      next(error);
    }
  }

  async getVendorReviews(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = '1', limit = '20' } = req.query;
      const result = await marketplaceService.getVendorReviews(req.params.vendorId, parseInt(page as string, 10), parseInt(limit as string, 10));
      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  }

  async getUserReview(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const review = await marketplaceService.getUserReview(req.params.vendorId, userId);
      res.json(successResponse(review));
    } catch (error) {
      next(error);
    }
  }

  async deleteReview(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      await marketplaceService.deleteReview(req.params.reviewId, userId);
      res.json(successResponse(null, 'Review deleted successfully'));
    } catch (error) {
      next(error);
    }
  }

  async submitVerification(req: Request, res: Response, next: NextFunction) {
    try {
      const { vendorId } = req.params;
      const { documents, notes } = req.body;
      await marketplaceService.submitVerification(vendorId, documents, notes);
      res.json(successResponse(null, 'Verification documents submitted'));
    } catch (error) {
      next(error);
    }
  }

  async getVerificationDocuments(req: Request, res: Response, next: NextFunction) {
    try {
      const docs = await marketplaceService.getVerificationDocuments(req.params.vendorId);
      res.json(successResponse(docs));
    } catch (error) {
      next(error);
    }
  }

  async reviewVerification(req: Request, res: Response, next: NextFunction) {
    try {
      const adminId = (req as any).user?.id;
      const { vendorId } = req.params;
      const { status, rejectionReason } = req.body;
      await marketplaceService.reviewVerification(vendorId, adminId, status, rejectionReason);
      res.json(successResponse(null, `Vendor ${status}`));
    } catch (error) {
      next(error);
    }
  }

  async listPendingVerifications(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = '1', limit = '20' } = req.query;
      const result = await marketplaceService.listPendingVerifications(parseInt(page as string, 10), parseInt(limit as string, 10));
      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  }
}

export const marketplaceController = new MarketplaceController();
