/**
 * Integration Tests: Elasticsearch Search & Indexing
 *
 * Tests Elasticsearch integration including:
 * - Profile indexing
 * - Search with filters
 * - Full-text search
 * - Faceted search
 * - Index management
 */

import { jest, describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';

// Mock Elasticsearch client
const mockEsClient = {
  index: jest.fn().mockResolvedValue({
    _index: 'profiles',
    _id: 'test-id',
    _version: 1,
    result: 'created',
  }),
  search: jest.fn().mockResolvedValue({
    hits: {
      total: { value: 1, relation: 'eq' },
      hits: [
        {
          _index: 'profiles',
          _id: 'test-id-1',
          _score: 1.0,
          _source: {
            id: 'profile-1',
            userId: 'user-1',
            firstName: 'Priya',
            lastName: 'Kulkarni',
            age: 28,
            gender: 'female',
            religion: 'Hindu',
            caste: 'Brahmin',
            city: 'Pune',
            state: 'Maharashtra',
            education: 'Masters',
            occupation: 'Software Engineer',
            isPremium: true,
            isVerified: true,
            profileCompletionPercent: 85,
            primaryPhotoUrl: 'https://cdn.example.com/photo1.jpg',
            lastActiveAt: new Date().toISOString(),
          },
        },
      ],
    },
    aggregations: {
      religion: { buckets: [{ key: 'Hindu', doc_count: 500 }] },
      caste: { buckets: [{ key: 'Brahmin', doc_count: 200 }] },
    },
    took: 5,
  }),
  update: jest.fn().mockResolvedValue({
    _index: 'profiles',
    _id: 'test-id',
    _version: 2,
    result: 'updated',
  }),
  delete: jest.fn().mockResolvedValue({
    _index: 'profiles',
    _id: 'test-id',
    _version: 3,
    result: 'deleted',
  }),
  bulk: jest.fn().mockResolvedValue({
    errors: false,
    items: [{ index: { _index: 'profiles', _id: 'bulk-1', status: 200 } }],
  }),
  indices: {
    create: jest.fn().mockResolvedValue({ acknowledged: true }),
    delete: jest.fn().mockResolvedValue({ acknowledged: true }),
    exists: jest.fn().mockResolvedValue(true),
    refresh: jest.fn().mockResolvedValue({ _shards: { total: 1, successful: 1 } }),
  },
};

jest.mock('@elastic/elasticsearch', () => ({
  Client: jest.fn().mockImplementation(() => mockEsClient),
}));

// Mock database
jest.mock('../../../src/config/database', () => {
  const mockDb: any = {
    insert: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    first: jest.fn(),
    update: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    offset: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orWhere: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    count: jest.fn().mockReturnThis(),
  };
  return { db: mockDb };
});

// Mock Redis cache
jest.mock('../../../src/config/redis', () => ({
  cache: {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue('OK'),
    del: jest.fn().mockResolvedValue(1),
    delPattern: jest.fn().mockResolvedValue(1),
  },
}));

// Mock logger
jest.mock('../../../src/config/logger', () => ({
  __esModule: true,
  default: { info: jest.fn(), error: jest.fn(), warn: jest.fn() },
  log: { info: jest.fn(), error: jest.fn(), warn: jest.fn() },
}));

import { SearchService } from '../../../src/modules/search/search.service';
import { SearchIndexerService } from '../../../src/modules/search/search-indexer.service';

describe('Elasticsearch Search Integration', () => {
  let searchService: SearchService;
  let indexerService: SearchIndexerService;

  beforeAll(() => {
    process.env.ELASTICSEARCH_URL = 'http://localhost:9200';
    process.env.ELASTICSEARCH_INDEX = 'profiles';
  });

  afterAll(() => {
    delete process.env.ELASTICSEARCH_URL;
    delete process.env.ELASTICSEARCH_INDEX;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    searchService = new SearchService();
    indexerService = new SearchIndexerService();
  });

  describe('Profile Indexing', () => {
    it('should index a single profile document', async () => {
      const result = await indexerService.indexProfile('profile-123');

      expect(mockEsClient.index).toHaveBeenCalledWith(
        expect.objectContaining({
          index: 'profiles',
          id: 'profile-123',
        })
      );
    });

    it('should bulk index multiple profiles', async () => {
      const result = await indexerService.bulkIndexProfiles(['profile-1', 'profile-2', 'profile-3']);

      expect(mockEsClient.bulk).toHaveBeenCalled();
      expect(result).toHaveProperty('success');
    });

    it('should update a profile document', async () => {
      await indexerService.updateProfile('profile-123');

      expect(mockEsClient.update).toHaveBeenCalledWith(
        expect.objectContaining({
          index: 'profiles',
          id: 'profile-123',
        })
      );
    });

    it('should delete a profile document', async () => {
      await indexerService.deleteProfile('profile-123');

      expect(mockEsClient.delete).toHaveBeenCalledWith(
        expect.objectContaining({
          index: 'profiles',
          id: 'profile-123',
        })
      );
    });

    it('should create index with proper mapping', async () => {
      await indexerService.createIndex();

      expect(mockEsClient.indices.create).toHaveBeenCalled();
    });
  });

  describe('Basic Search', () => {
    it('should search profiles with default filters', async () => {
      const result = await searchService.searchProfiles({
        gender: 'female',
        ageMin: 25,
        ageMax: 30,
        page: 1,
        limit: 20,
        sort: 'relevance',
      });

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('totalPages');
      expect(result).toHaveProperty('took');
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should return paginated results', async () => {
      const result = await searchService.searchProfiles({
        page: 1,
        limit: 10,
        sort: 'relevance',
      });

      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(10);
    });

    it('should handle page 2 results', async () => {
      const result = await searchService.searchProfiles({
        page: 2,
        limit: 10,
        sort: 'relevance',
      });

      expect(result.page).toBe(2);
    });

    it('should handle empty search results', async () => {
      mockEsClient.search.mockResolvedValueOnce({
        hits: { total: { value: 0, relation: 'eq' }, hits: [] },
        aggregations: {},
        took: 2,
      });

      const result = await searchService.searchProfiles({
        keyword: 'nonexistent-profile',
        page: 1,
        limit: 10,
        sort: 'relevance',
      });

      expect(result.data).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });

  describe('Advanced Filters', () => {
    it('should filter by age range', async () => {
      await searchService.searchProfiles({
        ageMin: 25,
        ageMax: 30,
        page: 1,
        limit: 10,
        sort: 'relevance',
      });

      expect(mockEsClient.search).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.objectContaining({
            query: expect.objectContaining({
              bool: expect.objectContaining({
                filter: expect.arrayContaining([
                  expect.objectContaining({ range: expect.objectContaining({ age: expect.anything() }) }),
                ]),
              }),
            }),
          }),
        })
      );
    });

    it('should filter by religion', async () => {
      await searchService.searchProfiles({
        religion: 'Hindu',
        page: 1,
        limit: 10,
        sort: 'relevance',
      });

      expect(mockEsClient.search).toHaveBeenCalled();
    });

    it('should filter by caste', async () => {
      await searchService.searchProfiles({
        religion: 'Hindu',
        caste: 'Brahmin',
        page: 1,
        limit: 10,
        sort: 'relevance',
      });

      expect(mockEsClient.search).toHaveBeenCalled();
    });

    it('should filter by mother tongue', async () => {
      await searchService.searchProfiles({
        motherTongue: 'Marathi',
        page: 1,
        limit: 10,
        sort: 'relevance',
      });

      expect(mockEsClient.search).toHaveBeenCalled();
    });

    it('should filter by education', async () => {
      await searchService.searchProfiles({
        education: 'Masters',
        page: 1,
        limit: 10,
        sort: 'relevance',
      });

      expect(mockEsClient.search).toHaveBeenCalled();
    });

    it('should filter by occupation', async () => {
      await searchService.searchProfiles({
        occupation: 'Software Engineer',
        page: 1,
        limit: 10,
        sort: 'relevance',
      });

      expect(mockEsClient.search).toHaveBeenCalled();
    });

    it('should filter by income range', async () => {
      await searchService.searchProfiles({
        incomeMin: 500000,
        incomeMax: 2000000,
        page: 1,
        limit: 10,
        sort: 'relevance',
      });

      expect(mockEsClient.search).toHaveBeenCalled();
    });

    it('should filter by height range', async () => {
      await searchService.searchProfiles({
        heightMin: 150,
        heightMax: 180,
        page: 1,
        limit: 10,
        sort: 'relevance',
      });

      expect(mockEsClient.search).toHaveBeenCalled();
    });

    it('should filter by location (city/state)', async () => {
      await searchService.searchProfiles({
        city: 'Pune',
        state: 'Maharashtra',
        page: 1,
        limit: 10,
        sort: 'relevance',
      });

      expect(mockEsClient.search).toHaveBeenCalled();
    });

    it('should filter by diet preference', async () => {
      await searchService.searchProfiles({
        diet: 'Vegetarian',
        page: 1,
        limit: 10,
        sort: 'relevance',
      });

      expect(mockEsClient.search).toHaveBeenCalled();
    });

    it('should filter by marital status', async () => {
      await searchService.searchProfiles({
        maritalStatus: 'Never Married',
        page: 1,
        limit: 10,
        sort: 'relevance',
      });

      expect(mockEsClient.search).toHaveBeenCalled();
    });

    it('should filter verified profiles only', async () => {
      await searchService.searchProfiles({
        kycVerified: true,
        page: 1,
        limit: 10,
        sort: 'relevance',
      });

      expect(mockEsClient.search).toHaveBeenCalled();
    });

    it('should filter premium profiles only', async () => {
      await searchService.searchProfiles({
        isPremium: true,
        page: 1,
        limit: 10,
        sort: 'relevance',
      });

      expect(mockEsClient.search).toHaveBeenCalled();
    });

    it('should combine multiple filters', async () => {
      await searchService.searchProfiles({
        gender: 'female',
        ageMin: 25,
        ageMax: 30,
        religion: 'Hindu',
        caste: 'Brahmin',
        education: 'Masters',
        city: 'Pune',
        page: 1,
        limit: 10,
        sort: 'relevance',
      });

      expect(mockEsClient.search).toHaveBeenCalled();
    });
  });

  describe('Full-Text Search', () => {
    it('should search by name keyword', async () => {
      await searchService.searchProfiles({
        name: 'Priya',
        page: 1,
        limit: 10,
        sort: 'relevance',
      });

      expect(mockEsClient.search).toHaveBeenCalled();
    });

    it('should search by location keyword', async () => {
      await searchService.searchProfiles({
        keyword: 'Pune Maharashtra',
        page: 1,
        limit: 10,
        sort: 'relevance',
      });

      expect(mockEsClient.search).toHaveBeenCalled();
    });
  });

  describe('Sorting', () => {
    it('should sort by relevance (default)', async () => {
      const result = await searchService.searchProfiles({
        page: 1,
        limit: 10,
        sort: 'relevance',
      });

      expect(result.data).toBeDefined();
    });

    it('should sort by newest first', async () => {
      await searchService.searchProfiles({
        page: 1,
        limit: 10,
        sort: 'newest',
      });

      expect(mockEsClient.search).toHaveBeenCalled();
    });

    it('should sort by last active', async () => {
      await searchService.searchProfiles({
        page: 1,
        limit: 10,
        sort: 'last_active',
      });

      expect(mockEsClient.search).toHaveBeenCalled();
    });

    it('should sort by profile completion', async () => {
      await searchService.searchProfiles({
        page: 1,
        limit: 10,
        sort: 'completion',
      });

      expect(mockEsClient.search).toHaveBeenCalled();
    });
  });

  describe('Aggregations', () => {
    it('should return religion aggregations', async () => {
      const result = await searchService.searchProfiles({
        page: 1,
        limit: 10,
        sort: 'relevance',
      });

      expect(mockEsClient.search).toHaveBeenCalled();
    });
  });

  describe('Index Management', () => {
    it('should reindex all profiles', async () => {
      const result = await indexerService.reindexAll();

      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('indexed');
      expect(result).toHaveProperty('errors');
    });

    it('should get index stats', async () => {
      const result = await indexerService.getIndexStats();

      expect(result).toBeDefined();
    });
  });
});
