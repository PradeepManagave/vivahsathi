/**
 * Unit Tests: Analytics Service
 *
 * Tests for dashboard stats, revenue reports, and activity reports
 */

import { jest, describe, it, expect, beforeEach } from '@jest/globals';

const mockDb = {
  where: jest.fn().mockReturnThis(),
  whereRaw: jest.fn().mockReturnThis(),
  first: jest.fn(),
  count: jest.fn().mockReturnThis(),
  sum: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  groupByRaw: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  orderByRaw: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  clone: jest.fn().mockReturnThis(),
  raw: jest.fn(),
};

jest.mock('../../src/config/database', () => ({ db: mockDb }));

jest.mock('../../src/config/logger', () => ({
  __esModule: true,
  default: { info: jest.fn(), error: jest.fn(), warn: jest.fn() },
}));

import { analyticsService } from '../../src/modules/analytics/analytics.service';

describe('AnalyticsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getDashboardStats', () => {
    it('should return dashboard stats from aggregated queries', async () => {
      mockDb.clone.mockReturnThis();

      (mockDb.count as jest.Mock).mockImplementation(() => ({
        first: jest.fn().mockResolvedValue({ count: '100' }),
      }));
      (mockDb.sum as jest.Mock).mockImplementation(() => ({
        first: jest.fn().mockResolvedValue({ total: '50000' }),
      }));

      mockDb.whereRaw = jest.fn().mockReturnThis();
      mockDb.count = jest.fn().mockReturnThis();
      mockDb.sum = jest.fn().mockReturnThis();

      (mockDb.count as jest.Mock).mockReturnValue({
        first: jest.fn().mockResolvedValue({ count: '100' }),
      });
      (mockDb.sum as jest.Mock).mockReturnValue({
        first: jest.fn().mockResolvedValue({ total: '50000' }),
      });

      mockDb.first = jest.fn()
        .mockResolvedValueOnce({ count: '100' })
        .mockResolvedValueOnce({ count: '80' })
        .mockResolvedValueOnce({ count: '5' })
        .mockResolvedValueOnce({ total: '1000' })
        .mockResolvedValueOnce({ total: '25000' })
        .mockResolvedValueOnce({ total: '500000' })
        .mockResolvedValueOnce({ count: '20' })
        .mockResolvedValueOnce({ count: '15' })
        .mockResolvedValueOnce({ count: '10' });

      const stats = await analyticsService.getDashboardStats();

      expect(stats.totalUsers).toBe(100);
      expect(stats.revenueToday).toBe(1000);
      expect(stats.revenueThisMonth).toBe(25000);
      expect(stats.totalRevenue).toBe(500000);
    });
  });

  describe('getRevenueReport', () => {
    it('should return revenue data by period', async () => {
      mockDb.select.mockReturnThis();
      mockDb.groupByRaw.mockReturnThis();
      mockDb.orderByRaw.mockReturnThis();
      mockDb.limit.mockResolvedValue([
        { period: '2026-01-01', amount: 50000, count: 10 },
        { period: '2026-02-01', amount: 75000, count: 15 },
      ]);

      const result = await analyticsService.getRevenueReport('monthly');
      expect(result).toHaveLength(2);
      expect(result[0].amount).toBe(50000);
    });
  });

  describe('getActivityReport', () => {
    it('should return activity data grouped by date', async () => {
      mockDb.select.mockReturnThis();
      mockDb.groupByRaw.mockReturnThis();
      mockDb.orderByRaw.mockReturnThis();

      mockDb.raw = jest.fn().mockReturnValue('2026-01-01');
      mockDb.limit.mockResolvedValue([
        { date: '2026-01-01', registrations: 10, logins: 50, profile_updates: 20, searches: 100, messages_sent: 200 },
      ]);

      const result = await analyticsService.getActivityReport();
      expect(result).toHaveLength(1);
      expect(result[0].registrations).toBe(10);
    });
  });
});
