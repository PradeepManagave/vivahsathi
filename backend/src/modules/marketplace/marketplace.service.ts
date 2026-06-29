import { db } from '../../config/database';
import logger from '../../config/logger';
import { NotFoundError, ValidationError } from '../../shared/utils/errors';
import { v4 as uuidv4 } from 'uuid';

interface Vendor {
  id: string;
  businessName: string;
  slug: string;
  categoryId: string;
  description: string;
  longDescription?: string;
  location: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  priceRange: string;
  images: string[];
  services: string[];
  workingHours: { day: string; hours: string }[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Classified {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  location: string;
  price: string;
  postedBy: string;
  postedByUserId: string;
  phone: string;
  email?: string;
  images: string[];
  condition?: string;
  negotiable: boolean;
  isFeatured: boolean;
  views: number;
  favorites: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  type: 'vendor' | 'classified';
  description?: string;
  icon?: string;
  parentId?: string;
  displayOrder: number;
  isActive: boolean;
}

export class MarketplaceService {
  async listVendors(params: {
    page: number; limit: number; categoryId?: string; search?: string;
    location?: string; sort?: string; isVerified?: boolean;
  }): Promise<{ data: Vendor[]; page: number; pageSize: number; total: number; totalPages: number }> {
    const { page = 1, limit = 20, categoryId, search, location, sort } = params;
    let query = db('marketplace_vendors').where('is_active', true);

    if (categoryId) query = query.where('category_id', categoryId);
    if (search) query = query.where(function () { this.where('business_name', 'ilike', `%${search}%`).orWhere('description', 'ilike', `%${search}%`); });
    if (location) query = query.where('location', 'ilike', `%${location}%`);

    const totalQuery = query.clone();
    const total = (await totalQuery.count('id as count').first()) as any;
    const totalCount = parseInt(total?.count || '0', 10);

    if (sort === 'rating') query = query.orderBy('rating', 'desc');
    else if (sort === 'newest') query = query.orderBy('created_at', 'desc');
    else query = query.orderBy('rating', 'desc');

    const vendors = await query.offset((page - 1) * limit).limit(limit);
    return { data: vendors, page, pageSize: limit, total: totalCount, totalPages: Math.ceil(totalCount / limit) };
  }

  async getVendorById(id: string): Promise<Vendor> {
    const vendor = await db('marketplace_vendors').where('id', id).where('is_active', true).first();
    if (!vendor) throw new NotFoundError('Vendor');
    return vendor;
  }

  async createVendor(data: Partial<Vendor>): Promise<Vendor> {
    const id = uuidv4();
    const slug = data.businessName?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + id.slice(0, 8);
    await db('marketplace_vendors').insert({ id, slug, ...data, is_active: true, created_at: new Date(), updated_at: new Date() });
    return this.getVendorById(id);
  }

  async updateVendor(id: string, data: Partial<Vendor>): Promise<Vendor> {
    const vendor = await db('marketplace_vendors').where('id', id).first();
    if (!vendor) throw new NotFoundError('Vendor');
    await db('marketplace_vendors').where('id', id).update({ ...data, updated_at: new Date() });
    return this.getVendorById(id);
  }

  async deleteVendor(id: string): Promise<void> {
    const vendor = await db('marketplace_vendors').where('id', id).first();
    if (!vendor) throw new NotFoundError('Vendor');
    await db('marketplace_vendors').where('id', id).update({ is_active: false, updated_at: new Date() });
  }

  async submitVerification(vendorId: string, documents: { type: string; url: string }[], notes?: string): Promise<void> {
    const vendor = await db('marketplace_vendors').where('id', vendorId).where('is_active', true).first();
    if (!vendor) throw new NotFoundError('Vendor');
    for (const doc of documents) {
      await db('marketplace_vendor_documents').insert({
        id: uuidv4(),
        vendor_id: vendorId,
        document_type: doc.type,
        document_url: doc.url,
        status: 'pending',
        created_at: new Date()
      });
    }
    await db('marketplace_vendors').where('id', vendorId).update({ verification_status: 'pending', updated_at: new Date() });
  }

  async getVerificationDocuments(vendorId: string): Promise<any[]> {
    return db('marketplace_vendor_documents').where('vendor_id', vendorId).orderBy('created_at', 'desc');
  }

  async reviewVerification(vendorId: string, adminId: string, status: 'verified' | 'rejected', rejectionReason?: string): Promise<void> {
    const vendor = await db('marketplace_vendors').where('id', vendorId).first();
    if (!vendor) throw new NotFoundError('Vendor');
    await db('marketplace_vendors').where('id', vendorId).update({
      is_verified: status === 'verified',
      verification_status: status,
      verified_at: status === 'verified' ? new Date() : null,
      verified_by: adminId,
      rejection_reason: rejectionReason || null,
      updated_at: new Date()
    });
    if (status === 'verified') {
      await db('marketplace_vendor_documents').where('vendor_id', vendorId).update({ status: 'approved', reviewed_by: adminId, reviewed_at: new Date() });
    } else {
      await db('marketplace_vendor_documents').where('vendor_id', vendorId).where('status', 'pending').update({ status: 'rejected', reviewed_by: adminId, rejection_reason: rejectionReason, reviewed_at: new Date() });
    }
  }

  async listPendingVerifications(page = 1, limit = 20): Promise<{ data: any[]; page: number; pageSize: number; total: number; totalPages: number }> {
    const total = (await db('marketplace_vendors').where('verification_status', 'pending').count('id as count').first()) as any;
    const totalCount = parseInt(total?.count || '0', 10);
    const vendors = await db('marketplace_vendors')
      .where('verification_status', 'pending')
      .orderBy('updated_at', 'desc')
      .offset((page - 1) * limit).limit(limit);
    return { data: vendors, page, pageSize: limit, total: totalCount, totalPages: Math.ceil(totalCount / limit) };
  }

  async listClassifieds(params: {
    page: number; limit: number; categoryId?: string; search?: string;
    location?: string; sort?: string; userId?: string;
  }): Promise<{ data: Classified[]; page: number; pageSize: number; total: number; totalPages: number }> {
    const { page = 1, limit = 20, categoryId, search, location, sort, userId } = params;
    let query = db('marketplace_classifieds').where('is_active', true);

    if (categoryId) query = query.where('category_id', categoryId);
    if (userId) query = query.where('posted_by_user_id', userId);
    if (search) query = query.where(function () { this.where('title', 'ilike', `%${search}%`).orWhere('description', 'ilike', `%${search}%`); });
    if (location) query = query.where('location', 'ilike', `%${location}%`);

    const totalQuery = query.clone();
    const total = (await totalQuery.count('id as count').first()) as any;
    const totalCount = parseInt(total?.count || '0', 10);

    if (sort === 'newest') query = query.orderBy('created_at', 'desc');
    else if (sort === 'price_asc') query = query.orderBy('price', 'asc');
    else if (sort === 'price_desc') query = query.orderBy('price', 'desc');
    else query = query.orderBy('created_at', 'desc');

    const classifieds = await query.offset((page - 1) * limit).limit(limit);
    return { data: classifieds, page, pageSize: limit, total: totalCount, totalPages: Math.ceil(totalCount / limit) };
  }

  async getClassifiedById(id: string): Promise<Classified> {
    const classified = await db('marketplace_classifieds').where('id', id).where('is_active', true).first();
    if (!classified) throw new NotFoundError('Classified');
    await db('marketplace_classifieds').where('id', id).increment('views', 1);
    return classified;
  }

  async createClassified(data: Partial<Classified>): Promise<Classified> {
    const id = uuidv4();
    await db('marketplace_classifieds').insert({ id, ...data, views: 0, favorites: 0, is_active: true, created_at: new Date(), updated_at: new Date() });
    return this.getClassifiedById(id);
  }

  async updateClassified(id: string, data: Partial<Classified>): Promise<Classified> {
    const classified = await db('marketplace_classifieds').where('id', id).first();
    if (!classified) throw new NotFoundError('Classified');
    await db('marketplace_classifieds').where('id', id).update({ ...data, updated_at: new Date() });
    return this.getClassifiedById(id);
  }

  async deleteClassified(id: string): Promise<void> {
    const classified = await db('marketplace_classifieds').where('id', id).first();
    if (!classified) throw new NotFoundError('Classified');
    await db('marketplace_classifieds').where('id', id).update({ is_active: false, updated_at: new Date() });
  }

  async toggleClassifiedFavorite(id: string): Promise<void> {
    const classified = await db('marketplace_classifieds').where('id', id).first();
    if (!classified) throw new NotFoundError('Classified');
    await db('marketplace_classifieds').where('id', id).increment('favorites', 1);
  }

  async listCategories(type?: 'vendor' | 'classified'): Promise<Category[]> {
    let query = db('marketplace_categories').where('is_active', true).orderBy('display_order', 'asc');
    if (type) query = query.where('type', type);
    return query;
  }

  async getCategoryById(id: string): Promise<Category> {
    const category = await db('marketplace_categories').where('id', id).where('is_active', true).first();
    if (!category) throw new NotFoundError('Category');
    return category;
  }

  async createCategory(data: Partial<Category>): Promise<Category> {
    const id = uuidv4();
    const slug = data.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    await db('marketplace_categories').insert({ id, slug, ...data, is_active: true });
    return this.getCategoryById(id);
  }

  async updateCategory(id: string, data: Partial<Category>): Promise<Category> {
    const category = await db('marketplace_categories').where('id', id).first();
    if (!category) throw new NotFoundError('Category');
    await db('marketplace_categories').where('id', id).update(data);
    return this.getCategoryById(id);
  }

  async deleteCategory(id: string): Promise<void> {
    const category = await db('marketplace_categories').where('id', id).first();
    if (!category) throw new NotFoundError('Category');
    await db('marketplace_categories').where('id', id).update({ is_active: false });
  }

  async getVendorsByCategory(categoryId: string, page = 1, limit = 20) {
    return this.listVendors({ categoryId, page, limit });
  }

  async getClassifiedsByCategory(categoryId: string, page = 1, limit = 20) {
    return this.listClassifieds({ categoryId, page, limit });
  }

  async submitVendorInquiry(data: { vendorId: string; userId?: string; name: string; email: string; phone?: string; message: string }): Promise<void> {
    const vendor = await db('marketplace_vendors').where('id', data.vendorId).where('is_active', true).first();
    if (!vendor) throw new NotFoundError('Vendor');
    await db('marketplace_vendor_inquiries').insert({ id: uuidv4(), vendor_id: data.vendorId, user_id: data.userId, name: data.name, email: data.email, phone: data.phone, message: data.message, is_read: false, created_at: new Date() });
  }

  async listVendorInquiries(vendorId: string, page = 1, limit = 20): Promise<{ data: any[]; page: number; pageSize: number; total: number; totalPages: number }> {
    const totalQuery = db('marketplace_vendor_inquiries').where('vendor_id', vendorId);
    const total = (await totalQuery.count('id as count').first()) as any;
    const totalCount = parseInt(total?.count || '0', 10);
    const inquiries = await db('marketplace_vendor_inquiries').where('vendor_id', vendorId).orderBy('created_at', 'desc').offset((page - 1) * limit).limit(limit);
    return { data: inquiries, page, pageSize: limit, total: totalCount, totalPages: Math.ceil(totalCount / limit) };
  }

  async submitReview(vendorId: string, userId: string, rating: number, comment: string): Promise<any> {
    if (rating < 1 || rating > 5) throw new ValidationError('Rating must be between 1 and 5');
    const vendor = await db('marketplace_vendors').where('id', vendorId).where('is_active', true).first();
    if (!vendor) throw new NotFoundError('Vendor');
    const existing = await db('marketplace_vendor_reviews').where({ vendor_id: vendorId, user_id: userId }).first();
    if (existing) {
      await db('marketplace_vendor_reviews').where('id', existing.id).update({ rating, comment, updated_at: new Date() });
    } else {
      await db('marketplace_vendor_reviews').insert({ id: uuidv4(), vendor_id: vendorId, user_id: userId, rating, comment, created_at: new Date(), updated_at: new Date() });
    }
    await this.recalculateVendorRating(vendorId);
    return this.getUserReview(vendorId, userId);
  }

  async getVendorReviews(vendorId: string, page = 1, limit = 20): Promise<{ data: any[]; page: number; pageSize: number; total: number; totalPages: number }> {
    const total = (await db('marketplace_vendor_reviews').where('vendor_id', vendorId).count('id as count').first()) as any;
    const totalCount = parseInt(total?.count || '0', 10);
    const reviews = await db('marketplace_vendor_reviews as r')
      .select('r.*', 'u.first_name', 'u.last_name', 'up.avatar_url')
      .leftJoin('users as u', 'u.id', 'r.user_id')
      .leftJoin('user_profiles as up', 'up.user_id', 'r.user_id')
      .where('r.vendor_id', vendorId)
      .orderBy('r.created_at', 'desc')
      .offset((page - 1) * limit).limit(limit);
    return { data: reviews, page, pageSize: limit, total: totalCount, totalPages: Math.ceil(totalCount / limit) };
  }

  async getUserReview(vendorId: string, userId: string): Promise<any> {
    return db('marketplace_vendor_reviews').where({ vendor_id: vendorId, user_id: userId }).first();
  }

  async deleteReview(reviewId: string, userId: string): Promise<void> {
    const review = await db('marketplace_vendor_reviews').where('id', reviewId).first();
    if (!review) throw new NotFoundError('Review');
    if (review.user_id !== userId) throw new ValidationError('You can only delete your own review');
    await db('marketplace_vendor_reviews').where('id', reviewId).del();
    await this.recalculateVendorRating(review.vendor_id);
  }

  private async recalculateVendorRating(vendorId: string): Promise<void> {
    const stats = await db('marketplace_vendor_reviews')
      .where('vendor_id', vendorId)
      .select(db.raw('ROUND(AVG(rating)::numeric, 1) as avg_rating'), db.raw('COUNT(*) as review_count'))
      .first() as any;
    await db('marketplace_vendors')
      .where('id', vendorId)
      .update({ rating: parseFloat(stats?.avg_rating || '0'), review_count: parseInt(stats?.review_count || '0', 10), updated_at: new Date() });
  }
}

export const marketplaceService = new MarketplaceService();
