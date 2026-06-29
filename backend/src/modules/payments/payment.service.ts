// ============================================================
// Payment Service - Razorpay Integration
// ============================================================

import crypto from 'crypto';
import { db } from '../../config/database';
import logger, { log } from '../../config/logger';
import { config } from '../../config/index';
import { NotFoundError, ValidationError } from '../../shared/utils/errors';
import { v4 as uuidv4 } from 'uuid';
import { MembershipService } from '../membership/membership.service';
import { InvoiceService } from './invoice.service';
import { EmailService } from '../../shared/services/email.service';

interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  status: string;
  receipts?: string;
}

interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  maxUses: number;
  uses: number;
  minAmount: number;
  expiresAt: Date;
}

interface PrepaidPack {
  id: string;
  name: string;
  contacts: number;
  price: number;
  validityDays: number;
}

export class PaymentService {
  private membershipService: MembershipService;
  private invoiceService: InvoiceService;
  private emailService: EmailService;
  private razorpay: RazorpayInstance | null = null;

  constructor() {
    this.membershipService = new MembershipService();
    this.invoiceService = new InvoiceService();
    this.emailService = new EmailService();
    this.initRazorpay();
  }

  private initRazorpay(): void {
    if (config.RAZORPAY_KEY_ID && config.RAZORPAY_KEY_SECRET) {
      import('razorpay').then(({ default: Razorpay }) => {
        this.razorpay = new Razorpay({
          key_id: config.RAZORPAY_KEY_ID!,
          key_secret: config.RAZORPAY_KEY_SECRET!
        }) as unknown as RazorpayInstance;
      });
    }
  }

  async createOrder(
    userId: string,
    planId: string,
    couponCode?: string
  ): Promise<{ id: string; amount: number; currency: string }> {
    const plan = await this.membershipService.getPlanById(planId);

    let amount = plan.discountedPrice || plan.price;

    if (couponCode) {
      const discount = await this.applyCoupon(couponCode, amount);
      amount = amount - discount;
    }

    const GST_RATE = config.GST_RATE || 0.18;
    const gstAmount = Math.round(amount * GST_RATE * 100) / 100;
    const totalAmount = Math.round((amount + gstAmount) * 100);

    const user = await db('users').where('id', userId).first();
    if (!user) {
      throw new NotFoundError('User');
    }

    const paymentRecord = await db('payments').insert({
      id: uuidv4(),
      user_id: userId,
      plan_id: planId,
      amount: totalAmount,
      base_amount: amount,
      gst_amount: gstAmount,
      currency: plan.currency,
      status: 'pending',
      payment_method: 'razorpay',
      created_at: new Date()
    }).returning('*');

    const orderRecord = paymentRecord[0];

    if (this.razorpay) {
      const razorpayOrder = await this.razorpay.orders.create({
        amount: totalAmount * 100,
        currency: plan.currency,
        receipt: `rcpt_${orderRecord.id}`,
        notes: {
          userId,
          planId,
          planName: plan.name,
          paymentId: orderRecord.id
        }
      });

      await db('payments')
        .where('id', orderRecord.id)
        .update({
          razorpay_order_id: razorpayOrder.id,
          updated_at: new Date()
        });

      return {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency
      };
    }

    return {
      id: orderRecord.id,
      amount: totalAmount,
      currency: plan.currency
    };
  }

  async verifyPayment(
    userId: string,
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string
  ): Promise<{ success: boolean; payment: Record<string, unknown> }> {
    const payment = await db('payments')
      .where('razorpay_order_id', razorpayOrderId)
      .where('user_id', userId)
      .first();

    if (!payment) {
      throw new NotFoundError('Payment');
    }

    const secret = config.RAZORPAY_KEY_SECRET || '';
    const payload = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    const sigBuffer = Buffer.from(razorpaySignature);
    const expectedBuffer = Buffer.from(expectedSignature);

    if (sigBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
      await db('payments')
        .where('id', payment.id)
        .update({
          status: 'failed',
          failure_reason: 'Invalid signature',
          updated_at: new Date()
        });

      throw new ValidationError('Invalid payment signature');
    }

    await db('payments')
      .where('id', payment.id)
      .update({
        razorpay_payment_id: razorpayPaymentId,
        razorpay_signature: razorpaySignature,
        status: 'completed',
        paid_at: new Date(),
        updated_at: new Date()
      });

    await this.membershipService.activateMembership(
      userId,
      payment.plan_id,
      payment.id,
      new Date()
    );

    const invoice = await this.invoiceService.generateInvoice(payment.id);

    // TODO: Implement sendPaymentConfirmation in EmailService
    // const user = await db('users').where('id', userId).first();
    // if (user?.email) {
    //   await this.emailService.sendPaymentConfirmation(user.email, {
    //     paymentId: payment.id,
    //     amount: payment.amount,
    //     planName: (await this.membershipService.getPlanById(payment.plan_id)).name,
    //     invoiceUrl: `${config.APP_URL}/payments/invoice/${payment.id}`
    //   });
    // }

    log.payment.completed(userId, payment.id, payment.amount);

    return {
      success: true,
      payment: payment
    };
  }

  async handleWebhook(
    payload: Record<string, unknown>,
    signature: string
  ): Promise<void> {
    const secret = config.RAZORPAY_WEBHOOK_SECRET || '';

    if (signature) {
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(JSON.stringify(payload))
        .digest('hex');

      const sigBuffer = Buffer.from(signature);
      const expectedBuffer = Buffer.from(expectedSignature);

      if (sigBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
        log.security.invalidWebhookSignature();
        throw new ValidationError('Invalid webhook signature');
      }
    }

    const event = payload.event as string;
    const payloadData = payload.payload as Record<string, unknown> | undefined;
    const paymentData = payloadData?.payment as Record<string, unknown> | undefined;
    const paymentEntity = paymentData?.entity as Record<string, unknown> | undefined;

    if (!paymentEntity) {
      return;
    }

    switch (event) {
      case 'payment.captured': {
        const orderId = paymentEntity.order_id as string;
        await this.handlePaymentCaptured(orderId, paymentEntity);
        break;
      }

      case 'payment.failed': {
        const orderId = paymentEntity.order_id as string;
        const error = (paymentEntity.error_description || paymentEntity.error || 'Payment failed') as string;
        await this.handlePaymentFailed(orderId, error);
        break;
      }

      case 'refund.created': {
        const refundId = paymentEntity.refund_id as string;
        await this.handleRefundCreated(refundId, paymentEntity);
        break;
      }

      default:
        logger.info('Unhandled webhook event', { event });
    }
  }

  private async handlePaymentCaptured(
    orderId: string,
    paymentEntity: Record<string, unknown>
  ): Promise<void> {
    const payment = await db('payments')
      .where('razorpay_order_id', orderId)
      .first();

    if (!payment) {
      logger.warn('Payment not found for webhook', { orderId });
      return;
    }

    if (payment.status === 'completed') {
      return;
    }

    await db('payments')
      .where('id', payment.id)
      .update({
        razorpay_payment_id: paymentEntity.id,
        status: 'completed',
        paid_at: new Date(),
        gateway_response: JSON.stringify(paymentEntity),
        updated_at: new Date()
      });

    await this.membershipService.activateMembership(
      payment.user_id,
      payment.plan_id,
      payment.id,
      new Date()
    );

    log.payment.completed(payment.user_id, payment.id, payment.amount);
  }

  private async handlePaymentFailed(
    orderId: string,
    error: string
  ): Promise<void> {
    await db('payments')
      .where('razorpay_order_id', orderId)
      .update({
        status: 'failed',
        failure_reason: error,
        updated_at: new Date()
      });

    log.payment.failed(orderId, error);
  }

  private async handleRefundCreated(
    refundId: string,
    paymentEntity: Record<string, unknown>
  ): Promise<void> {
    const paymentId = paymentEntity.id as string;

    await db('payments')
      .where('razorpay_payment_id', paymentId)
      .update({
        status: 'refunded',
        refund_id: refundId,
        refunded_at: new Date(),
        updated_at: new Date()
      });

    log.payment.refunded(paymentId, refundId);
  }

  async recordOfflinePayment(
    staffId: string,
    userId: string,
    planId: string,
    amount: number,
    paymentMode: string,
    transactionRef?: string,
    notes?: string
  ): Promise<Record<string, unknown>> {
    const staff = await db('users').where('id', staffId).first();
    const plan = await this.membershipService.getPlanById(planId);

    const payment = await db.transaction(async (trx) => {
      const [record] = await trx('payments')
        .insert({
          id: uuidv4(),
          user_id: userId,
          plan_id: planId,
          amount: amount,
          base_amount: amount,
          gst_amount: 0,
          currency: 'INR',
          status: 'completed',
          payment_method: 'offline',
          offline_payment_mode: paymentMode,
          offline_transaction_ref: transactionRef,
          offline_notes: notes,
          collected_by: staffId,
          franchise_centre_id: staff?.franchise_centre_id,
          paid_at: new Date(),
          created_at: new Date(),
          updated_at: new Date()
        })
        .returning('*');

      await this.membershipService.activateMembership(userId, planId, record.id, new Date());

      return record;
    });

    log.payment.offline(staffId, userId, amount, paymentMode);

    return payment;
  }

  async getPaymentHistory(
    userId: string,
    page: number,
    limit: number,
    status?: string
  ): Promise<{
    data: Record<string, unknown>[];
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  }> {
    const offset = (page - 1) * limit;

    let query = db('payments')
      .join('membership_plans', 'payments.plan_id', 'membership_plans.id')
      .where('payments.user_id', userId)
      .select(
        'payments.*',
        'membership_plans.name as plan_name',
        'membership_plans.slug as plan_slug'
      );

    if (status) {
      query = query.where('payments.status', status);
    }

    const countResult = await query.clone().count('* as count').first();
    const total = Number(countResult?.count) || 0;

    const payments = await query
      .orderBy('payments.created_at', 'desc')
      .limit(limit)
      .offset(offset);

    return {
      data: payments,
      page,
      pageSize: limit,
      total,
      totalPages: Math.ceil(total / limit)
    };
  }

  async getInvoice(userId: string, paymentId: string): Promise<Buffer> {
    const payment = await db('payments')
      .where('id', paymentId)
      .where('user_id', userId)
      .where('status', 'completed')
      .first();

    if (!payment) {
      throw new NotFoundError('Payment');
    }

    return await this.invoiceService.generateInvoice(paymentId);
  }

  async getPendingPayments(
    page: number,
    limit: number
  ): Promise<{
    data: Record<string, unknown>[];
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  }> {
    const offset = (page - 1) * limit;

    const query = db('payments')
      .join('membership_plans', 'payments.plan_id', 'membership_plans.id')
      .join('users', 'payments.user_id', 'users.id')
      .where('payments.status', 'pending')
      .select(
        'payments.*',
        'membership_plans.name as plan_name',
        'users.phone',
        'users.email'
      );

    const countResult = await query.clone().count('* as count').first();
    const total = Number(countResult?.count) || 0;

    const payments = await query
      .orderBy('payments.created_at', 'desc')
      .limit(limit)
      .offset(offset);

    return {
      data: payments,
      page,
      pageSize: limit,
      total,
      totalPages: Math.ceil(total / limit)
    };
  }

  async getPaymentStats(
    startDate?: string,
    endDate?: string,
    groupBy?: string
  ): Promise<Record<string, unknown>> {
    let query = db('payments')
      .where('status', 'completed');

    if (startDate) {
      query = query.where('paid_at', '>=', new Date(startDate));
    }

    if (endDate) {
      query = query.where('paid_at', '<=', new Date(endDate));
    }

    if (groupBy === 'plan') {
      const byPlan = await query
        .join('membership_plans', 'payments.plan_id', 'membership_plans.id')
        .groupBy('membership_plans.name')
        .select(
          'membership_plans.name as plan',
          db.raw('COUNT(*) as count'),
          db.raw('SUM(payments.amount) as revenue')
        );

      return { byPlan };
    }

    if (groupBy === 'day') {
      const byDay = await query
        .select(
          db.raw('DATE(paid_at) as date'),
          db.raw('COUNT(*) as count'),
          db.raw('SUM(amount) as revenue')
        )
        .groupBy(db.raw('DATE(paid_at)'))
        .orderBy(db.raw('DATE(paid_at)'), 'desc');

      return { byDay };
    }

    const total = await query
      .select(
        db.raw('COUNT(*) as count'),
        db.raw('SUM(amount) as revenue'),
        db.raw('AVG(amount) as average')
      )
      .first();

    return {
      totalPayments: total?.count || 0,
      totalRevenue: parseFloat(total?.revenue || '0'),
      averagePayment: parseFloat(total?.average || '0')
    };
  }

  async refundPayment(
    adminId: string,
    paymentId: string,
    amount?: number,
    reason?: string
  ): Promise<{ refundId: string; status: string }> {
    const payment = await db('payments')
      .where('id', paymentId)
      .where('status', 'completed')
      .first();

    if (!payment) {
      throw new NotFoundError('Payment');
    }

    let refundId: string;

    if (this.razorpay && payment.razorpay_payment_id) {
      const refundAmount = amount
        ? Math.round(amount * 100)
        : parseInt(payment.amount as unknown as string) * 100;

      const refund = await this.razorpay.payments.refund(payment.razorpay_payment_id, {
        amount: refundAmount,
        notes: { reason: reason || 'Admin initiated refund' }
      });

      refundId = refund.id;
    } else {
      refundId = `offline_refund_${uuidv4()}`;
    }

    await db('payments')
      .where('id', paymentId)
      .update({
        status: 'refunded',
        refund_id: refundId,
        refund_amount: amount || payment.amount,
        refund_reason: reason,
        refunded_by: adminId,
        refunded_at: new Date(),
        updated_at: new Date()
      });

    await db('user_memberships')
      .where('payment_id', paymentId)
      .update({
        status: 'cancelled',
        updated_at: new Date()
      });

    log.payment.refunded(adminId, paymentId, amount || payment.amount);

    return { refundId, status: 'refunded' };
  }

  async purchasePrepaidPack(
    userId: string,
    packId: string
  ): Promise<{ orderId: string; amount: number; currency: string }> {
    const pack = await db('prepaid_packs')
      .where('id', packId)
      .where('is_active', true)
      .first() as PrepaidPack | undefined;

    if (!pack) {
      throw new NotFoundError('Prepaid pack');
    }

    const payment = await db('payments').insert({
      id: uuidv4(),
      user_id: userId,
      prepaid_pack_id: packId,
      amount: pack.price,
      base_amount: pack.price,
      gst_amount: 0,
      currency: 'INR',
      status: 'pending',
      payment_method: 'razorpay',
      created_at: new Date()
    }).returning('*');

    const orderRecord = payment[0];

    if (this.razorpay) {
      const razorpayOrder = await this.razorpay.orders.create({
        amount: pack.price * 100,
        currency: 'INR',
        receipt: `rcpt_${orderRecord.id}`,
        notes: {
          userId,
          packId,
          packName: pack.name,
          paymentId: orderRecord.id
        }
      });

      await db('payments')
        .where('id', orderRecord.id)
        .update({
          razorpay_order_id: razorpayOrder.id,
          updated_at: new Date()
        });

      return {
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency
      };
    }

    return {
      orderId: orderRecord.id,
      amount: pack.price,
      currency: 'INR'
    };
  }

  private async applyCoupon(code: string, amount: number): Promise<number> {
    const coupon = await db('coupons')
      .where('code', code.toUpperCase())
      .where('is_active', true)
      .where('expires_at', '>', new Date())
      .where('max_uses', '>', db.raw('uses'))
      .first() as Coupon | undefined;

    if (!coupon) {
      return 0;
    }

    if (coupon.minAmount && amount < coupon.minAmount) {
      return 0;
    }

    await db('coupons')
      .where('id', coupon.id)
      .increment('uses', 1);

    if (coupon.type === 'percentage') {
      return Math.round(amount * (coupon.value / 100) * 100) / 100;
    }

    return Math.min(coupon.value, amount);
  }

  async expirePendingPayments(): Promise<number> {
    const expiryMinutes = 30;
    const expiryDate = new Date(Date.now() - expiryMinutes * 60 * 1000);

    const result = await db('payments')
      .where('status', 'pending')
      .where('created_at', '<', expiryDate)
      .update({
        status: 'expired',
        failure_reason: 'Payment expired - no payment received within 30 minutes',
        updated_at: new Date()
      });

    if (result) {
      logger.info(`Expired ${result} pending payments`);
    }

    return result;
  }
}

interface RazorpayInstance {
  orders: {
    create(options: Record<string, unknown>): Promise<{ id: string; amount: number; currency: string }>;
  };
  payments: {
    refund(paymentId: string, options: Record<string, unknown>): Promise<{ id: string }>;
  };
}

export const paymentService = new PaymentService();
