import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../../shared/middleware/validate';
import { authenticate } from '../../shared/middleware/auth';
import { asyncHandler } from '../../shared/middleware/error-handler';
import { marketplaceController } from './marketplace.controller';

const router = Router();

// Vendors
router.get('/vendors', asyncHandler(marketplaceController.listVendors.bind(marketplaceController)));
router.get('/vendors/:id', asyncHandler(marketplaceController.getVendor.bind(marketplaceController)));
router.post('/vendors', authenticate, [
  body('businessName').notEmpty().withMessage('Business name is required'),
  body('categoryId').notEmpty().withMessage('Category is required'),
  body('phone').notEmpty().withMessage('Phone is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  validate,
], asyncHandler(marketplaceController.createVendor.bind(marketplaceController)));
router.put('/vendors/:id', authenticate, asyncHandler(marketplaceController.updateVendor.bind(marketplaceController)));
router.delete('/vendors/:id', authenticate, asyncHandler(marketplaceController.deleteVendor.bind(marketplaceController)));

// Classifieds
router.get('/classifieds', asyncHandler(marketplaceController.listClassifieds.bind(marketplaceController)));
router.get('/classifieds/:id', asyncHandler(marketplaceController.getClassified.bind(marketplaceController)));
router.post('/classifieds', authenticate, [
  body('title').notEmpty().withMessage('Title is required'),
  body('categoryId').notEmpty().withMessage('Category is required'),
  body('price').notEmpty().withMessage('Price is required'),
  body('phone').notEmpty().withMessage('Phone is required'),
  validate,
], asyncHandler(marketplaceController.createClassified.bind(marketplaceController)));
router.put('/classifieds/:id', authenticate, asyncHandler(marketplaceController.updateClassified.bind(marketplaceController)));
router.delete('/classifieds/:id', authenticate, asyncHandler(marketplaceController.deleteClassified.bind(marketplaceController)));
router.post('/classifieds/:id/favorite', authenticate, asyncHandler(marketplaceController.toggleClassifiedFavorite.bind(marketplaceController)));

// Categories
router.get('/categories', asyncHandler(marketplaceController.listCategories.bind(marketplaceController)));
router.get('/categories/:id', asyncHandler(marketplaceController.getCategory.bind(marketplaceController)));
router.post('/categories', authenticate, [
  body('name').notEmpty().withMessage('Category name is required'),
  body('type').isIn(['vendor', 'classified']).withMessage('Type must be vendor or classified'),
  validate,
], asyncHandler(marketplaceController.createCategory.bind(marketplaceController)));
router.put('/categories/:id', authenticate, asyncHandler(marketplaceController.updateCategory.bind(marketplaceController)));
router.delete('/categories/:id', authenticate, asyncHandler(marketplaceController.deleteCategory.bind(marketplaceController)));
router.get('/categories/:id/vendors', asyncHandler(marketplaceController.getVendorsByCategory.bind(marketplaceController)));
router.get('/categories/:id/classifieds', asyncHandler(marketplaceController.getClassifiedsByCategory.bind(marketplaceController)));

// Inquiries
router.post('/vendors/:id/inquire', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('message').notEmpty().withMessage('Message is required'),
  validate,
], asyncHandler(marketplaceController.submitVendorInquiry.bind(marketplaceController)));
router.get('/vendors/:id/inquiries', authenticate, asyncHandler(marketplaceController.listVendorInquiries.bind(marketplaceController)));

// Reviews
router.post('/vendors/:vendorId/reviews', authenticate, [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').isString().trim().notEmpty().isLength({ max: 1000 }).withMessage('Comment is required (max 1000 chars)'),
  validate,
], asyncHandler(marketplaceController.submitReview.bind(marketplaceController)));
router.get('/vendors/:vendorId/reviews', asyncHandler(marketplaceController.getVendorReviews.bind(marketplaceController)));
router.get('/vendors/:vendorId/review', authenticate, asyncHandler(marketplaceController.getUserReview.bind(marketplaceController)));
router.delete('/reviews/:reviewId', authenticate, asyncHandler(marketplaceController.deleteReview.bind(marketplaceController)));

// Verification
router.post('/vendors/:vendorId/verification', authenticate, [
  body('documents').isArray({ min: 1 }).withMessage('At least one document required'),
  body('documents.*.type').isString().notEmpty(),
  body('documents.*.url').isURL(),
  body('notes').optional().isString().trim(),
  validate,
], asyncHandler(marketplaceController.submitVerification.bind(marketplaceController)));
router.get('/vendors/:vendorId/verification', authenticate, asyncHandler(marketplaceController.getVerificationDocuments.bind(marketplaceController)));
router.put('/vendors/:vendorId/verification', authenticate, [
  body('status').isIn(['verified', 'rejected']).withMessage('Status must be verified or rejected'),
  body('rejectionReason').optional().isString().trim(),
  validate,
], asyncHandler(marketplaceController.reviewVerification.bind(marketplaceController)));
router.get('/verifications/pending', authenticate, asyncHandler(marketplaceController.listPendingVerifications.bind(marketplaceController)));

export const marketplaceRouter = router;
