// ============================================================
// Search Routes - Profile Search with Elasticsearch
// ============================================================

import { Router } from 'express';
import { query, param, body } from 'express-validator';
import rateLimit from 'express-rate-limit';
import { SearchController } from './search.controller';
import { authenticate, optionalAuth } from '../../shared/middleware/auth';
import { validate } from '../../shared/middleware/validate';
import { requireRole } from '../../shared/middleware/role-guard';
import { isAdminRole } from '../../shared/constants/roles';

const router = Router();
const controller = new SearchController();

const searchLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: {
    success: false,
    error: {
      code: 'SEARCH_LIMIT',
      message: 'Too many search requests. Please try again later.'
    }
  }
});

const publicSearchLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: {
    success: false,
    error: {
      code: 'SEARCH_LIMIT',
      message: 'Please complete a CAPTCHA to continue searching.'
    }
  }
});

const searchValidation = [
  query('gender').optional().isIn(['male', 'female', 'other']),
  query('age_min').optional().isInt({ min: 18, max: 70 }),
  query('age_max').optional().isInt({ min: 18, max: 70 }),
  query('community').optional().isString().trim(),
  query('religion').optional().isString().trim(),
  query('caste').optional().isString().trim(),
  query('mother_tongue').optional().isString().trim(),
  query('city_id').optional().isUUID(),
  query('state_id').optional().isUUID(),
  query('district_id').optional().isUUID(),
  query('country_id').optional().isUUID(),
  query('education').optional().isString().trim(),
  query('education_level').optional().isIn(['high_school', 'bachelors', 'masters', 'doctorate', 'post_doctorate']),
  query('occupation').optional().isString().trim(),
  query('occupation_category').optional().isString().trim(),
  query('income_min').optional().isInt({ min: 0 }),
  query('income_max').optional().isInt({ min: 0 }),
  query('height_min').optional().isInt({ min: 100, max: 250 }),
  query('height_max').optional().isInt({ min: 100, max: 250 }),
  query('manglik').optional().isIn(['yes', 'no', 'anupooshan', 'partial', 'anshik', 'dont_mind']),
  query('diet').optional().isIn(['veg', 'non_veg', 'occasional', 'vegan', 'jain']),
  query('marital_status').optional().isIn(['unmarried', 'widowed', 'divorced', 'separated']),
  query('family_type').optional().isIn(['joint', 'nuclear']),
  query('physical_status').optional().isIn(['normal', 'disabled']),
  query('kyc_verified').optional().isBoolean(),
  query('is_premium').optional().isBoolean(),
  query('page').optional().isInt({ min: 1 }).default(1),
  query('limit').optional().isInt({ min: 1, max: 100 }).default(20),
  query('sort').optional().isIn(['recently_joined', 'last_active', 'completion', 'relevance', 'age_asc', 'age_desc', 'income_asc', 'income_desc']).default('relevance'),
  query('keyword').optional().isString().trim().isLength({ min: 2, max: 100 }),
  query('name').optional().isString().trim().isLength({ min: 2, max: 50 })
];

router.get(
  '/profiles',
  optionalAuth,
  searchLimiter,
  publicSearchLimiter,
  searchValidation,
  validate,
  controller.searchProfiles.bind(controller)
);

router.get(
  '/quick',
  optionalAuth,
  searchLimiter,
  [
    query('gender').isIn(['male', 'female', 'other']).withMessage('Gender is required'),
    query('age_min').optional().isInt({ min: 18, max: 70 }),
    query('age_max').optional().isInt({ min: 18, max: 70 }),
    query('community').optional().isString().trim(),
    query('city').optional().isString().trim(),
    query('state').optional().isString().trim(),
    query('religion').optional().isString().trim(),
    query('page').optional().isInt({ min: 1 }).default(1),
    query('limit').optional().isInt({ min: 1, max: 20 }).default(20)
  ],
  validate,
  controller.quickSearch.bind(controller)
);

router.get(
  '/profile-id/:profileId',
  optionalAuth,
  [
    param('profileId').isUUID().withMessage('Invalid profile ID')
  ],
  validate,
  controller.getProfileById.bind(controller)
);

router.get(
  '/suggestions',
  searchLimiter,
  [
    query('q').isString().trim().isLength({ min: 2, max: 100 }).withMessage('Query must be 2-100 characters'),
    query('type').optional().isIn(['names', 'cities', 'occupations', 'educations', 'all']).default('all'),
    query('limit').optional().isInt({ min: 1, max: 20 }).default(10)
  ],
  validate,
  controller.getSuggestions.bind(controller)
);

router.get(
  '/by-city/:cityId',
  optionalAuth,
  searchLimiter,
  [
    param('cityId').isUUID().withMessage('Invalid city ID'),
    query('page').optional().isInt({ min: 1 }).default(1),
    query('limit').optional().isInt({ min: 1, max: 50 }).default(20)
  ],
  validate,
  controller.searchByCity.bind(controller)
);

router.get(
  '/by-occupation/:category',
  optionalAuth,
  searchLimiter,
  [
    param('category').isString().trim().isIn([
      'it_software', 'doctor', 'engineer', 'teacher', 'business',
      'banking', 'government', 'lawyer', 'accountant', 'manager',
      'architect', 'consultant', 'chef', 'pilot', 'police', 'other'
    ]).withMessage('Invalid occupation category'),
    query('page').optional().isInt({ min: 1 }).default(1),
    query('limit').optional().isInt({ min: 1, max: 50 }).default(20)
  ],
  validate,
  controller.searchByOccupation.bind(controller)
);

router.get(
  '/by-education/:level',
  optionalAuth,
  searchLimiter,
  [
    param('level').isIn(['high_school', 'bachelors', 'masters', 'doctorate', 'post_doctorate']).withMessage('Invalid education level'),
    query('page').optional().isInt({ min: 1 }).default(1),
    query('limit').optional().isInt({ min: 1, max: 50 }).default(20)
  ],
  validate,
  controller.searchByEducation.bind(controller)
);

router.get(
  '/recently-joined',
  optionalAuth,
  searchLimiter,
  [
    query('days').optional().isInt({ min: 1, max: 90 }).default(30),
    query('page').optional().isInt({ min: 1 }).default(1),
    query('limit').optional().isInt({ min: 1, max: 50 }).default(20)
  ],
  validate,
  controller.getRecentlyJoined.bind(controller)
);

router.get(
  '/premium-members',
  optionalAuth,
  searchLimiter,
  [
    query('page').optional().isInt({ min: 1 }).default(1),
    query('limit').optional().isInt({ min: 1, max: 50 }).default(20)
  ],
  validate,
  controller.getPremiumMembers.bind(controller)
);

router.get(
  '/featured',
  optionalAuth,
  searchLimiter,
  [
    query('page').optional().isInt({ min: 1 }).default(1),
    query('limit').optional().isInt({ min: 1, max: 20 }).default(10)
  ],
  validate,
  controller.getFeaturedProfiles.bind(controller)
);

router.get(
  '/saved-searches',
  authenticate,
  controller.getSavedSearches.bind(controller)
);

router.post(
  '/saved-searches',
  authenticate,
  [
    body('name').isString().trim().isLength({ min: 1, max: 100 }).withMessage('Name is required'),
    body('filters').isObject().withMessage('Filters are required'),
    body('notify_on_new').optional().isBoolean().default(false)
  ],
  validate,
  controller.saveSearch.bind(controller)
);

router.delete(
  '/saved-searches/:searchId',
  authenticate,
  [
    param('searchId').isUUID().withMessage('Invalid search ID')
  ],
  validate,
  controller.deleteSavedSearch.bind(controller)
);

router.get(
  '/match-percentage/:profileId',
  authenticate,
  [
    param('profileId').isUUID().withMessage('Invalid profile ID')
  ],
  validate,
  controller.getMatchPercentage.bind(controller)
);

router.post(
  '/export',
  authenticate,
  requireRole('centre_staff', 'centre_admin', 'super_admin'),
  [
    body('filters').optional().isObject(),
    body('format').optional().isIn(['csv', 'excel']).default('csv'),
    body('max_records').optional().isInt({ min: 1, max: 10000 }).default(1000)
  ],
  validate,
  controller.exportResults.bind(controller)
);

router.post(
  '/reindex',
  authenticate,
  requireRole('super_admin'),
  [
    body('full').optional().isBoolean().default(false)
  ],
  validate,
  controller.triggerReindex.bind(controller)
);

export const searchRouter = router;
