// ============================================================
// Renewal Reminder Cron Jobs
// ============================================================

import cron from 'node-cron';
import { db } from '../../config/database';
import logger, { log } from '../../config/logger';
import { EmailService } from '../../shared/services/email.service';
import { SmsService } from '../../shared/services/sms.service';
import { PaymentService } from '../payments/payment.service';

interface MembershipReminder {
  userId: string;
  email?: string;
  phone?: string;
  planName: string;
  endDate: Date;
  daysRemaining: number;
}

export class RenewalReminderService {
  private emailService: EmailService;
  private smsService: SmsService;
  private paymentService: PaymentService;

  constructor() {
    this.emailService = new EmailService();
    this.smsService = new SmsService();
    this.paymentService = new PaymentService();
  }

  async sendReminders(): Promise<void> {
    logger.info('Starting renewal reminder job');

    const reminderDays = [30, 7, 3, 1];

    for (const days of reminderDays) {
      await this.sendRemindersForDays(days);
    }

    logger.info('Renewal reminder job completed');
  }

  private async sendRemindersForDays(days: number): Promise<void> {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + days);
    const targetDateStr = targetDate.toISOString().split('T')[0];

    const memberships = await db('user_memberships')
      .join('users', 'user_memberships.user_id', 'users.id')
      .join('membership_plans', 'user_memberships.plan_id', 'membership_plans.id')
      .leftJoin('profiles', 'users.id', 'profiles.user_id')
      .where('user_memberships.status', 'active')
      .where('user_memberships.auto_renew', false)
      .whereRaw(`DATE(user_memberships.end_date) = ?`, [targetDateStr])
      .select(
        'users.id as user_id',
        'users.email',
        'users.phone',
        'profiles.first_name',
        'membership_plans.name as plan_name',
        'user_memberships.end_date'
      );

    logger.info(`Found ${memberships.length} memberships expiring in ${days} days`);

    for (const membership of memberships) {
      try {
        await this.sendReminder(membership, days);
      } catch (error) {
        logger.error('Failed to send renewal reminder', {
          userId: membership.user_id,
          days,
          error
        });
      }
    }
  }

  private async sendReminder(
    membership: {
      user_id: string;
      email?: string;
      phone?: string;
      first_name?: string;
      plan_name: string;
      end_date: Date;
    },
    daysRemaining: number
  ): Promise<void> {
    const userName = membership.first_name || 'Member';

    if (membership.email) {
      await this.sendEmailReminder(membership.email, {
        userName,
        planName: membership.plan_name,
        daysRemaining,
        endDate: new Date(membership.end_date)
      });
    }

    if (membership.phone) {
      await this.sendSmsReminder(membership.phone, {
        userName,
        planName: membership.plan_name,
        daysRemaining
      });
    }

    await db('activity_logs').insert({
      id: require('uuid').v4(),
      user_id: membership.user_id,
      action: 'renewal_reminder_sent',
      description: `Renewal reminder sent (${daysRemaining} days remaining)`,
      created_at: new Date()
    });

    logger.info('Renewal reminder sent', {
      userId: membership.user_id,
      daysRemaining
    });
  }

  private async sendEmailReminder(
    email: string,
    data: { userName: string; planName: string; daysRemaining: number; endDate: Date }
  ): Promise<void> {
    const subject = data.daysRemaining === 1
      ? 'Your M-Plus Matrimony membership expires tomorrow!'
      : `Your M-Plus Matrimony membership expires in ${data.daysRemaining} days`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #570013; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">M-Plus Matrimony</h1>
        </div>
        
        <div style="padding: 30px; background: #fff8ef;">
          <h2 style="color: #570013;">Hello ${data.userName},</h2>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            Your <strong>${data.planName}</strong> membership is expiring 
            ${data.daysRemaining === 1 ? '<strong>tomorrow</strong>' : `in <strong>${data.daysRemaining} days</strong>`}.
          </p>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            Expiry Date: <strong>${this.formatDate(data.endDate)}</strong>
          </p>
          
          <p style="color: #666; font-size: 14px;">
            Don't lose access to premium features like:
          </p>
          
          <ul style="color: #333; font-size: 14px;">
            <li>View contact details</li>
            <li>Video chat with matches</li>
            <li>Unlimited messaging</li>
            <li>Featured profile listing</li>
          </ul>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.APP_URL}/membership/renew" 
               style="background: #570013; color: white; padding: 15px 30px; 
                      text-decoration: none; border-radius: 5px; font-weight: bold;">
              Renew Now
            </a>
          </div>
          
          <p style="color: #666; font-size: 12px; text-align: center;">
            If you have any questions, contact us at support@mplus.example.com
          </p>
        </div>
      </div>
    `;

    try {
      await this.emailService.sendEmail({ to: email, subject, html });
    } catch (error) {
      logger.error('Failed to send email reminder', { email, error });
    }
  }

  private async sendSmsReminder(
    phone: string,
    data: { userName: string; planName: string; daysRemaining: number }
  ): Promise<void> {
    const message = data.daysRemaining === 1
      ? `Dear ${data.userName}, your M-Plus ${data.planName} membership expires tomorrow. Renew now to continue enjoying premium features. Visit: ${process.env.APP_URL}/membership/renew`
      : `Dear ${data.userName}, your M-Plus ${data.planName} membership expires in ${data.daysRemaining} days. Renew now: ${process.env.APP_URL}/membership/renew`;

    try {
      await this.smsService.sendSms(phone, message);
    } catch (error) {
      logger.error('Failed to send SMS reminder', { phone, error });
    }
  }

  private formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  }

  async processExpiredMemberships(): Promise<void> {
    logger.info('Starting expired memberships processing');

    const expiredMemberships = await db('user_memberships')
      .where('status', 'active')
      .where('end_date', '<', new Date());

    for (const membership of expiredMemberships) {
      await db.transaction(async (trx) => {
        await trx('user_memberships')
          .where('id', membership.id)
          .update({
            status: 'expired',
            updated_at: new Date()
          });

        await trx('users')
          .where('id', membership.user_id)
          .update({
            role: 'free_member',
            updated_at: new Date()
          });

        await trx('profiles')
          .where('user_id', membership.user_id)
          .update({
            is_premium: false,
            updated_at: new Date()
          });

        await trx('activity_logs').insert({
          id: require('uuid').v4(),
          user_id: membership.user_id,
          action: 'membership_expired',
          description: 'Membership expired automatically',
          created_at: new Date()
        });
      });

      logger.info('Membership expired', { userId: membership.user_id });
    }

    logger.info(`Processed ${expiredMemberships.length} expired memberships`);
  }

  startCronJobs(): void {
    cron.schedule('0 9 * * *', async () => {
      try {
        await this.sendReminders();
      } catch (error) {
        logger.error('Renewal reminder job failed', { error });
      }
    });

    cron.schedule('0 0 * * *', async () => {
      try {
        await this.processExpiredMemberships();
      } catch (error) {
        logger.error('Expired memberships processing failed', { error });
      }
    });

    cron.schedule('*/5 * * * *', async () => {
      try {
        await this.paymentService.expirePendingPayments();
      } catch (error) {
        logger.error('Pending payment expiry job failed', { error });
      }
    });

    logger.info('Membership cron jobs scheduled');
  }
}

export const renewalReminderService = new RenewalReminderService();
