import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../../shared/middleware/validate';
import { authenticate } from '../../shared/middleware/auth';
import { asyncHandler } from '../../shared/middleware/error-handler';
import { cmsController } from './cms.controller';

const router = Router();

// Pages (public read, auth write)
router.get('/pages', asyncHandler(cmsController.listPages.bind(cmsController)));
router.get('/pages/slug/:slug', asyncHandler(cmsController.getPageBySlug.bind(cmsController)));
router.get('/pages/:id', asyncHandler(cmsController.getPage.bind(cmsController)));
router.post('/pages', authenticate, [
  body('title').notEmpty().withMessage('Title is required'),
  body('content').notEmpty().withMessage('Content is required'),
  validate,
], asyncHandler(cmsController.createPage.bind(cmsController)));
router.put('/pages/:id', authenticate, asyncHandler(cmsController.updatePage.bind(cmsController)));
router.delete('/pages/:id', authenticate, asyncHandler(cmsController.deletePage.bind(cmsController)));

// Testimonials
router.get('/testimonials', asyncHandler(cmsController.listTestimonials.bind(cmsController)));
router.post('/testimonials', [
  body('name').notEmpty().withMessage('Name is required'),
  body('content').notEmpty().withMessage('Content is required'),
  validate,
], asyncHandler(cmsController.createTestimonial.bind(cmsController)));
router.put('/testimonials/:id/approve', authenticate, asyncHandler(cmsController.approveTestimonial.bind(cmsController)));
router.delete('/testimonials/:id', authenticate, asyncHandler(cmsController.deleteTestimonial.bind(cmsController)));

// Success Stories
router.get('/success-stories', asyncHandler(cmsController.listSuccessStories.bind(cmsController)));
router.get('/success-stories/slug/:slug', asyncHandler(cmsController.getSuccessStoryBySlug.bind(cmsController)));
router.get('/success-stories/:id', asyncHandler(cmsController.getSuccessStory.bind(cmsController)));
router.post('/success-stories', authenticate, [
  body('title').notEmpty().withMessage('Title is required'),
  body('content').notEmpty().withMessage('Content is required'),
  validate,
], asyncHandler(cmsController.createSuccessStory.bind(cmsController)));
router.put('/success-stories/:id', authenticate, asyncHandler(cmsController.updateSuccessStory.bind(cmsController)));
router.delete('/success-stories/:id', authenticate, asyncHandler(cmsController.deleteSuccessStory.bind(cmsController)));

export const cmsRouter = router;
