import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../../shared/middleware/validate';
import { authenticate } from '../../shared/middleware/auth';
import { requireRole } from '../../shared/middleware/role-guard';
import { uploadSingle } from '../../shared/middleware/upload';
import { asyncHandler } from '../../shared/middleware/error-handler';
import { documentsController } from './documents.controller';

const router = Router();

router.use(authenticate);

router.post('/upload', uploadSingle('file'), [
  body('documentType').notEmpty().withMessage('Document type is required'),
  validate,
], asyncHandler(documentsController.upload.bind(documentsController)));

router.get('/my', asyncHandler(documentsController.listMyDocuments.bind(documentsController)));
router.get('/all', requireRole('super_admin', 'centre_admin'), asyncHandler(documentsController.listAll.bind(documentsController)));
router.get('/:id', asyncHandler(documentsController.getDocument.bind(documentsController)));
router.delete('/:id', asyncHandler(documentsController.deleteDocument.bind(documentsController)));
router.put('/:id/approve', requireRole('super_admin', 'centre_admin'), asyncHandler(documentsController.approve.bind(documentsController)));
router.put('/:id/reject', requireRole('super_admin', 'centre_admin'), [
  body('reason').notEmpty().withMessage('Rejection reason is required'),
  validate,
], asyncHandler(documentsController.reject.bind(documentsController)));

export const documentsRouter = router;
