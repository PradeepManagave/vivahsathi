import { db } from '../../config/database';
import logger from '../../config/logger';
import { AppError } from '../../shared/utils/errors';

export class FranchiseAdminService {
  async create(data: {
    name: string;
    code: string;
    ownerName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode?: string;
    commission: number;
  }) {
    const existing = await db('franchises').where('code', data.code).first();
    if (existing) {
      throw new AppError('Franchise code already exists', 400, 'CODE_EXISTS');
    }

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
        pincode: data.pincode,
        commission: data.commission || 20,
        status: 'active'
      })
      .returning('*');

    return franchise;
  }

  async update(franchiseId: string, data: {
    name?: string;
    ownerName?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    commission?: number;
    status?: string;
  }) {
    const franchise = await db('franchises').where('id', franchiseId).first();
    if (!franchise) {
      throw new AppError('Franchise not found', 404, 'FRANCHISE_NOT_FOUND');
    }

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
        pincode: data.pincode,
        commission: data.commission,
        status: data.status,
        updated_at: db.fn.now()
      })
      .returning('*');

    return updated;
  }

  async getFranchiseMembers(franchiseId: string, filters: {
    status?: string;
    planId?: string;
    dateFrom?: Date;
    dateTo?: Date;
  }, page = 1, limit = 20) {
    const offset = (page - 1) * limit;

    let query = db('users as u')
      .select(
        'u.id',
        'u.first_name',
        'u.last_name',
        'u.email',
        'u.phone',
        'u.gender',
        'u.status',
        'u.created_at',
        'up.avatar_url',
        'up.city',
        'um.plan_name as membership_plan',
        'um.end_date as membership_expiry',
        'c.name as centre_name'
      )
      .leftJoin('user_profiles as up', 'up.user_id', 'u.id')
      .leftJoin('user_memberships as um', function () {
        this.on('um.user_id', 'u.id').onIn('um.status', ['active', 'expired']);
      })
      .leftJoin('centres as c', 'c.id', 'u.centre_id')
      .where('c.franchise_id', franchiseId)
      .orderBy('u.created_at', 'desc')
      .limit(limit)
      .offset(offset);

    if (filters.status) query = query.where('u.status', filters.status);
    if (filters.planId) query = query.where('um.plan_id', filters.planId);
    if (filters.dateFrom) query = query.where('u.created_at', '>=', filters.dateFrom);
    if (filters.dateTo) query = query.where('u.created_at', '<=', filters.dateTo);

    const [members, total] = await Promise.all([
      query,
      db('users as u')
        .leftJoin('centres as c', 'c.id', 'u.centre_id')
        .where('c.franchise_id', franchiseId)
        .count('u.id as count')
        .first()
    ]);

    return {
      data: members,
      pagination: {
        page,
        limit,
        total: Number(total?.count || 0),
        pages: Math.ceil(Number(total?.count || 0) / limit)
      }
    };
  }

  async getFranchiseRevenue(franchiseId: string, dateFrom?: Date, dateTo?: Date) {
    const franchise = await db('franchises').where('id', franchiseId).first();
    if (!franchise) {
      throw new AppError('Franchise not found', 404, 'FRANCHISE_NOT_FOUND');
    }

    let query = db('payments as p')
      .join('centres as c', 'c.id', 'p.centre_id')
      .where('c.franchise_id', franchiseId)
      .where('p.status', 'completed');

    if (dateFrom) {
      query = query.where('p.created_at', '>=', dateFrom);
    }

    if (dateTo) {
      query = query.where('p.created_at', '<=', dateTo);
    }

    const [summary, byPlan, byMonth] = await Promise.all([
      query.clone()
        .select(
          db.raw('COUNT(*) as total_transactions'),
          db.raw('SUM(p.amount) as total_amount'),
          db.raw('AVG(p.amount) as average_amount')
        )
        .first(),
      query.clone()
        .select(
          'mp.name as plan_name',
          db.raw('COUNT(*) as transactions'),
          db.raw('SUM(p.amount) as amount')
        )
        .leftJoin('membership_plans as mp', 'mp.id', 'p.plan_id')
        .groupBy('mp.name'),
      query.clone()
        .select(
          db.raw("TO_CHAR(p.created_at, 'YYYY-MM') as month"),
          db.raw('COUNT(*) as transactions'),
          db.raw('SUM(p.amount) as amount')
        )
        .groupByRaw("TO_CHAR(p.created_at, 'YYYY-MM')")
        .orderByRaw("TO_CHAR(p.created_at, 'YYYY-MM') DESC")
        .limit(12)
    ]);

    const totalRevenue = Number(summary?.total_amount || 0);
    const commissionAmount = totalRevenue * (franchise.commission / 100);
    const netPayable = totalRevenue - commissionAmount;

    return {
      summary: {
        totalTransactions: Number(summary?.total_transactions || 0),
        totalRevenue,
        averageAmount: Number(summary?.average_amount || 0),
        commissionRate: franchise.commission,
        commissionAmount,
        netPayable
      },
      byPlan,
      byMonth
    };
  }

  async getFranchiseList(page = 1, limit = 20, status?: string) {
    const offset = (page - 1) * limit;

    let query = db('franchises as f')
      .select(
        'f.*',
        db.raw('COUNT(DISTINCT c.id) as centres_count'),
        db.raw('COUNT(DISTINCT u.id) as members_count'),
        db.raw('COALESCE(SUM(CASE WHEN p.status = \'completed\' THEN p.amount ELSE 0 END), 0) as total_revenue')
      )
      .leftJoin('centres as c', 'c.franchise_id', 'f.id')
      .leftJoin('users as u', 'u.centre_id', 'c.id')
      .leftJoin('payments as p', 'p.centre_id', 'c.id')
      .groupBy('f.id')
      .orderBy('f.created_at', 'desc')
      .limit(limit)
      .offset(offset);

    if (status) {
      query = query.where('f.status', status);
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

  async createCentre(franchiseId: string, data: {
    name: string;
    code: string;
    address: string;
    city: string;
    state: string;
    pincode?: string;
    phone?: string;
    email?: string;
    openingHours?: any;
  }) {
    const franchise = await db('franchises').where('id', franchiseId).first();
    if (!franchise) {
      throw new AppError('Franchise not found', 404, 'FRANCHISE_NOT_FOUND');
    }

    const existing = await db('centres').where('code', data.code).first();
    if (existing) {
      throw new AppError('Centre code already exists', 400, 'CODE_EXISTS');
    }

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
        email: data.email,
        opening_hours: data.openingHours ? JSON.stringify(data.openingHours) : '{}'
      })
      .returning('*');

    return centre;
  }

  async updateCentre(centreId: string, data: any) {
    const centre = await db('centres').where('id', centreId).first();
    if (!centre) {
      throw new AppError('Centre not found', 404, 'CENTRE_NOT_FOUND');
    }

    const [updated] = await db('centres')
      .where('id', centreId)
      .update({
        name: data.name,
        address: data.address,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        phone: data.phone,
        email: data.email,
        opening_hours: data.openingHours ? JSON.stringify(data.openingHours) : undefined,
        status: data.status,
        updated_at: db.fn.now()
      })
      .returning('*');

    return updated;
  }

  async getCommissionReport(dateFrom?: Date, dateTo?: Date) {
    let query = db('franchises as f')
      .select(
        'f.id',
        'f.name as franchise_name',
        'f.code as franchise_code',
        'f.commission',
        db.raw('COUNT(DISTINCT c.id) as centres'),
        db.raw("COALESCE(SUM(CASE WHEN p.status = 'completed' THEN p.amount ELSE 0 END), 0) as total_revenue")
      )
      .leftJoin('centres as c', 'c.franchise_id', 'f.id')
      .leftJoin('payments as p', 'p.centre_id', 'c.id')
      .groupBy('f.id')
      .orderBy('total_revenue', 'desc');

    if (dateFrom) {
      query = query.where('p.created_at', '>=', dateFrom);
    }

    if (dateTo) {
      query = query.where('p.created_at', '<=', dateTo);
    }

    const franchises = await query;

    const report = franchises.map(f => ({
      ...f,
      commission_amount: Number(f.total_revenue) * (f.commission / 100),
      net_payable: Number(f.total_revenue) - (Number(f.total_revenue) * (f.commission / 100))
    }));

    const totals = report.reduce((acc, f) => ({
      totalRevenue: acc.totalRevenue + Number(f.total_revenue),
      totalCommission: acc.totalCommission + Number(f.commission_amount),
      totalNetPayable: acc.totalNetPayable + Number(f.net_payable)
    }), { totalRevenue: 0, totalCommission: 0, totalNetPayable: 0 });

    return { franchises: report, totals };
  }
}
