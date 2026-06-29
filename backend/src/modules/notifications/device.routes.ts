import { Router, Request, Response } from 'express';
import { body } from 'express-validator';
import { db } from '../../config/database';
import { authenticate } from '../../shared/middleware/auth';
import { validate } from '../../shared/middleware/validate';
import { success, created } from '../../shared/utils/response';
import { AppError } from '../../shared/utils/errors';

const router = Router();

const registerDeviceValidation = [
  body('deviceId').isString().trim().notEmpty().withMessage('Device ID is required'),
  body('fcmToken').isString().trim().notEmpty().withMessage('FCM token is required'),
  body('deviceType').isIn(['ios', 'android', 'web']).withMessage('Valid device type is required'),
  body('deviceName').optional().isString().trim().isLength({ max: 100 }),
  body('appVersion').optional().isString().trim().isLength({ max: 20 }),
  body('osVersion').optional().isString().trim().isLength({ max: 50 })
];

router.post(
  '/register',
  authenticate,
  registerDeviceValidation,
  validate,
  async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { deviceId, fcmToken, deviceType, deviceName, appVersion, osVersion } = req.body;

    const [device] = await db('user_devices')
      .insert({
        user_id: userId,
        device_id: deviceId,
        fcm_token: fcmToken,
        device_type: deviceType,
        device_name: deviceName,
        app_version: appVersion,
        os_version: osVersion
      })
      .onConflict(['user_id', 'device_id'])
      .merge({
        fcm_token: fcmToken,
        device_name: deviceName,
        app_version: appVersion,
        os_version: osVersion,
        is_active: true,
        last_active_at: db.fn.now()
      })
      .returning('*');

    created(res, device, 'Device registered');
  }
);

router.post(
  '/unregister',
  authenticate,
  [
    body('deviceId').isString().trim().notEmpty().withMessage('Device ID is required')
  ],
  validate,
  async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { deviceId } = req.body;

    await db('user_devices')
      .where('user_id', userId)
      .where('device_id', deviceId)
      .update({ is_active: false });

    success(res, null, 'Device unregistered');
  }
);

router.get(
  '/',
  authenticate,
  async (req: Request, res: Response) => {
    const userId = req.user!.id;

    const devices = await db('user_devices')
      .where('user_id', userId)
      .where('is_active', true)
      .select('id', 'device_id', 'device_type', 'device_name', 'app_version', 'os_version', 'last_active_at');

    success(res, devices);
  }
);

export const deviceRouter = router;
