import { db } from '../../config/database';
import { NotFoundError, ValidationError } from '../../shared/utils/errors';
import { v4 as uuidv4 } from 'uuid';

interface CmsPage {
  id: string; title: string; slug: string; content: string;
  metaTitle?: string; metaDescription?: string; metaKeywords?: string;
  language?: string; status: string; publishedAt?: string;
  authorId?: string; isActive: boolean; createdAt: string; updatedAt: string;
}

interface Testimonial {
  id: string; userId?: string; name: string; role?: string;
  content: string; rating: number; avatarUrl?: string;
  isFeatured: boolean; isApproved: boolean; displayOrder: number;
  isActive: boolean; createdAt: string; updatedAt: string;
}

interface SuccessStory {
  id: string; title: string; slug: string; content: string;
  excerpt?: string; coverImage?: string; brideName?: string; groomName?: string;
  weddingDate?: string; location?: string; isFeatured: boolean;
  status: string; publishedAt?: string; authorId?: string;
  isActive: boolean; createdAt: string; updatedAt: string;
}

export class CmsService {
  async listPages(params: { status?: string; language?: string; page?: number; limit?: number }): Promise<{ data: CmsPage[]; page: number; pageSize: number; total: number; totalPages: number }> {
    const { status, language, page = 1, limit = 20 } = params;
    let query = db('cms_pages').where('is_active', true);
    if (status) query = query.where('status', status);
    if (language) query = query.where('language', language);
    const totalQuery = query.clone();
    const total = (await totalQuery.count('id as count').first()) as any;
    const totalCount = parseInt(total?.count || '0', 10);
    const data = await query.orderBy('created_at', 'desc').offset((page - 1) * limit).limit(limit);
    return { data, page, pageSize: limit, total: totalCount, totalPages: Math.ceil(totalCount / limit) };
  }

  async getPageBySlug(slug: string): Promise<CmsPage> {
    const page = await db('cms_pages').where('slug', slug).where('is_active', true).first();
    if (!page) throw new NotFoundError('Page');
    return page;
  }

  async getPageById(id: string): Promise<CmsPage> {
    const page = await db('cms_pages').where('id', id).first();
    if (!page) throw new NotFoundError('Page');
    return page;
  }

  async createPage(data: Partial<CmsPage>): Promise<CmsPage> {
    const id = uuidv4();
    const slug = data.slug || data.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    if (!slug) throw new ValidationError('Title or slug is required');
    await db('cms_pages').insert({ id, slug, ...data, is_active: true, created_at: new Date(), updated_at: new Date() });
    return this.getPageById(id);
  }

  async updatePage(id: string, data: Partial<CmsPage>): Promise<CmsPage> {
    const page = await db('cms_pages').where('id', id).first();
    if (!page) throw new NotFoundError('Page');
    await db('cms_pages').where('id', id).update({ ...data, updated_at: new Date() });
    return this.getPageById(id);
  }

  async deletePage(id: string): Promise<void> {
    const page = await db('cms_pages').where('id', id).first();
    if (!page) throw new NotFoundError('Page');
    await db('cms_pages').where('id', id).update({ is_active: false, updated_at: new Date() });
  }

  async listTestimonials(params: { featured?: boolean; approved?: boolean; page?: number; limit?: number }): Promise<{ data: Testimonial[]; page: number; pageSize: number; total: number; totalPages: number }> {
    const { featured, approved = true, page = 1, limit = 20 } = params;
    let query = db('cms_testimonials').where('is_active', true);
    if (featured) query = query.where('is_featured', true);
    if (approved) query = query.where('is_approved', true);
    const totalQuery = query.clone();
    const total = (await totalQuery.count('id as count').first()) as any;
    const totalCount = parseInt(total?.count || '0', 10);
    const data = await query.orderBy('display_order', 'asc').orderBy('created_at', 'desc').offset((page - 1) * limit).limit(limit);
    return { data, page, pageSize: limit, total: totalCount, totalPages: Math.ceil(totalCount / limit) };
  }

  async createTestimonial(data: Partial<Testimonial>): Promise<Testimonial> {
    const id = uuidv4();
    await db('cms_testimonials').insert({ id, ...data, is_approved: false, is_active: true, created_at: new Date(), updated_at: new Date() });
    return db('cms_testimonials').where('id', id).first();
  }

  async approveTestimonial(id: string): Promise<void> {
    const t = await db('cms_testimonials').where('id', id).first();
    if (!t) throw new NotFoundError('Testimonial');
    await db('cms_testimonials').where('id', id).update({ is_approved: true, updated_at: new Date() });
  }

  async deleteTestimonial(id: string): Promise<void> {
    const t = await db('cms_testimonials').where('id', id).first();
    if (!t) throw new NotFoundError('Testimonial');
    await db('cms_testimonials').where('id', id).update({ is_active: false, updated_at: new Date() });
  }

  async listSuccessStories(params: { featured?: boolean; status?: string; page?: number; limit?: number }): Promise<{ data: SuccessStory[]; page: number; pageSize: number; total: number; totalPages: number }> {
    const { featured, status = 'published', page = 1, limit = 20 } = params;
    let query = db('cms_success_stories').where('is_active', true);
    if (featured) query = query.where('is_featured', true);
    if (status) query = query.where('status', status);
    const totalQuery = query.clone();
    const total = (await totalQuery.count('id as count').first()) as any;
    const totalCount = parseInt(total?.count || '0', 10);
    const data = await query.orderBy('is_featured', 'desc').orderBy('published_at', 'desc').offset((page - 1) * limit).limit(limit);
    return { data, page, pageSize: limit, total: totalCount, totalPages: Math.ceil(totalCount / limit) };
  }

  async getSuccessStoryBySlug(slug: string): Promise<SuccessStory> {
    const story = await db('cms_success_stories').where('slug', slug).where('is_active', true).first();
    if (!story) throw new NotFoundError('SuccessStory');
    return story;
  }

  async getSuccessStoryById(id: string): Promise<SuccessStory> {
    const story = await db('cms_success_stories').where('id', id).first();
    if (!story) throw new NotFoundError('SuccessStory');
    return story;
  }

  async createSuccessStory(data: Partial<SuccessStory>): Promise<SuccessStory> {
    const id = uuidv4();
    const slug = data.slug || data.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + id.slice(0, 8);
    await db('cms_success_stories').insert({ id, slug, ...data, is_active: true, created_at: new Date(), updated_at: new Date() });
    return this.getSuccessStoryById(id);
  }

  async updateSuccessStory(id: string, data: Partial<SuccessStory>): Promise<SuccessStory> {
    const story = await db('cms_success_stories').where('id', id).first();
    if (!story) throw new NotFoundError('SuccessStory');
    await db('cms_success_stories').where('id', id).update({ ...data, updated_at: new Date() });
    return this.getSuccessStoryById(id);
  }

  async deleteSuccessStory(id: string): Promise<void> {
    const story = await db('cms_success_stories').where('id', id).first();
    if (!story) throw new NotFoundError('SuccessStory');
    await db('cms_success_stories').where('id', id).update({ is_active: false, updated_at: new Date() });
  }
}

export const cmsService = new CmsService();
