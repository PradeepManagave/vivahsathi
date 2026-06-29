import { Router } from 'express';
import { authenticate } from '../../shared/middleware/auth';
import { asyncHandler } from '../../shared/middleware/error-handler';
import { webhookController } from './webhook.controller';

const router = Router();

router.get('/events', authenticate, asyncHandler(webhookController.listEvents.bind(webhookController)));

export const webhookRouter = router;
