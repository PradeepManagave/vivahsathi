import { Request, Response, NextFunction } from 'express';
import { cmsService } from './cms.service';
import { successResponse } from '../../shared/utils/response';

export class CmsController {
  async listPages(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, language, page = '1', limit = '20' } = req.query;
      const result = await cmsService.listPages({ status: status as string, language: language as string, page: parseInt(page as string, 10), limit: parseInt(limit as string, 10) });
      res.json(successResponse(result));
    } catch (error) { next(error); }
  }

  async getPageBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const page = await cmsService.getPageBySlug(req.params.slug);
      res.json(successResponse(page));
    } catch (error) { next(error); }
  }

  async getPage(req: Request, res: Response, next: NextFunction) {
    try {
      const page = await cmsService.getPageById(req.params.id);
      res.json(successResponse(page));
    } catch (error) { next(error); }
  }

  async createPage(req: Request, res: Response, next: NextFunction) {
    try {
      const page = await cmsService.createPage({ ...req.body, authorId: (req as any).user?.id });
      res.status(201).json(successResponse(page, 'Page created'));
    } catch (error) { next(error); }
  }

  async updatePage(req: Request, res: Response, next: NextFunction) {
    try {
      const page = await cmsService.updatePage(req.params.id, req.body);
      res.json(successResponse(page, 'Page updated'));
    } catch (error) { next(error); }
  }

  async deletePage(req: Request, res: Response, next: NextFunction) {
    try {
      await cmsService.deletePage(req.params.id);
      res.json(successResponse(null, 'Page deleted'));
    } catch (error) { next(error); }
  }

  async listTestimonials(req: Request, res: Response, next: NextFunction) {
    try {
      const { featured, approved, page = '1', limit = '20' } = req.query;
      const result = await cmsService.listTestimonials({ featured: featured === 'true', approved: approved !== 'false', page: parseInt(page as string, 10), limit: parseInt(limit as string, 10) });
      res.json(successResponse(result));
    } catch (error) { next(error); }
  }

  async createTestimonial(req: Request, res: Response, next: NextFunction) {
    try {
      const testimonial = await cmsService.createTestimonial({ ...req.body, userId: (req as any).user?.id });
      res.status(201).json(successResponse(testimonial, 'Testimonial submitted'));
    } catch (error) { next(error); }
  }

  async approveTestimonial(req: Request, res: Response, next: NextFunction) {
    try {
      await cmsService.approveTestimonial(req.params.id);
      res.json(successResponse(null, 'Testimonial approved'));
    } catch (error) { next(error); }
  }

  async deleteTestimonial(req: Request, res: Response, next: NextFunction) {
    try {
      await cmsService.deleteTestimonial(req.params.id);
      res.json(successResponse(null, 'Testimonial deleted'));
    } catch (error) { next(error); }
  }

  async listSuccessStories(req: Request, res: Response, next: NextFunction) {
    try {
      const { featured, status, page = '1', limit = '20' } = req.query;
      const result = await cmsService.listSuccessStories({ featured: featured === 'true', status: status as string, page: parseInt(page as string, 10), limit: parseInt(limit as string, 10) });
      res.json(successResponse(result));
    } catch (error) { next(error); }
  }

  async getSuccessStoryBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const story = await cmsService.getSuccessStoryBySlug(req.params.slug);
      res.json(successResponse(story));
    } catch (error) { next(error); }
  }

  async getSuccessStory(req: Request, res: Response, next: NextFunction) {
    try {
      const story = await cmsService.getSuccessStoryById(req.params.id);
      res.json(successResponse(story));
    } catch (error) { next(error); }
  }

  async createSuccessStory(req: Request, res: Response, next: NextFunction) {
    try {
      const story = await cmsService.createSuccessStory({ ...req.body, authorId: (req as any).user?.id });
      res.status(201).json(successResponse(story, 'Story created'));
    } catch (error) { next(error); }
  }

  async updateSuccessStory(req: Request, res: Response, next: NextFunction) {
    try {
      const story = await cmsService.updateSuccessStory(req.params.id, req.body);
      res.json(successResponse(story, 'Story updated'));
    } catch (error) { next(error); }
  }

  async deleteSuccessStory(req: Request, res: Response, next: NextFunction) {
    try {
      await cmsService.deleteSuccessStory(req.params.id);
      res.json(successResponse(null, 'Story deleted'));
    } catch (error) { next(error); }
  }
}

export const cmsController = new CmsController();
