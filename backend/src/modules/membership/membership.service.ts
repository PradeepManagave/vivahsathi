// ============================================================
// Membership Service
// ============================================================

import { db } from '../../config/database';
import { cache } from '../../config/redis';
import { log } from '../../config/logger';
import { config } from '../../config/index';
import { NotFoundError, ValidationError, UpgradeRequiredError } from '../../shared/utils/errors';
import { v4 as uuidv4 } from 'uuid';
import { PaymentService } from '../payments/payment.service';

interface MembershipPlan {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  discountedPrice?: number;
  currency: string;
  durationDays: number;
  maxContactsPerDay?: number;
  maxPhotos: number;
  canViewContacts: boolean;
  canVideoChat: boolean;
  canAddSocialLinks: boolean;
  isAdFree: boolean;
  isFeatured: boolean;
  isActive: boolean;
  benefits: string[];
}

interface UserMembership {
  id: string;
  userId: string;
  planId: string;
  plan: MembershipPlan;
  status: string;
  startDate: Date;
  endDate: Date;
  autoRenew: boolean;
  contactsViewed: number;
  contactsViewedToday: number;
  messagesSent: number;
}

interface UsageStats {
  contactsViewedToday: number;
  contactsViewedTotal: number;
  contactsLimit: number;
  messagesSent: number;
  messagesLimit: number;
  daysRemaining: number;
  isActive: boolean;
  plan: MembershipPlan | null;
}

export class MembershipService {
  private paymentService: PaymentService;

  constructor() {
    this.paymentService = new PaymentService();
  }

  async getPlans(userId?: string): Promise<MembershipPlan[]> {
    const plans = await db('membership_plans')
      .where('is_active', true)
      .orderBy('display_order')
      .orderBy('price');

    return plans.map(plan => ({
      id: plan.id,
      name: plan.name,
      slug: plan.slug,
      description: plan.description,
      price: parseFloat(plan.price),
      discountedPrice: plan.discounted_price ? parseFloat(plan.discounted_price) : undefined,
      currency: plan.currency,
      durationDays: plan.duration_days,
      maxContactsPerDay: plan.max_contacts_per_day,
      maxPhotos: plan.max_photos,
      canViewContacts: plan.can_view_contacts,
      canVideoChat: plan.can_video_chat,
      canAddSocialLinks: plan.can_add_social_links,
      isAdFree: plan.is_ad_free,
      isFeatured: plan.is_featured,
      isActive: plan.is_active,
      benefits: plan.benefits || []
    }));
  }

  async getPlanById(planId: string): Promise<MembershipPlan> {
    const plan = await db('membership_plans')
      .where('id', planId)
      .first();

    if (!plan) {
      throw new NotFoundError('Membership plan');
    }

    return {
      id: plan.id,
      name: plan.name,
      slug: plan.slug,
      description: plan.description,
      price: parseFloat(plan.price),
      discountedPrice: plan.discounted_price ? parseFloat(plan.discounted_price) : undefined,
      currency: plan.currency,
      durationDays: plan.duration_days,
      maxContactsPerDay: plan.max_contacts_per_day,
      maxPhotos: plan.max_photos,
      canViewContacts: plan.can_view_contacts,
      canVideoChat: plan.can_video_chat,
      canAddSocialLinks: plan.can_add_social_links,
      isAdFree: plan.is_ad_free,
      isFeatured: plan.is_featured,
      isActive: plan.is_active,
      benefits: plan.benefits || []
    };
  }

  async getMyMembership(userId: string): Promise<UserMembership | null> {
    const membership = await db('user_memberships')
      .join('membership_plans', 'user_memberships.plan_id', 'membership_plans.id')
      .where('user_memberships.user_id', userId)
      .where('user_memberships.status', 'active')
      .where('user_memberships.end_date', '>', new Date())
      .orderBy('user_memberships.created_at', 'desc')
      .select(
        'user_memberships.*',
        'membership_plans.name as plan_name',
        'membership_plans.slug as plan_slug',
        'membership_plans.max_contacts_per_day',
        'membership_plans.can_view_contacts',
        'membership_plans.can_video_chat',
        'membership_plans.can_add_social_links'
      )
      .first();

    if (!membership) {
      return null;
    }

    const todayContacts = await this.getContactsViewedToday(userId);

    return {
      id: membership.id,
      userId: membership.user_id,
      planId: membership.plan_id,
      plan: {
        id: membership.plan_id,
        name: membership.plan_name,
        slug: membership.plan_slug,
        description: '',
        price: 0,
        currency: 'INR',
        durationDays: 0,
        maxContactsPerDay: membership.max_contacts_per_day,
        maxPhotos: 5,
        canViewContacts: membership.can_view_contacts,
        canVideoChat: membership.can_video_chat,
        canAddSocialLinks: membership.can_add_social_links,
        isAdFree: false,
        isFeatured: false,
        isActive: true,
        benefits: []
      },
      status: membership.status,
      startDate: membership.start_date,
      endDate: membership.end_date,
      autoRenew: membership.auto_renew,
      contactsViewed: membership.contacts_viewed,
      contactsViewedToday: todayContacts,
      messagesSent: membership.messages_sent
    };
  }

  async getMyUsage(userId: string): Promise<UsageStats> {
    const membership = await this.getMyMembership(userId);

    if (!membership) {
      return {
        contactsViewedToday: 0,
        contactsViewedTotal: 0,
        contactsLimit: 0,
        messagesSent: 0,
        messagesLimit: Infinity,
        daysRemaining: 0,
        isActive: false,
        plan: null
      };
    }

    const todayContacts = await this.getContactsViewedToday(userId);
    const daysRemaining = Math.ceil(
      (new Date(membership.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );

    return {
      contactsViewedToday: todayContacts,
      contactsViewedTotal: membership.contactsViewed,
      contactsLimit: membership.plan.maxContactsPerDay || Infinity,
      messagesSent: membership.messagesSent,
      messagesLimit: Infinity,
      daysRemaining: Math.max(0, daysRemaining),
      isActive: true,
      plan: membership.plan
    };
  }

  async getMyHistory(userId: string): Promise<UserMembership[]> {
    const memberships = await db('user_memberships')
      .join('membership_plans', 'user_memberships.plan_id', 'membership_plans.id')
      .where('user_memberships.user_id', userId)
      .orderBy('user_memberships.created_at', 'desc')
      .select(
        'user_memberships.*',
        'membership_plans.name as plan_name',
        'membership_plans.slug as plan_slug'
      );

    return memberships.map(m => ({
      id: m.id,
      userId: m.user_id,
      planId: m.plan_id,
      plan: {
        id: m.plan_id,
        name: m.plan_name,
        slug: m.plan_slug,
        description: '',
        price: 0,
        currency: 'INR',
        durationDays: 0,
        maxContactsPerDay: m.max_contacts_per_day,
        maxPhotos: 5,
        canViewContacts: m.can_view_contacts,
        canVideoChat: m.can_video_chat,
        canAddSocialLinks: m.can_add_social_links,
        isAdFree: false,
        isFeatured: false,
        isActive: true,
        benefits: []
      },
      status: m.status,
      startDate: m.start_date,
      endDate: m.end_date,
      autoRenew: m.auto_renew,
      contactsViewed: m.contacts_viewed,
      contactsViewedToday: 0,
      messagesSent: m.messages_sent
    }));
  }

  async upgradePlan(
    userId: string,
    planId: string,
    paymentMethod: string
  ): Promise<{ orderId: string; amount: number; currency: string }> {
    const plan = await this.getPlanById(planId);

    if (paymentMethod === 'razorpay') {
      const order = await this.paymentService.createOrder(userId, planId);

      return {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency
      };
    }

    throw new ValidationError('Invalid payment method');
  }

  async cancelMembership(userId: string, reason?: string): Promise<void> {
    await db('user_memberships')
      .where('user_id', userId)
      .where('status', 'active')
      .update({
        auto_renew: false,
        status: 'cancelled',
        updated_at: new Date()
      });

    log.membership.cancelled(userId, reason);

    await db('activity_logs').insert({
      id: uuidv4(),
      user_id: userId,
      action: 'membership_cancelled',
      description: `Membership cancelled. Reason: ${reason || 'Not provided'}`,
      created_at: new Date()
    });
  }

  async renewMembership(
    userId: string,
    planId: string
  ): Promise<{ orderId: string; amount: number; currency: string }> {
    return this.upgradePlan(userId, planId, 'razorpay');
  }

  async getPrepaidPacks(): Promise<Array<{
    id: string;
    name: string;
    description: string;
    price: number;
    contacts: number;
    validityDays: number;
    benefits: string[];
  }>> {
    return await db('prepaid_packs')
      .where('is_active', true)
      .orderBy('price')
      .select('id', 'name', 'description', 'price', 'contacts', 'validity_days', 'benefits');
  }

  async activateMembership(
    userId: string,
    planId: string,
    paymentId: string,
    startDate: Date,
    options: { isTrial?: boolean; autoRenew?: boolean } = {}
  ): Promise<void> {
    const plan = await this.getPlanById(planId);

    const endDate = new Date(startDate.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);

    await db.transaction(async (trx) => {
      await trx('user_memberships')
        .where('user_id', userId)
        .where('status', 'active')
        .update({
          status: 'expired',
          auto_renew: false,
          updated_at: new Date()
        });

      await trx('user_memberships').insert({
        id: uuidv4(),
        user_id: userId,
        plan_id: planId,
        status: 'active',
        start_date: startDate,
        end_date: endDate,
        auto_renew: options.autoRenew || false,
        contacts_viewed: 0,
        contacts_viewed_today: 0,
        contacts_viewed_at: new Date(),
        messages_sent: 0,
        payment_id: paymentId,
        created_at: new Date(),
        updated_at: new Date()
      });

      await trx('users')
        .where('id', userId)
        .update({
          role: plan.slug === 'free' ? 'free_member' : 'paid_member',
          updated_at: new Date()
        });

      await trx('profiles')
        .join('users', 'profiles.user_id', 'users.id')
        .where('users.id', userId)
        .update({
          is_premium: plan.slug !== 'free',
          updated_at: new Date()
        });
    });

    log.membership.activated(userId, plan.slug);
  }

  async checkContactAccess(userId: string): Promise<{ allowed: boolean; reason?: string }> {
    const membership = await this.getMyMembership(userId);

    if (!membership) {
      return { allowed: false, reason: 'No active membership' };
    }

    if (!membership.plan.canViewContacts) {
      return { allowed: false, reason: 'Contact viewing not included in your plan' };
    }

    const todayContacts = await this.getContactsViewedToday(userId);
    const dailyLimit = membership.plan.maxContactsPerDay || Infinity;

    if (todayContacts >= dailyLimit) {
      return { allowed: false, reason: `Daily contact limit reached (${dailyLimit}/${dailyLimit})` };
    }

    return { allowed: true };
  }

  async incrementContactView(userId: string): Promise<number> {
    const today = new Date().toISOString().split('T')[0];
    const key = `contacts:${userId}:${today}`;

    const count = await cache.incrWithExpiry(key, 86400);

    await db('user_memberships')
      .where('user_id', userId)
      .where('status', 'active')
      .increment('contacts_viewed', 1);

    await db('user_memberships')
      .where('user_id', userId)
      .where('contacts_viewed_at', '<', today)
      .update({
        contacts_viewed_today: 0,
        contacts_viewed_at: new Date()
      });

    return count;
  }

  async checkVideoChatAccess(userId: string): Promise<{ allowed: boolean; reason?: string }> {
    const membership = await this.getMyMembership(userId);

    if (!membership) {
      return { allowed: false, reason: 'Premium membership required for video chat' };
    }

    if (!membership.plan.canVideoChat) {
      return { allowed: false, reason: 'Video chat not included in your plan' };
    }

    return { allowed: true };
  }

  private async getContactsViewedToday(userId: string): Promise<number> {
    const today = new Date().toISOString().split('T')[0];
    const key = `contacts:${userId}:${today}`;

    const count = await cache.get<number>(key);
    return count || 0;
  }
}

export const membershipService = new MembershipService();
