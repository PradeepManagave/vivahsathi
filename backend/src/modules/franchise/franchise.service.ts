import { db } from '../../config/database';
import logger from '../../config/logger';
import { AppError } from '../../shared/utils/errors';

export interface Franchise {
  id: string;
  name: string;
  code: string;
  ownerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  status: 'active' | 'inactive' | 'suspended';
  commission: number;
}

export class FranchiseService {
  async create(data: Partial<Franchise> & { password: string }) {
    const [franchise] = await db('franchises')
      .insert({
        name: data.name,
        code: data.code,
        owner_name: data.ownerName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        city: data.city,
        state: data.state,
        commission: data.commission || 20,
        status: 'active'
      })
      .returning('*');

    return franchise;
  }

  async getAll(page = 1, limit = 20, status?: string) {
    const offset = (page - 1) * limit;

    let query = db('franchises').orderBy('created_at', 'desc').limit(limit).offset(offset);
    if (status) {
      query = query.where('status', status);
    }

    const [franchises, total] = await Promise.all([
      query,
      db('franchises').count('id as count').first()
    ]);

    return {
      data: franchises,
      pagination: {
        page,
        limit,
        total: Number(total?.count || 0),
        pages: Math.ceil(Number(total?.count || 0) / limit)
      }
    };
  }

  async getById(franchiseId: string) {
    const franchise = await db('franchises').where('id', franchiseId).first();
    if (!franchise) {
      throw new AppError('Franchise not found', 404, 'NOT_FOUND');
    }
    return franchise;
  }

  async update(franchiseId: string, data: Partial<Franchise>) {
    const [updated] = await db('franchises')
      .where('id', franchiseId)
      .update({
        name: data.name,
        owner_name: data.ownerName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        city: data.city,
        state: data.state,
        commission: data.commission,
        status: data.status,
        updated_at: db.fn.now()
      })
      .returning('*');

    return updated;
  }

  async getCentres(franchiseId: string, page = 1, limit = 20) {
    const offset = (page - 1) * limit;

    const [centres, total] = await Promise.all([
      db('centres')
        .where('franchise_id', franchiseId)
        .orderBy('created_at', 'desc')
        .limit(limit)
        .offset(offset),
      db('centres').where('franchise_id', franchiseId).count('id as count').first()
    ]);

    return {
      data: centres,
      pagination: {
        page,
        limit,
        total: Number(total?.count || 0),
        pages: Math.ceil(Number(total?.count || 0) / limit)
      }
    };
  }

  async createCentre(franchiseId: string, data: any) {
    const [centre] = await db('centres')
      .insert({
        franchise_id: franchiseId,
        name: data.name,
        code: data.code,
        address: data.address,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        phone: data.phone,
        email: data.email
      })
      .returning('*');

    return centre;
  }

  async getPerformance(franchiseId: string, period: 'month' | 'quarter' | 'year' = 'month') {
    const now = new Date();
    let startDate: Date;
    switch (period) {
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), quarter * 3, 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
    }

    const [memberCount, revenue, centres, pendingApprovals] = await Promise.all([
      db('users as u')
        .join('centres as c', 'c.id', 'u.centre_id')
        .where('c.franchise_id', franchiseId)
        .where('u.created_at', '>=', startDate)
        .count('u.id as count')
        .first(),
      db('payments as p')
        .join('centres as c', 'c.id', 'p.centre_id')
        .where('c.franchise_id', franchiseId)
        .where('p.status', 'completed')
        .where('p.created_at', '>=', startDate)
        .sum('p.amount as total')
        .first(),
      db('centres').where('franchise_id', franchiseId).count('id as count').first(),
      db('users as u')
        .join('centres as c', 'c.id', 'u.centre_id')
        .where('c.franchise_id', franchiseId)
        .where('u.status', 'pending')
        .count('u.id as count')
        .first()
    ]);

    return {
      period,
      startDate,
      newMembers: Number(memberCount?.count || 0),
      revenue: Number(revenue?.total || 0),
      activeCentres: Number(centres?.count || 0),
      pendingApprovals: Number(pendingApprovals?.count || 0)
    };
  }

  async getRevenueShare(franchiseId: string) {
    const franchise = await this.getById(franchiseId);

    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const revenue = await db('payments as p')
      .join('centres as c', 'c.id', 'p.centre_id')
      .where('c.franchise_id', franchiseId)
      .where('p.status', 'completed')
      .where('p.created_at', '>=', periodStart)
      .sum('p.amount as total')
      .first();

    const totalRevenue = Number(revenue?.total || 0);
    const franchiseShare = totalRevenue * (franchise.commission / 100);
    const platformShare = totalRevenue - franchiseShare;

    return {
      totalRevenue,
      commission: franchise.commission,
      franchiseShare,
      platformShare,
      periodStart,
      periodEnd
    };
  }

  async getPayouts(franchiseId: string, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const [payouts, total] = await Promise.all([
      db('franchise_payouts')
        .where('franchise_id', franchiseId)
        .orderBy('created_at', 'desc')
        .limit(limit)
        .offset(offset),
      db('franchise_payouts').where('franchise_id', franchiseId).count('id as count').first()
    ]);
    return {
      data: payouts,
      pagination: { page, limit, total: Number(total?.count || 0), pages: Math.ceil(Number(total?.count || 0) / limit) }
    };
  }

  async createPayout(franchiseId: string, adminId: string, amount: number, notes?: string) {
    const franchise = await this.getById(franchiseId);
    const revenueShare = await this.getRevenueShare(franchiseId);

    if (amount > revenueShare.franchiseShare) {
      throw new AppError('Payout amount exceeds available franchise share', 400, 'EXCEEDS_SHARE');
    }

    const [payout] = await db('franchise_payouts')
      .insert({
        franchise_id: franchiseId,
        amount,
        status: 'pending',
        processed_by: adminId,
        notes: notes || null,
        period_start: revenueShare.periodStart,
        period_end: revenueShare.periodEnd,
        created_at: db.fn.now()
      })
      .returning('*');

    return payout;
  }

  async processPayout(payoutId: string, adminId: string, transactionRef?: string) {
    const payout = await db('franchise_payouts').where('id', payoutId).first();
    if (!payout) throw new AppError('Payout not found', 404, 'NOT_FOUND');
    if (payout.status !== 'pending') throw new AppError('Payout already processed', 400, 'ALREADY_PROCESSED');

    const [updated] = await db('franchise_payouts')
      .where('id', payoutId)
      .update({
        status: 'completed',
        processed_by: adminId,
        transaction_ref: transactionRef || null,
        processed_at: db.fn.now(),
        updated_at: db.fn.now()
      })
      .returning('*');

    return updated;
  }

  async getPayoutSummary(franchiseId: string) {
    const [pending, completed, totalPayouts] = await Promise.all([
      db('franchise_payouts').where('franchise_id', franchiseId).where('status', 'pending').sum('amount as total').first(),
      db('franchise_payouts').where('franchise_id', franchiseId).where('status', 'completed').sum('amount as total').first(),
      db('franchise_payouts').where('franchise_id', franchiseId).sum('amount as total').first()
    ]);

    return {
      pendingAmount: Number(pending?.total || 0),
      completedAmount: Number(completed?.total || 0),
      totalPaidOut: Number(totalPayouts?.total || 0)
    };
  }

  async updateBranding(franchiseId: string, data: { primaryColor?: string; secondaryColor?: string; logoUrl?: string; faviconUrl?: string; tagline?: string; subdomain?: string }) {
    const franchise = await this.getById(franchiseId);
    const [updated] = await db('franchises')
      .where('id', franchiseId)
      .update({
        primary_color: data.primaryColor ?? franchise.primary_color,
        secondary_color: data.secondaryColor ?? franchise.secondary_color,
        logo_url: data.logoUrl ?? franchise.logo_url,
        favicon_url: data.faviconUrl ?? franchise.favicon_url,
        tagline: data.tagline ?? franchise.tagline,
        subdomain: data.subdomain ?? franchise.subdomain,
        updated_at: db.fn.now()
      })
      .returning('*');
    return updated;
  }

  async getCentrePerformance(_franchiseId: string, centreId: string, period: 'month' | 'quarter' | 'year' = 'month') {
    const now = new Date();
    let startDate: Date;
    switch (period) {
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), quarter * 3, 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
    }

    const [memberCount, revenue, staffCount] = await Promise.all([
      db('users').where('centre_id', centreId).where('created_at', '>=', startDate).count('id as count').first(),
      db('payments').where('centre_id', centreId).where('status', 'completed').where('created_at', '>=', startDate).sum('amount as total').first(),
      db('centre_staff').where('centre_id', centreId).count('id as count').first()
    ]);

    return {
      period,
      newMembers: Number(memberCount?.count || 0),
      revenue: Number(revenue?.total || 0),
      staffCount: Number(staffCount?.count || 0)
    };
  }
}
