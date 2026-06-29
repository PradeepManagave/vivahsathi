/**
 * Unit Tests: CMS Service
 *
 * Tests for content pages, testimonials, and success stories
 */

import { jest, describe, it, expect, beforeEach } from '@jest/globals';

const mockDb = {
  insert: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  first: jest.fn(),
  update: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  offset: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  count: jest.fn().mockReturnThis(),
  clone: jest.fn().mockReturnThis(),
};

jest.mock('../../src/config/database', () => ({ db: mockDb }));

jest.mock('../../src/config/logger', () => ({
  __esModule: true,
  default: { info: jest.fn(), error: jest.fn(), warn: jest.fn() },
}));

import { cmsService } from '../../src/modules/cms/cms.service';

describe('CmsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (mockDb.first as jest.Mock).mockReset();
    (mockDb.count as jest.Mock).mockReset();
  });

  describe('Pages', () => {
    it('should list pages with optional status filter', async () => {
      mockDb.orderBy.mockReturnThis();
      mockDb.offset.mockReturnThis();
      mockDb.limit.mockResolvedValue([{ id: 'p1', title: 'About Us' }]);
      (mockDb.count as jest.Mock).mockResolvedValue([{ count: '1' }]);

      const result = await cmsService.listPages({ status: 'published', page: 1, limit: 20 });
      expect(result.data).toHaveLength(1);
      expect(mockDb.where).toHaveBeenCalledWith('status', 'published');
    });

    it('should get page by slug', async () => {
      const page = { id: 'p1', slug: 'about', title: 'About Us' };
      (mockDb.first as jest.Mock).mockResolvedValue(page);

      const result = await cmsService.getPageBySlug('about');
      expect(result).toEqual(page);
    });

    it('should throw NotFoundError for missing slug', async () => {
      (mockDb.first as jest.Mock).mockResolvedValue(null);
      await expect(cmsService.getPageBySlug('nonexistent')).rejects.toThrow('Page');
    });

    it('should create a page', async () => {
      const page = { id: 'p1', title: 'Test', slug: 'test' };
      (mockDb.first as jest.Mock).mockResolvedValue(page);

      const result = await cmsService.createPage({ title: 'Test', content: '<p>Hello</p>' });
      expect(mockDb.insert).toHaveBeenCalled();
      expect(result).toEqual(page);
    });

    it('should update a page', async () => {
      (mockDb.first as jest.Mock).mockResolvedValueOnce({ id: 'p1' }).mockResolvedValueOnce({ id: 'p1', title: 'Updated' });

      const result = await cmsService.updatePage('p1', { title: 'Updated' });
      expect(mockDb.update).toHaveBeenCalled();
      expect(result.title).toBe('Updated');
    });

    it('should soft-delete a page', async () => {
      (mockDb.first as jest.Mock).mockResolvedValue({ id: 'p1' });

      await cmsService.deletePage('p1');
      expect(mockDb.update).toHaveBeenCalledWith(expect.objectContaining({ is_active: false }));
    });
  });

  describe('Testimonials', () => {
    it('should list approved testimonials', async () => {
      mockDb.orderBy.mockReturnThis();
      mockDb.offset.mockReturnThis();
      mockDb.limit.mockResolvedValue([{ id: 't1', name: 'John' }]);
      (mockDb.count as jest.Mock).mockResolvedValue([{ count: '1' }]);

      const result = await cmsService.listTestimonials({ approved: true });
      expect(result.data).toHaveLength(1);
    });

    it('should create testimonial as unapproved', async () => {
      mockDb.insert.mockResolvedValue(undefined);
      mockDb.where.mockReturnThis();
      (mockDb.first as jest.Mock).mockResolvedValue({ id: 't1', name: 'John', is_approved: false });

      const result = await cmsService.createTestimonial({ name: 'John', content: 'Great!' });
      expect(result.is_approved).toBe(false);
    });

    it('should approve testimonial', async () => {
      (mockDb.first as jest.Mock).mockResolvedValue({ id: 't1' });

      await cmsService.approveTestimonial('t1');
      expect(mockDb.update).toHaveBeenCalledWith(expect.objectContaining({ is_approved: true }));
    });
  });

  describe('Success Stories', () => {
    it('should list published stories', async () => {
      mockDb.orderBy.mockReturnThis();
      mockDb.offset.mockReturnThis();
      mockDb.limit.mockResolvedValue([{ id: 's1', title: 'Love Story' }]);
      (mockDb.count as jest.Mock).mockResolvedValue([{ count: '1' }]);

      const result = await cmsService.listSuccessStories({ status: 'published' });
      expect(result.data).toHaveLength(1);
      expect(mockDb.where).toHaveBeenCalledWith('status', 'published');
    });

    it('should get story by slug', async () => {
      const story = { id: 's1', slug: 'love-story', title: 'Love Story' };
      (mockDb.first as jest.Mock).mockResolvedValue(story);

      const result = await cmsService.getSuccessStoryBySlug('love-story');
      expect(result).toEqual(story);
    });

    it('should create a story', async () => {
      const story = { id: 's1', title: 'New Story', slug: 'new-story' };
      (mockDb.first as jest.Mock).mockResolvedValue(story);

      const result = await cmsService.createSuccessStory({ title: 'New Story', content: 'Once upon a time...' });
      expect(mockDb.insert).toHaveBeenCalled();
      expect(result).toEqual(story);
    });

    it('should update a story', async () => {
      (mockDb.first as jest.Mock).mockResolvedValueOnce({ id: 's1' }).mockResolvedValueOnce({ id: 's1', title: 'Updated' });

      const result = await cmsService.updateSuccessStory('s1', { title: 'Updated' });
      expect(mockDb.update).toHaveBeenCalled();
      expect(result.title).toBe('Updated');
    });

    it('should soft-delete a story', async () => {
      (mockDb.first as jest.Mock).mockResolvedValue({ id: 's1' });

      await cmsService.deleteSuccessStory('s1');
      expect(mockDb.update).toHaveBeenCalledWith(expect.objectContaining({ is_active: false }));
    });
  });
});
