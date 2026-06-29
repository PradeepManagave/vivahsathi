/**
 * Unit Tests: Marketplace Service
 *
 * Tests for vendor, classified, and category CRUD operations
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
  increment: jest.fn().mockReturnThis(),
  clone: jest.fn().mockReturnThis(),
};

jest.mock('../../src/config/database', () => ({ db: mockDb }));

jest.mock('../../src/config/logger', () => ({
  __esModule: true,
  default: { info: jest.fn(), error: jest.fn(), warn: jest.fn() },
}));

import { marketplaceService } from '../../src/modules/marketplace/marketplace.service';

describe('MarketplaceService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (mockDb.first as jest.Mock).mockReset();
    (mockDb.count as jest.Mock).mockReset();
  });

  describe('listVendors', () => {
    it('should return paginated vendors', async () => {
      const vendors = [{ id: 'v1', business_name: 'Test Vendor' }];
      mockDb.orderBy.mockReturnThis();
      mockDb.offset.mockReturnThis();
      mockDb.limit.mockResolvedValue(vendors);
      (mockDb.count as jest.Mock).mockResolvedValue([{ count: '1' }]);

      const result = await marketplaceService.listVendors({ page: 1, limit: 20 });

      expect(result.data).toEqual(vendors);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
    });

    it('should filter by category', async () => {
      mockDb.orderBy.mockReturnThis();
      mockDb.offset.mockReturnThis();
      mockDb.limit.mockResolvedValue([]);
      (mockDb.count as jest.Mock).mockResolvedValue([{ count: '0' }]);

      await marketplaceService.listVendors({ page: 1, limit: 20, categoryId: 'cat1' });

      expect(mockDb.where).toHaveBeenCalledWith('is_active', true);
      expect(mockDb.where).toHaveBeenCalledWith('category_id', 'cat1');
    });
  });

  describe('getVendorById', () => {
    it('should return vendor if found', async () => {
      const vendor = { id: 'v1', business_name: 'Test Vendor' };
      (mockDb.first as jest.Mock).mockResolvedValue(vendor);

      const result = await marketplaceService.getVendorById('v1');
      expect(result).toEqual(vendor);
    });

    it('should throw NotFoundError if not found', async () => {
      (mockDb.first as jest.Mock).mockResolvedValue(null);

      await expect(marketplaceService.getVendorById('nonexistent')).rejects.toThrow('Vendor');
    });
  });

  describe('createVendor', () => {
    it('should create a vendor and return it', async () => {
      const newVendor = { id: 'v1', business_name: 'New Vendor' };
      (mockDb.first as jest.Mock).mockResolvedValue(newVendor);

      const result = await marketplaceService.createVendor({ businessName: 'New Vendor', email: 'test@test.com', phone: '1234567890', categoryId: 'cat1' });

      expect(mockDb.insert).toHaveBeenCalled();
      expect(result).toEqual(newVendor);
    });
  });

  describe('updateVendor', () => {
    it('should update vendor if exists', async () => {
      (mockDb.first as jest.Mock).mockResolvedValueOnce({ id: 'v1' }).mockResolvedValueOnce({ id: 'v1', business_name: 'Updated' });

      const result = await marketplaceService.updateVendor('v1', { businessName: 'Updated' });
      expect(mockDb.update).toHaveBeenCalled();
      expect(result.business_name).toBe('Updated');
    });

    it('should throw NotFoundError if vendor missing', async () => {
      (mockDb.first as jest.Mock).mockResolvedValue(null);
      await expect(marketplaceService.updateVendor('nonexistent', {})).rejects.toThrow('Vendor');
    });
  });

  describe('deleteVendor', () => {
    it('should soft-delete vendor', async () => {
      (mockDb.first as jest.Mock).mockResolvedValue({ id: 'v1' });

      await marketplaceService.deleteVendor('v1');
      expect(mockDb.update).toHaveBeenCalledWith(expect.objectContaining({ is_active: false }));
    });

    it('should throw if not found', async () => {
      (mockDb.first as jest.Mock).mockResolvedValue(null);
      await expect(marketplaceService.deleteVendor('nonexistent')).rejects.toThrow('Vendor');
    });
  });

  describe('listClassifieds', () => {
    it('should return paginated classifieds', async () => {
      mockDb.orderBy.mockReturnThis();
      mockDb.offset.mockReturnThis();
      mockDb.limit.mockResolvedValue([{ id: 'c1', title: 'Test' }]);
      (mockDb.count as jest.Mock).mockResolvedValue([{ count: '1' }]);

      const result = await marketplaceService.listClassifieds({ page: 1, limit: 20 });
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });
  });

  describe('getClassifiedById', () => {
    it('should increment views on fetch', async () => {
      (mockDb.first as jest.Mock).mockResolvedValue({ id: 'c1', title: 'Test' });

      await marketplaceService.getClassifiedById('c1');
      expect(mockDb.increment).toHaveBeenCalledWith('views', 1);
    });
  });

  describe('categories', () => {
    it('should list categories', async () => {
      mockDb.orderBy.mockResolvedValue([{ id: 'cat1', name: 'Wedding Planners' }]);

      const result = await marketplaceService.listCategories();
      expect(result).toHaveLength(1);
    });

    it('should filter categories by type', async () => {
      mockDb.orderBy.mockResolvedValue([]);
      await marketplaceService.listCategories('vendor');
      expect(mockDb.where).toHaveBeenCalledWith('type', 'vendor');
    });

    it('should throw NotFoundError for missing category', async () => {
      (mockDb.first as jest.Mock).mockResolvedValue(null);
      await expect(marketplaceService.getCategoryById('nonexistent')).rejects.toThrow('Category');
    });
  });

  describe('inquiries', () => {
    it('should submit inquiry for valid vendor', async () => {
      (mockDb.first as jest.Mock).mockResolvedValue({ id: 'v1' });
      mockDb.insert.mockResolvedValue(undefined);

      await marketplaceService.submitVendorInquiry({ vendorId: 'v1', name: 'Test', email: 'test@test.com', message: 'Hello' });
      expect(mockDb.insert).toHaveBeenCalled();
    });

    it('should throw for invalid vendor', async () => {
      (mockDb.first as jest.Mock).mockResolvedValue(null);
      await expect(marketplaceService.submitVendorInquiry({ vendorId: 'bad', name: 'Test', email: 'test@test.com', message: 'Hello' })).rejects.toThrow('Vendor');
    });
  });
});
