// ============================================================
// Profile Routes
// ============================================================

import { Router } from 'express';
import { body, param, query } from 'express-validator';
import multer from 'multer';
import { ProfileController } from './profile.controller';
import { authenticate, optionalAuth, requireAuth } from '../../shared/middleware/auth';
import { validate } from '../../shared/middleware/validate';
import {
  createProfileVisibilityMiddleware
} from './profile-visibility';
import { fieldPermissions } from './profile-fields';
import { rateLimit } from 'express-rate-limit';

const router = Router();
const controller = new ProfileController();

const photoUploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    error: {
      code: 'PHOTO_UPLOAD_LIMIT',
      message: 'You have reached the photo upload limit. Please try again later.'
    }
  }
});

const profileVisibilityMiddleware = createProfileVisibilityMiddleware(fieldPermissions);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and WebP images are allowed'));
    }
  }
});

router.get(
  '/:userId',
  optionalAuth,
  param('userId').isUUID().withMessage('Invalid user ID'),
  validate,
  profileVisibilityMiddleware,
  controller.getProfile.bind(controller)
);

router.put(
  '/',
  authenticate,
  requireAuth,
  [
    body('firstName').optional().isString().trim().isLength({ min: 1, max: 100 }),
    body('lastName').optional().isString().trim().isLength({ min: 1, max: 100 }),
    body('middleName').optional().isString().trim().isLength({ max: 100 }),
    body('dateOfBirth').optional().isISO8601().toDate(),
    body('gender').optional().isIn(['male', 'female', 'other']),
    body('heightCm').optional().isInt({ min: 100, max: 250 }),
    body('weightKg').optional().isInt({ min: 30, max: 200 }),
    body('complexion').optional().isString().trim(),
    body('bodyType').optional().isString().trim(),
    body('physicalStatus').optional().isIn(['normal', 'disabled']),
    body('religion').optional().isString().trim(),
    body('caste').optional().isString().trim(),
    body('subCaste').optional().isString().trim(),
    body('motherTongue').optional().isString().trim(),
    body('gothra').optional().isString().trim(),
    body('highestEducation').optional().isString().trim(),
    body('educationDetails').optional().isString().trim(),
    body('occupation').optional().isString().trim(),
    body('occupationDetails').optional().isString().trim(),
    body('employedIn').optional().isIn(['private', 'government', 'business', 'self_employed', 'not_employed']),
    body('annualIncome').optional().isInt({ min: 0 }),
    body('workLocation').optional().isString().trim(),
    body('diet').optional().isIn(['veg', 'non_veg', 'occasional', 'vegan']),
    body('smoking').optional().isIn(['never', 'occasionally', 'regularly']),
    body('drinking').optional().isIn(['never', 'occasionally', 'regularly']),
    body('hobbies').optional().isArray(),
    body('aboutMe').optional().isString().trim().isLength({ max: 2000 }),
    body('expectations').optional().isString().trim().isLength({ max: 2000 }),
    body('maritalStatus').optional().isIn(['unmarried', 'widowed', 'divorced', 'separated']),
    body('preferredLanguage').optional().isIn(['en', 'hi', 'mr'])
  ],
  validate,
  controller.updateProfile.bind(controller)
);

router.post(
  '/photos',
  authenticate,
  requireAuth,
  photoUploadLimiter,
  upload.single('photo'),
  [
    body('displayOrder').optional().isInt({ min: 0, max: 9 }),
    body('isPrimary').optional().isBoolean(),
    body('visibility').optional().isIn(['all', 'contacts', 'hidden'])
  ],
  validate,
  controller.uploadPhoto.bind(controller)
);

router.put(
  '/photos/:photoId',
  authenticate,
  requireAuth,
  [
    param('photoId').isUUID().withMessage('Invalid photo ID'),
    body('displayOrder').optional().isInt({ min: 0, max: 9 }),
    body('isPrimary').optional().isBoolean(),
    body('visibility').optional().isIn(['all', 'contacts', 'hidden'])
  ],
  validate,
  controller.updatePhoto.bind(controller)
);

router.delete(
  '/photos/:photoId',
  authenticate,
  requireAuth,
  param('photoId').isUUID().withMessage('Invalid photo ID'),
  validate,
  controller.deletePhoto.bind(controller)
);

router.put(
  '/partner-preference',
  authenticate,
  requireAuth,
  [
    body('minAge').optional().isInt({ min: 18, max: 70 }),
    body('maxAge').optional().isInt({ min: 18, max: 70 }),
    body('minHeightCm').optional().isInt({ min: 100, max: 220 }),
    body('maxHeightCm').optional().isInt({ min: 100, max: 220 }),
    body('religions').optional().isArray().custom((value) => {
      if (value && Array.isArray(value)) {
        if (value.length > 20) throw new Error('Maximum 20 religions allowed');
        value.forEach((item, i) => {
          if (typeof item !== 'string' || item.length > 50) {
            throw new Error(`Invalid religion at index ${i}`);
          }
        });
      }
      return true;
    }),
    body('castes').optional().isArray().custom((value) => {
      if (value && Array.isArray(value)) {
        if (value.length > 50) throw new Error('Maximum 50 castes allowed');
        value.forEach((item, i) => {
          if (typeof item !== 'string' || item.length > 100) {
            throw new Error(`Invalid caste at index ${i}`);
          }
        });
      }
      return true;
    }),
    body('motherTongues').optional().isArray().custom((value) => {
      if (value && Array.isArray(value)) {
        if (value.length > 10) throw new Error('Maximum 10 mother tongues allowed');
        value.forEach((item, i) => {
          if (typeof item !== 'string' || item.length > 50) {
            throw new Error(`Invalid mother tongue at index ${i}`);
          }
        });
      }
      return true;
    }),
    body('educations').optional().isArray().custom((value) => {
      if (value && Array.isArray(value)) {
        if (value.length > 20) throw new Error('Maximum 20 educations allowed');
        value.forEach((item, i) => {
          if (typeof item !== 'string' || item.length > 150) {
            throw new Error(`Invalid education at index ${i}`);
          }
        });
      }
      return true;
    }),
    body('occupations').optional().isArray().custom((value) => {
      if (value && Array.isArray(value)) {
        if (value.length > 20) throw new Error('Maximum 20 occupations allowed');
        value.forEach((item, i) => {
          if (typeof item !== 'string' || item.length > 100) {
            throw new Error(`Invalid occupation at index ${i}`);
          }
        });
      }
      return true;
    }),
    body('minIncome').optional().isInt({ min: 0 }),
    body('maxIncome').optional().isInt({ min: 0 }),
    body('diet').optional().isArray().custom((value) => {
      if (value && Array.isArray(value)) {
        const validDiets = ['veg', 'non_veg', 'occasional', 'vegan', 'jain', 'pescatarian'];
        value.forEach((item) => {
          if (!validDiets.includes(item)) {
            throw new Error(`Invalid diet: ${item}`);
          }
        });
      }
      return true;
    }),
    body('maritalStatus').optional().isArray().custom((value) => {
      if (value && Array.isArray(value)) {
        const validStatuses = ['unmarried', 'widowed', 'divorced', 'separated'];
        value.forEach((item) => {
          if (!validStatuses.includes(item)) {
            throw new Error(`Invalid marital status: ${item}`);
          }
        });
      }
      return true;
    }),
    body('countries').optional().isArray().custom((value) => {
      if (value && Array.isArray(value)) {
        if (value.length > 20) throw new Error('Maximum 20 countries allowed');
        value.forEach((item, i) => {
          if (typeof item !== 'string' || item.length > 100) {
            throw new Error(`Invalid country at index ${i}`);
          }
        });
      }
      return true;
    }),
    body('states').optional().isArray(),
    body('cities').optional().isArray()
  ],
  validate,
  controller.updatePartnerPreference.bind(controller)
);

router.get(
  '/:userId/family',
  optionalAuth,
  param('userId').isUUID().withMessage('Invalid user ID'),
  validate,
  profileVisibilityMiddleware,
  controller.getFamilyInfo.bind(controller)
);

router.put(
  '/family',
  authenticate,
  requireAuth,
  [
    body('familyType').optional().isIn(['joint', 'nuclear']),
    body('familyStatus').optional().isString().trim(),
    body('familyValues').optional().isString().trim(),
    body('fatherName').optional().isString().trim().isLength({ max: 150 }),
    body('fatherOccupation').optional().isString().trim(),
    body('fatherStatus').optional().isIn(['alive', 'passed_away']),
    body('motherName').optional().isString().trim().isLength({ max: 150 }),
    body('motherOccupation').optional().isString().trim(),
    body('motherStatus').optional().isIn(['alive', 'passed_away']),
    body('brothersCount').optional().isInt({ min: 0, max: 20 }),
    body('sistersCount').optional().isInt({ min: 0, max: 20 }),
    body('brothersMarried').optional().isInt({ min: 0 }),
    body('sistersMarried').optional().isInt({ min: 0 }),
    body('familyLocation').optional().isString().trim(),
    body('familyCity').optional().isString().trim(),
    body('familyState').optional().isString().trim(),
    body('aboutFamily').optional().isString().trim().isLength({ max: 2000 })
  ],
  validate,
  controller.updateFamilyInfo.bind(controller)
);

router.get(
  '/:userId/horoscope',
  optionalAuth,
  param('userId').isUUID().withMessage('Invalid user ID'),
  validate,
  profileVisibilityMiddleware,
  controller.getHoroscope.bind(controller)
);

router.put(
  '/horoscope',
  authenticate,
  requireAuth,
  [
    body('rashi').optional().isString().trim(),
    body('nakshatra').optional().isString().trim(),
    body('nakshatraPada').optional().isInt({ min: 1, max: 4 }),
    body('gotra').optional().isString().trim(),
    body('gothra').optional().isString().trim(),
    body('manglik').optional().isIn(['yes', 'no', 'anupooshan', 'partial', 'anshik']),
    body('birthDate').optional().isISO8601().toDate(),
    body('birthTime').optional().matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
    body('birthPlace').optional().isString().trim()
  ],
  validate,
  controller.updateHoroscope.bind(controller)
);

router.get(
  '/me/completion',
  authenticate,
  requireAuth,
  controller.getProfileCompletion.bind(controller)
);

router.get(
  '/share-link',
  authenticate,
  requireAuth,
  controller.generateShareLink.bind(controller)
);

router.post(
  '/share',
  authenticate,
  requireAuth,
  [
    body('platform').isIn(['whatsapp', 'facebook', 'twitter', 'copy']).withMessage('Invalid platform'),
    body('recipientPhone').optional().isString().trim()
  ],
  validate,
  controller.shareProfile.bind(controller)
);

export const profilesRouter = router;
