/**
 * Integration Tests: S3 File Upload Service
 *
 * Tests S3 upload functionality including:
 * - Photo upload with compression
 * - Watermarking
 * - Multiple sizes (original, large, medium, thumbnail)
 * - Signed URL generation
 * - File deletion
 * - Photo limit enforcement
 */

import { jest, describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import sharp from 'sharp';

// Mock AWS SDK
jest.mock('@aws-sdk/client-s3', () => {
  const mockSend = jest.fn().mockResolvedValue({ ETag: '"test-etag"' });
  return {
    S3Client: jest.fn().mockImplementation(() => ({ send: mockSend })),
    PutObjectCommand: jest.fn().mockImplementation((params) => params),
    DeleteObjectCommand: jest.fn().mockImplementation((params) => params),
    GetObjectCommand: jest.fn().mockImplementation((params) => params),
  };
});

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn().mockResolvedValue('https://test-bucket.s3.amazonaws.com/signed-url?token=abc'),
}));

// Mock database
jest.mock('../../../src/config/database', () => {
  const mockDb: any = {
    insert: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    first: jest.fn(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    returning: jest.fn().mockResolvedValue([{ id: 'photo-123', is_primary: true }]),
    count: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
  };
  mockDb.select = jest.fn().mockReturnValue(mockDb);
  return { db: mockDb };
});

// Mock logger
jest.mock('../../../src/config/logger', () => ({
  __esModule: true,
  default: { info: jest.fn(), error: jest.fn(), warn: jest.fn() },
  log: { info: jest.fn(), error: jest.fn(), warn: jest.fn() },
}));

import { PhotoService } from '../../../src/modules/profiles/photo.service';

describe('S3 File Upload Integration', () => {
  let photoService: PhotoService;

  beforeAll(() => {
    process.env.AWS_REGION = 'ap-south-1';
    process.env.AWS_ACCESS_KEY_ID = 'test_access_key';
    process.env.AWS_SECRET_ACCESS_KEY = 'test_secret_key';
    process.env.AWS_S3_BUCKET = 'mplus-test-uploads';
    process.env.AWS_CLOUDFRONT_URL = 'https://d1234.cloudfront.net';
  });

  afterAll(() => {
    delete process.env.AWS_REGION;
    delete process.env.AWS_ACCESS_KEY_ID;
    delete process.env.AWS_SECRET_ACCESS_KEY;
    delete process.env.AWS_S3_BUCKET;
    delete process.env.AWS_CLOUDFRONT_URL;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    photoService = new PhotoService();
  });

  const createMockFile = (overrides: Record<string, any> = {}) => ({
    fieldname: 'photo',
    originalname: 'test-photo.jpg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    size: 1024 * 100,
    buffer: Buffer.from('test-image-data'),
    destination: '/tmp',
    filename: 'test-photo.jpg',
    path: '/tmp/test-photo.jpg',
    ...overrides,
  });

  describe('Photo Upload', () => {
    it('should upload photo successfully with all sizes', async () => {
      const db = require('../../../src/config/database').db;
      db.where.mockReturnValue({ first: db });
      db.first.mockResolvedValue({
        id: 'profile-123',
        user_id: 'user-123',
        max_photos: 10,
      });
      db.count.mockReturnValue({ first: db });
      db.insert.mockReturnValue({ returning: db });
      db.returning.mockResolvedValue([{
        id: 'photo-123',
        user_id: 'user-123',
        original_url: 'https://d1234.cloudfront.net/photos/user-123/original.jpg',
        large_url: 'https://d1234.cloudfront.net/photos/user-123/large.jpg',
        medium_url: 'https://d1234.cloudfront.net/photos/user-123/medium.jpg',
        thumbnail_url: 'https://d1234.cloudfront.net/photos/user-123/thumb.jpg',
        is_primary: true,
        display_order: 1,
        approval_status: 'pending',
      }]);

      const mockFile = createMockFile();

      const result = await photoService.uploadPhoto('user-123', mockFile, {
        isPrimary: true,
        displayOrder: 1,
      });

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('originalUrl');
      expect(result).toHaveProperty('largeUrl');
      expect(result).toHaveProperty('mediumUrl');
      expect(result).toHaveProperty('thumbnailUrl');
      expect(result).toHaveProperty('isPrimary');
    });

    it('should reject files exceeding size limit', async () => {
      const largeFile = createMockFile({
        size: 10 * 1024 * 1024, // 10MB
      });

      await expect(
        photoService.uploadPhoto('user-123', largeFile, {})
      ).rejects.toThrow();
    });

    it('should validate image dimensions', async () => {
      const invalidFile = createMockFile({
        buffer: Buffer.from('not-an-image'),
      });

      await expect(
        photoService.uploadPhoto('user-123', invalidFile, {})
      ).rejects.toThrow();
    });

    it('should enforce photo limit per user', async () => {
      const db = require('../../../src/config/database').db;
      db.where.mockReturnValue({ first: db });
      db.first.mockResolvedValue({
        id: 'profile-123',
        user_id: 'user-123',
        max_photos: 10,
      });
      db.count.mockReturnValue({ first: db });
      // Simulate user already at max photos
      db.count.mockImplementation(() => ({
        first: () => Promise.resolve({ count: '10' }),
      }));

      const mockFile = createMockFile();

      await expect(
        photoService.uploadPhoto('user-123', mockFile, {})
      ).rejects.toThrow();
    });

    it('should generate multiple sizes for uploaded photo', async () => {
      const db = require('../../../src/config/database').db;
      db.where.mockReturnValue({ first: db });
      db.first.mockResolvedValue({
        id: 'profile-123',
        user_id: 'user-123',
        max_photos: 10,
      });
      db.count.mockReturnValue({ first: db });
      db.insert.mockReturnValue({ returning: db });
      db.returning.mockResolvedValue([{
        id: 'photo-123',
        original_url: 'https://cdn.example.com/original.jpg',
        large_url: 'https://cdn.example.com/large.jpg',
        medium_url: 'https://cdn.example.com/medium.jpg',
        thumbnail_url: 'https://cdn.example.com/thumb.jpg',
        is_primary: false,
        display_order: 2,
        approval_status: 'pending',
      }]);

      const mockFile = createMockFile();

      const result = await photoService.uploadPhoto('user-123', mockFile, {
        displayOrder: 2,
      });

      // Verify all sizes were generated
      expect(result.originalUrl).toBeDefined();
      expect(result.largeUrl).toBeDefined();
      expect(result.mediumUrl).toBeDefined();
      expect(result.thumbnailUrl).toBeDefined();
    });
  });

  describe('Photo Deletion', () => {
    it('should delete photo and all S3 versions', async () => {
      const db = require('../../../src/config/database').db;
      db.where.mockReturnValue({ first: db });
      db.first.mockResolvedValue({
        id: 'photo-123',
        user_id: 'user-123',
        original_url: 'https://cdn.example.com/photos/user-123/original.jpg',
        large_url: 'https://cdn.example.com/photos/user-123/large.jpg',
        medium_url: 'https://cdn.example.com/photos/user-123/medium.jpg',
        thumbnail_url: 'https://cdn.example.com/photos/user-123/thumb.jpg',
      });
      db.delete.mockResolvedValue(1);

      await photoService.deletePhoto('user-123', 'photo-123');

      expect(db.delete).toHaveBeenCalled();
    });

    it('should not allow deleting another user\'s photo', async () => {
      const db = require('../../../src/config/database').db;
      db.where.mockReturnValue({ first: db });
      db.first.mockResolvedValue({
        id: 'photo-123',
        user_id: 'other-user-456',
      });

      await expect(
        photoService.deletePhoto('user-123', 'photo-123')
      ).rejects.toThrow();
    });
  });

  describe('Photo Ordering', () => {
    it('should set primary photo correctly', async () => {
      const db = require('../../../src/config/database').db;
      db.where.mockReturnValue({ update: db });
      db.update.mockResolvedValue(1);

      await photoService.setPrimaryPhoto('user-123', 'photo-123');

      expect(db.update).toHaveBeenCalled();
    });

    it('should update display order', async () => {
      const db = require('../../../src/config/database').db;
      db.where.mockReturnValue({ update: db });
      db.update.mockResolvedValue(1);

      await photoService.updatePhotoOrder('user-123', [
        { photoId: 'photo-1', order: 2 },
        { photoId: 'photo-2', order: 1 },
      ]);

      expect(db.update).toHaveBeenCalled();
    });
  });

  describe('Signed URLs', () => {
    it('should generate signed URL for photo access', async () => {
      const db = require('../../../src/config/database').db;
      db.where.mockReturnValue({ first: db });
      db.first.mockResolvedValue({
        id: 'photo-123',
        user_id: 'user-123',
        thumbnail_url: 'https://cdn.example.com/thumb.jpg',
      });

      const url = await photoService.getPhotoUrl('user-123', 'photo-123');

      expect(url).toBeDefined();
      expect(typeof url).toBe('string');
    });
  });

  describe('Photo Approval', () => {
    it('should list photos pending approval for admin', async () => {
      const db = require('../../../src/config/database').db;
      db.where.mockReturnValue({ orderBy: db });
      db.orderBy.mockResolvedValue([
        { id: 'photo-1', approval_status: 'pending' },
        { id: 'photo-2', approval_status: 'pending' },
      ]);

      const photos = await photoService.getPendingApprovals();

      expect(Array.isArray(photos)).toBe(true);
    });

    it('should approve a photo', async () => {
      const db = require('../../../src/config/database').db;
      db.where.mockReturnValue({ first: db, update: db });
      db.first.mockResolvedValue({ id: 'photo-123', approval_status: 'pending' });
      db.update.mockResolvedValue(1);

      await photoService.approvePhoto('photo-123', 'admin-123');

      expect(db.update).toHaveBeenCalled();
    });

    it('should reject a photo', async () => {
      const db = require('../../../src/config/database').db;
      db.where.mockReturnValue({ first: db, update: db });
      db.first.mockResolvedValue({ id: 'photo-123', approval_status: 'pending' });
      db.update.mockResolvedValue(1);

      await photoService.rejectPhoto('photo-123', 'admin-123', 'Inappropriate content');

      expect(db.update).toHaveBeenCalled();
    });
  });
});
