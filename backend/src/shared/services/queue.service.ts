import { Queue, Worker, Job } from 'bullmq';
import { config } from '../../config/index';
import { db } from '../../config/database';
import logger from '../../config/logger';
import { EmailService } from './email.service';
import { SmsService } from './sms.service';

const connection = {
  host: config.REDIS_HOST,
  port: config.REDIS_PORT,
  password: config.REDIS_PASSWORD,
  db: config.REDIS_DB,
};

const defaultJobOptions = {
  attempts: 3,
  backoff: { type: 'exponential', delay: 2000 },
  removeOnComplete: { age: 3600 },
  removeOnFail: { age: 86400 },
};

export const emailQueue = new Queue('email', { connection, defaultJobOptions });
export const smsQueue = new Queue('sms', { connection, defaultJobOptions });
export const notificationQueue = new Queue('notification', { connection, defaultJobOptions });
export const membershipQueue = new Queue('membership', { connection, defaultJobOptions });
export const analyticsQueue = new Queue('analytics', { connection, defaultJobOptions });

const emailService = new EmailService();
const smsService = new SmsService();

async function sendEmail(job: Job) {
  const { to, subject, html } = job.data;
  await emailService.sendEmail({ to, subject, html });
}

async function sendSms(job: Job) {
  const { to, message } = job.data;
  await smsService.sendSms(to, message);
}

async function sendPush(job: Job) {
  const { userId, title, body, data } = job.data;
  const devices = await db('user_devices').where({ userId, isActive: true });
  for (const device of devices) {
    try {
      await import('./push.service').then(m => m.PushService.sendToDevice(device.fcmToken, { title, body, data }));
    } catch (err: any) {
      if (err?.code === 'messaging/registration-token-not-registered') {
        await db('user_devices').where({ id: device.id }).update({ isActive: false });
      }
    }
  }
}

async function processMembershipExpiry(job: Job) {
  const now = new Date();
  const expiring = await db('memberships')
    .where('expiryDate', '<=', new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000))
    .andWhere('expiryDate', '>', now)
    .andWhere('status', 'active');

  for (const m of expiring) {
    const daysLeft = Math.ceil((new Date(m.expiryDate).getTime() - now.getTime()) / 86400000);
    await db('notifications').insert({
      id: require('uuid').v4(),
      userId: m.userId,
      type: 'membership_expiring',
      title: 'Membership Expiring Soon',
      body: `Your membership expires in ${daysLeft} day${daysLeft > 1 ? 's' : ''}. Renew now to continue enjoying premium features.`,
      data: JSON.stringify({ membershipId: m.id, daysLeft }),
      createdAt: db.fn.now(),
    });
  }
  logger.info(`Processed ${expiring.length} membership expiry notifications`);
}

async function processAnalytics(job: Job) {
  const { type, date } = job.data;
  if (type === 'daily') {
    const today = date || new Date().toISOString().split('T')[0];
    const stats = await db('users')
      .select(db.raw('DATE(createdAt) as date'), db.raw('COUNT(*) as registrations'), db.raw("SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active"))
      .whereRaw('DATE(createdAt) = ?', [today])
      .groupByRaw('DATE(createdAt)')
      .first();

    if (stats) {
      await db('analytics_daily').insert({ ...stats, date: today, createdAt: db.fn.now() });
    }
  }
}

const emailWorker = new Worker('email', sendEmail, { connection, concurrency: 5 });
const smsWorker = new Worker('sms', sendSms, { connection, concurrency: 5 });
const notificationWorker = new Worker('notification', sendPush, { connection, concurrency: 3 });
const membershipWorker = new Worker('membership', processMembershipExpiry, { connection, concurrency: 1 });
const analyticsWorker = new Worker('analytics', processAnalytics, { connection, concurrency: 1 });

export function initQueueWorkers() {
  logger.info('BullMQ workers initialized');
  [emailWorker, smsWorker, notificationWorker, membershipWorker, analyticsWorker].forEach(w => {
    w.on('completed', (job) => logger.debug(`Job ${job?.id} completed: ${job?.name}`));
    w.on('failed', (job, err) => logger.error(`Job ${job?.id} failed: ${err.message}`));
  });
}

export async function enqueueEmail(to: string, subject: string, html: string) {
  return emailQueue.add('send-email', { to, subject, html });
}

export async function enqueueSms(to: string, message: string) {
  return smsQueue.add('send-sms', { to, message });
}

export async function enqueuePush(userId: string, title: string, body: string, data?: Record<string, any>) {
  return notificationQueue.add('send-push', { userId, title, body, data });
}

export async function enqueueMembershipCheck() {
  return membershipQueue.add('check-expiry', {}, { repeat: { pattern: '0 6 * * *' } });
}

export async function enqueueAnalytics(type: 'daily', date?: string) {
  return analyticsQueue.add('process-analytics', { type, date });
}
