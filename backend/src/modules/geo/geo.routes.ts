// ============================================================
// Geo Routes - Hierarchical Location Data
// ============================================================

import { Router } from 'express';
import { query, param, body } from 'express-validator';
import { GeoController } from './geo.controller';
import { authenticate, optionalAuth } from '../../shared/middleware/auth';
import { validate } from '../../shared/middleware/validate';
import { rateLimit } from 'express-rate-limit';

const router = Router();
const controller = new GeoController();

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

router.get(
  '/countries',
  optionalAuth,
  controller.getCountries.bind(controller)
);

router.get(
  '/states/:countryId',
  param('countryId').isUUID().withMessage('Invalid country ID'),
  validate,
  controller.getStates.bind(controller)
);

router.get(
  '/districts/:stateId',
  param('stateId').isUUID().withMessage('Invalid state ID'),
  validate,
  controller.getDistricts.bind(controller)
);

router.get(
  '/talukas/:districtId',
  param('districtId').isUUID().withMessage('Invalid district ID'),
  validate,
  controller.getTalukas.bind(controller)
);

router.get(
  '/villages',
  searchLimiter,
  [
    query('search').optional().isString().trim().isLength({ min: 2, max: 100 }),
    query('talukaId').optional().isUUID().withMessage('Invalid taluka ID'),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 })
  ],
  validate,
  controller.getVillages.bind(controller)
);

router.post(
  '/villages/request',
  authenticate,
  [
    body('name').isString().trim().isLength({ min: 2, max: 200 }).withMessage('Village name is required'),
    body('talukaId').isUUID().withMessage('Taluka ID is required'),
    body('pincode').optional().isString().trim().matches(/^\d{6}$/).withMessage('Invalid pincode format'),
    body('description').optional().isString().trim().isLength({ max: 500 })
  ],
  validate,
  controller.requestVillage.bind(controller)
);

router.get(
  '/search',
  searchLimiter,
  [
    query('q').isString().trim().isLength({ min: 2, max: 100 }).withMessage('Search query is required'),
    query('level').optional().isIn(['country', 'state', 'district', 'taluka', 'village'])
  ],
  validate,
  controller.searchLocations.bind(controller)
);

router.get(
  '/hierarchy/:locationType/:id',
  [
    param('locationType').isIn(['country', 'state', 'district', 'taluka', 'village']),
    param('id').isUUID().withMessage('Invalid location ID')
  ],
  validate,
  controller.getHierarchy.bind(controller)
);

router.get(
  '/pincode/:pincode',
  param('pincode').matches(/^\d{6}$/).withMessage('Invalid pincode format'),
  validate,
  controller.getLocationByPincode.bind(controller)
);

export const geoRouter = router;
