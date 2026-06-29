import { db } from '../../config/database';
import logger from '../../config/logger';
import { AppError } from '../../shared/utils/errors';

export class CmsService {
  async createPage(data: {
    slug: string;
    title: string;
    titleHi?: string;
    titleMr?: string;
    content: string;
    contentHi?: string;
    contentMr?: string;
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
    status?: string;
    pageType?: string;
    displayOrder?: number;
  }, createdBy: string) {
    const existing = await db('static_pages').where('slug', data.slug).first();
    if (existing) {
      throw new AppError('Page with this slug already exists', 400, 'EXISTS');
    }

    const [page] = await db('static_pages')
      .insert({
        slug: data.slug,
        title: data.title,
        title_hi: data.titleHi,
        title_mr: data.titleMr,
        content: data.content,
        content_hi: data.contentHi,
        content_mr: data.contentMr,
        meta_title: data.metaTitle,
        meta_description: data.metaDescription,
        meta_keywords: data.metaKeywords,
        status: data.status || 'draft',
        page_type: data.pageType || 'custom',
        display_order: data.displayOrder || 0,
        published_at: data.status === 'published' ? db.fn.now() : null,
        created_by: createdBy,
        updated_by: createdBy
      })
      .returning('*');

    return page;
  }

  async updatePage(pageId: string, data: any, updatedBy: string) {
    const page = await db('static_pages').where('id', pageId).first();
    if (!page) {
      throw new AppError('Page not found', 404, 'NOT_FOUND');
    }

    const updateData: any = {
      title: data.title,
      title_hi: data.titleHi,
      title_mr: data.titleMr,
      content: data.content,
      content_hi: data.contentHi,
      content_mr: data.contentMr,
      meta_title: data.metaTitle,
      meta_description: data.metaDescription,
      meta_keywords: data.metaKeywords,
      display_order: data.displayOrder,
      updated_by: updatedBy
    };

    if (data.status && data.status !== page.status) {
      updateData.status = data.status;
      if (data.status === 'published' && !page.published_at) {
        updateData.published_at = db.fn.now();
      }
    }

    const [updated] = await db('static_pages')
      .where('id', pageId)
      .update(updateData)
      .returning('*');

    return updated;
  }

  async getPage(pageId: string) {
    const page = await db('static_pages').where('id', pageId).first();
    if (!page) {
      throw new AppError('Page not found', 404, 'NOT_FOUND');
    }
    return page;
  }

  async getPageBySlug(slug: string) {
    const page = await db('static_pages')
      .where('slug', slug)
      .where('status', 'published')
      .first();
    if (!page) {
      throw new AppError('Page not found', 404, 'NOT_FOUND');
    }
    return page;
  }

  async getPages(filters: { status?: string; pageType?: string }, page = 1, limit = 20) {
    const offset = (page - 1) * limit;

    let query = db('static_pages')
      .select('id', 'slug', 'title', 'status', 'page_type', 'display_order', 'published_at', 'created_at', 'updated_at')
      .orderBy('display_order', 'asc')
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);

    if (filters.status) {
      query = query.where('status', filters.status);
    }

    if (filters.pageType) {
      query = query.where('page_type', filters.pageType);
    }

    const [pages, total] = await Promise.all([
      query,
      db('static_pages').count('id as count').first()
    ]);

    return {
      data: pages,
      pagination: {
        page,
        limit,
        total: Number(total?.count || 0),
        pages: Math.ceil(Number(total?.count || 0) / limit)
      }
    };
  }

  async deletePage(pageId: string) {
    const page = await db('static_pages').where('id', pageId).first();
    if (!page) {
      throw new AppError('Page not found', 404, 'NOT_FOUND');
    }

    await db('static_pages').where('id', pageId).delete();
    return { success: true };
  }

  async getSetting(key: string) {
    const setting = await db('platform_settings').where('key', key).first();
    if (!setting) {
      return null;
    }
    return {
      key: setting.key,
      value: setting.is_encrypted ? null : setting.value,
      category: setting.category,
      description: setting.description
    };
  }

  async getSettings(category?: string) {
    let query = db('platform_settings').select('key', 'value', 'category', 'description', 'updated_at');

    if (category) {
      query = query.where('category', category);
    }

    const settings = await query;
    return settings.reduce((acc: any, s: any) => {
      acc[s.key] = s.is_encrypted ? '***ENCRYPTED***' : s.value;
      return acc;
    }, {});
  }

  async updateSetting(key: string, value: any, category: string, description?: string, updatedBy?: string) {
    const existing = await db('platform_settings').where('key', key).first();

    if (existing) {
      const [updated] = await db('platform_settings')
        .where('key', key)
        .update({
          value: JSON.stringify(value),
          category,
          description: description || existing.description,
          updated_by: updatedBy,
          updated_at: db.fn.now()
        })
        .returning('*');
      return updated;
    } else {
      const [created] = await db('platform_settings')
        .insert({
          key,
          value: JSON.stringify(value),
          category,
          description,
          updated_by: updatedBy
        })
        .returning('*');
      return created;
    }
  }

  async bulkUpdateSettings(settings: { key: string; value: any; category: string; description?: string }[], updatedBy?: string) {
    const results = await Promise.all(
      settings.map(s => this.updateSetting(s.key, s.value, s.category, s.description, updatedBy))
    );
    return results;
  }

  async createBanner(data: {
    title: string;
    imageUrl: string;
    linkUrl?: string;
    linkType?: string;
    target?: string;
    position: string;
    campaignName?: string;
    startDate?: Date;
    endDate?: Date;
    isActive?: boolean;
    displayOrder?: number;
  }, createdBy: string) {
    const [banner] = await db('banners')
      .insert({
        title: data.title,
        image_url: data.imageUrl,
        link_url: data.linkUrl,
        link_type: data.linkType || 'external',
        target: data.target || 'all',
        position: data.position,
        campaign_name: data.campaignName,
        start_date: data.startDate,
        end_date: data.endDate,
        is_active: data.isActive !== false,
        display_order: data.displayOrder || 0,
        created_by: createdBy
      })
      .returning('*');

    return banner;
  }

  async updateBanner(bannerId: string, data: any) {
    const banner = await db('banners').where('id', bannerId).first();
    if (!banner) {
      throw new AppError('Banner not found', 404, 'NOT_FOUND');
    }

    const updateData: any = {
      title: data.title,
      image_url: data.imageUrl,
      link_url: data.linkUrl,
      link_type: data.linkType,
      target: data.target,
      position: data.position,
      campaign_name: data.campaignName,
      start_date: data.startDate,
      end_date: data.endDate,
      is_active: data.isActive,
      display_order: data.displayOrder,
      updated_at: db.fn.now()
    };

    const [updated] = await db('banners')
      .where('id', bannerId)
      .update(updateData)
      .returning('*');

    return updated;
  }

  async getBanners(filters: { position?: string; isActive?: boolean }, page = 1, limit = 20) {
    const offset = (page - 1) * limit;

    let query = db('banners')
      .orderBy('display_order', 'asc')
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);

    if (filters.position) {
      query = query.where('position', filters.position);
    }

    if (typeof filters.isActive === 'boolean') {
      query = query.where('is_active', filters.isActive);
    }

    const [banners, total] = await Promise.all([
      query,
      db('banners').count('id as count').first()
    ]);

    return {
      data: banners,
      pagination: {
        page,
        limit,
        total: Number(total?.count || 0),
        pages: Math.ceil(Number(total?.count || 0) / limit)
      }
    };
  }

  async getActiveBanners(position: string) {
    const now = new Date();

    return db('banners')
      .where('position', position)
      .where('is_active', true)
      .where(function () {
        this.whereNull('start_date').orWhere('start_date', '<=', now);
      })
      .where(function () {
        this.whereNull('end_date').orWhere('end_date', '>=', now);
      })
      .orderBy('display_order', 'asc');
  }

  async deleteBanner(bannerId: string) {
    const banner = await db('banners').where('id', bannerId).first();
    if (!banner) {
      throw new AppError('Banner not found', 404, 'NOT_FOUND');
    }

    await db('banners').where('id', bannerId).delete();
    return { success: true };
  }

  async trackBannerImpression(bannerId: string) {
    await db('banners')
      .where('id', bannerId)
      .increment('impression_count', 1);
  }

  async trackBannerClick(bannerId: string) {
    await db('banners')
      .where('id', bannerId)
      .increment('click_count', 1);
  }
}
