import { config } from '../../config/index';
import logger from '../../config/logger';

interface PushPayload {
  title: string;
  body: string;
  data?: Record<string, any>;
  image?: string;
}

export class PushService {
  private static initialized = false;

  static async initialize() {
    try {
      const admin = await import('firebase-admin');
      if (!admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.applicationDefault(),
          projectId: process.env.FIREBASE_PROJECT_ID,
        });
      }
      this.initialized = true;
      logger.info('Firebase Admin initialized');
    } catch (err) {
      logger.warn('Firebase Admin not configured. Push notifications disabled.');
    }
  }

  static async sendToDevice(token: string, payload: PushPayload) {
    if (!this.initialized) return;
    try {
      const admin = await import('firebase-admin');
      await admin.messaging().send({
        token,
          notification: { title: payload.title, body: payload.body },
          data: payload.data as { [key: string]: string },
        android: { priority: 'high', notification: { channelId: 'default', sound: 'default' } },
        apns: { payload: { aps: { sound: 'default', badge: 1 } } },
      });
    } catch (err: any) {
      if (err?.code === 'messaging/registration-token-not-registered') {
        throw err;
      }
      logger.error('Push send failed:', err);
    }
  }

  static async sendToMultiple(tokens: string[], payload: PushPayload) {
    if (!this.initialized || tokens.length === 0) return;
    try {
      const admin = await import('firebase-admin');
      const batch = admin.messaging().sendEach(
        tokens.map(token => ({
          token,
        notification: { title: payload.title, body: payload.body },
          data: payload.data as { [key: string]: string },
        }))
      );
      const result = await batch;
      const failedCount = result.responses.filter(r => !r.success).length;
      if (failedCount > 0) logger.warn(`${failedCount}/${tokens.length} push notifications failed`);
    } catch (err) {
      logger.error('Batch push send failed:', err);
    }
  }

  static async sendToTopic(topic: string, payload: PushPayload) {
    if (!this.initialized) return;
    try {
      const admin = await import('firebase-admin');
      await admin.messaging().send({
        topic,
        notification: { title: payload.title, body: payload.body },
        data: payload.data as { [key: string]: string },
      });
    } catch (err) {
      logger.error('Topic push failed:', err);
    }
  }
}
