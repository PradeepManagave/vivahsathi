// ============================================================
// Photo Service - S3 Upload, Watermarking, Compression
// ============================================================

import sharp from 'sharp';
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../../config/database';
import { config } from '../../config/index';
import logger, { log } from '../../config/logger';
import { NotFoundError, ForbiddenError, PhotoLimitError, ValidationError } from '../../shared/utils/errors';

const MAX_PHOTOS_PER_USER = 10;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const TARGET_SIZE_KB = 500;
const WATERMARK_TEXT = 'M-Plus Matrimony | vivahsathi.com';

interface PhotoUploadOptions {
  displayOrder?: number;
  isPrimary?: boolean;
  visibility?: 'all' | 'contacts' | 'hidden';
}

interface PhotoUploadResult {
  id: string;
  originalUrl: string;
  largeUrl: string;
  mediumUrl: string;
  thumbnailUrl: string;
  isPrimary: boolean;
  visibility: string;
  displayOrder: number;
  approvalStatus: string;
}

class S3Service {
  private client: S3Client;
  private bucket: string;
  private cdnUrl: string;

  constructor() {
    this.client = new S3Client({
      region: config.AWS_REGION,
      credentials: config.AWS_ACCESS_KEY_ID ? {
        accessKeyId: config.AWS_ACCESS_KEY_ID,
        secretAccessKey: config.AWS_SECRET_ACCESS_KEY!
      } : undefined
    });
    this.bucket = config.AWS_S3_BUCKET!;
    this.cdnUrl = config.AWS_CLOUDFRONT_URL || `https://${this.bucket}.s3.${config.AWS_REGION}.amazonaws.com`;
  }

  async uploadFile(
    key: string,
    buffer: Buffer,
    contentType: string,
    metadata?: Record<string, string>
  ): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      CacheControl: 'max-age=31536000',
      Metadata: metadata
    });

    await this.client.send(command);

    return `${this.cdnUrl}/${key}`;
  }

  async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key
    });

    await this.client.send(command);
  }

  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key
    });

    return await getSignedUrl(this.client, command, { expiresIn });
  }
}

export class PhotoService {
  private s3Service: S3Service;

  constructor() {
    this.s3Service = new S3Service();
  }

  async uploadPhoto(
    userId: string,
    file: Express.Multer.File,
    options: PhotoUploadOptions
  ): Promise<PhotoUploadResult> {
    if (file.size > MAX_FILE_SIZE) {
      throw new ValidationError(`File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`);
    }

    // Validate image content (dimensions, format)
    await this.validateImageContent(file.buffer);

    const profile = await db('profiles')
      .where('user_id', userId)
      .first();

    if (!profile) {
      throw new NotFoundError('Profile');
    }

    const existingPhotos = await db('photos')
      .where('profile_id', profile.id)
      .count('* as count')
      .first();

    if ((Number(existingPhotos?.count) || 0) >= MAX_PHOTOS_PER_USER) {
      throw new PhotoLimitError(MAX_PHOTOS_PER_USER);
    }

    const photoId = uuidv4();
    const timestamp = Date.now();
    const baseKey = `profiles/${userId}/${photoId}`;

    const processedImages = await this.processImage(file.buffer, baseKey);

    // Parallel S3 uploads for performance
    const [url, largeUrl, mediumUrl, thumbnailUrl] = await Promise.all([
      this.s3Service.uploadFile(
        `${baseKey}/original.webp`,
        processedImages.original,
        'image/webp',
        { userId, photoId }
      ),
      this.s3Service.uploadFile(
        `${baseKey}/large.webp`,
        processedImages.large,
        'image/webp',
        { userId, photoId, size: 'large' }
      ),
      this.s3Service.uploadFile(
        `${baseKey}/medium.webp`,
        processedImages.medium,
        'image/webp',
        { userId, photoId, size: 'medium' }
      ),
      this.s3Service.uploadFile(
        `${baseKey}/thumbnail.webp`,
        processedImages.thumbnail,
        'image/webp',
        { userId, photoId, size: 'thumbnail' }
      )
    ]);

    let displayOrder = options.displayOrder;
    if (displayOrder === undefined) {
      const maxOrder = await db('photos')
        .where('profile_id', profile.id)
        .max('display_order as max')
        .first();
      displayOrder = ((maxOrder?.max as number) || 0) + 1;
    }

    const isPrimary = options.isPrimary || (existingPhotos?.count || 0) === 0;

    if (isPrimary) {
      await db('photos')
        .where('profile_id', profile.id)
        .update({ is_primary: false });
    }

    const [photo] = await db('photos')
      .insert({
        id: photoId,
        user_id: userId,
        profile_id: profile.id,
        original_url: url,
        large_url: largeUrl,
        medium_url: mediumUrl,
        thumbnail_url: thumbnailUrl,
        display_order: displayOrder,
        is_primary: isPrimary,
        is_approved: false,
        approval_status: 'pending',
        visibility: options.visibility || 'all',
        is_protected: true,
        created_at: new Date()
      })
      .returning('*');

    logger.info('Photo uploaded', { userId, photoId });

    return {
      id: photo.id,
      originalUrl: photo.original_url,
      largeUrl: photo.large_url,
      mediumUrl: photo.medium_url,
      thumbnailUrl: photo.thumbnail_url,
      isPrimary: photo.is_primary,
      visibility: photo.visibility,
      displayOrder: photo.display_order,
      approvalStatus: photo.approval_status
    };
  }

  async updatePhoto(
    userId: string,
    photoId: string,
    updateData: { displayOrder?: number; isPrimary?: boolean; visibility?: string }
  ): Promise<Record<string, unknown>> {
    const photo = await db('photos')
      .where('id', photoId)
      .where('user_id', userId)
      .first();

    if (!photo) {
      throw new NotFoundError('Photo');
    }

    const updates: Record<string, unknown> = {};

    if (updateData.displayOrder !== undefined) {
      updates.display_order = updateData.displayOrder;
    }

    if (updateData.visibility !== undefined) {
      updates.visibility = updateData.visibility;
    }

    if (updateData.isPrimary) {
      await db('photos')
        .where('profile_id', photo.profile_id)
        .update({ is_primary: false });

      updates.is_primary = true;
    }

    if (Object.keys(updates).length > 0) {
      await db('photos')
        .where('id', photoId)
        .update(updates);
    }

    logger.info("Profile updated", { userId });

    return await db('photos').where('id', photoId).first();
  }

  async deletePhoto(userId: string, photoId: string): Promise<void> {
    const photo = await db('photos')
      .where('id', photoId)
      .where('user_id', userId)
      .first();

    if (!photo) {
      throw new NotFoundError('Photo');
    }

    const keysToDelete = [
      'original.webp',
      'large.webp',
      'medium.webp',
      'thumbnail.webp'
    ].map(suffix => `profiles/${userId}/${photoId}/${suffix}`);

    await Promise.all(
      keysToDelete.map(key => this.s3Service.deleteFile(key).catch(() => {}))
    );

    await db('photos')
      .where('id', photoId)
      .delete();

    if (photo.is_primary) {
      const nextPhoto = await db('photos')
        .where('profile_id', photo.profile_id)
        .orderBy('display_order')
        .first();

      if (nextPhoto) {
        await db('photos')
          .where('id', nextPhoto.id)
          .update({ is_primary: true });
      }
    }

    logger.info('Photo deleted', { userId, photoId });
  }

  private async validateImageContent(buffer: Buffer): Promise<void> {
    try {
      const metadata = await sharp(buffer).metadata();

      if (!metadata) {
        throw new ValidationError('Unable to read image metadata');
      }

      // Check minimum dimensions
      const MIN_WIDTH = 200;
      const MIN_HEIGHT = 200;
      if ((metadata.width || 0) < MIN_WIDTH || (metadata.height || 0) < MIN_HEIGHT) {
        throw new ValidationError(`Image must be at least ${MIN_WIDTH}x${MIN_HEIGHT} pixels`);
      }

      // Check maximum dimensions (prevent DoS with huge images)
      const MAX_DIMENSION = 10000;
      if ((metadata.width || 0) > MAX_DIMENSION || (metadata.height || 0) > MAX_DIMENSION) {
        throw new ValidationError('Image dimensions too large');
      }

      // Validate format
      const allowedFormats = ['jpeg', 'png', 'webp'];
      if (!allowedFormats.includes(metadata.format || '')) {
        throw new ValidationError('Only JPEG, PNG, and WebP images are allowed');
      }

      // Check for EXIF orientation (prevent GPS metadata leaks)
      if (metadata.exif) {
        // Strip EXIF data to remove GPS and other sensitive metadata
        log.security.sensitiveDataRemoved('Photo EXIF metadata stripped');
      }

      // Basic file signature validation (magic bytes)
      const signature = buffer.slice(0, 8);
      const isPng = signature[0] === 0x89 && signature[1] === 0x50 && signature[2] === 0x4E && signature[3] === 0x47;
      const isJpeg = signature[0] === 0xFF && signature[1] === 0xD8 && signature[2] === 0xFF;
      const isWebp = signature[0] === 0x52 && signature[1] === 0x49 && signature[2] === 0x46 && signature[3] === 0x46 &&
                     signature[8] === 0x57 && signature[9] === 0x45 && signature[10] === 0x42 && signature[11] === 0x50;

      if (!isPng && !isJpeg && !isWebp) {
        throw new ValidationError('Invalid image format');
      }
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      log.security.imageValidationFailed((error as Error).message);
      throw new ValidationError('Invalid or corrupted image file');
    }
  }

  private async processImage(
    buffer: Buffer,
    baseKey: string
  ): Promise<{
    original: Buffer;
    large: Buffer;
    medium: Buffer;
    thumbnail: Buffer;
  }> {
    const sizes = {
      original: { width: 1200, height: 1200 },
      large: { width: 800, height: 800 },
      medium: { width: 400, height: 400 },
      thumbnail: { width: 200, height: 200 }
    };

    const results: Record<string, Buffer> = {};

    for (const [sizeName, dimensions] of Object.entries(sizes)) {
      let pipeline = sharp(buffer)
        .resize(dimensions.width, dimensions.height, {
          fit: 'inside',
          withoutEnlargement: true
        });

      if (sizeName === 'original' || sizeName === 'large' || sizeName === 'medium') {
        pipeline = pipeline
          .composite([{
            input: await this.createWatermarkBuffer(),
            gravity: 'southeast'
          }]);
      }

      if (buffer.length > TARGET_SIZE_KB * 1024) {
        const quality = sizeName === 'original' ? 85 : 75;
        pipeline = pipeline.webp({ quality, effort: 4 });
      } else {
        pipeline = pipeline.webp({ quality: 90, effort: 4 });
      }

      results[sizeName] = await pipeline.toBuffer();
    }

    return results as {
      original: Buffer;
      large: Buffer;
      medium: Buffer;
      thumbnail: Buffer;
    };
  }

  private async createWatermarkBuffer(): Promise<Buffer> {
    const width = 300;
    const height = 40;

    return await sharp({
      create: {
        width,
        height,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    })
      .composite([{
        input: await sharp({
          create: {
            width,
            height,
            channels: 4,
            background: { r: 0, g: 0, b: 0, alpha: 0 }
          }
        })
          .png()
          .toBuffer(),
        blend: 'over'
      }])
      .png()
      .toBuffer();
  }

  async getPhotosForApproval(
    adminId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<Record<string, unknown>[]> {
    const photos = await db('photos')
      .join('profiles', 'photos.profile_id', 'profiles.id')
      .join('users', 'profiles.user_id', 'users.id')
      .where('photos.approval_status', 'pending')
      .select(
        'photos.*',
        'profiles.first_name as profile_first_name',
        'profiles.last_name as profile_last_name',
        'users.phone'
      )
      .orderBy('photos.created_at', 'asc')
      .limit(limit)
      .offset(offset);

    return photos;
  }

  async approvePhoto(
    adminId: string,
    photoId: string,
    approved: boolean,
    reason?: string
  ): Promise<void> {
    const photo = await db('photos')
      .where('id', photoId)
      .first();

    if (!photo) {
      throw new NotFoundError('Photo');
    }

    await db('photos')
      .where('id', photoId)
      .update({
        approval_status: approved ? 'approved' : 'rejected',
        is_approved: approved,
        reviewed_at: new Date(),
        reviewed_by: adminId,
        rejection_reason: approved ? null : reason
      });

    logger.info(`Photo ${approved ? 'approved' : 'rejected'}`, { photoId, adminId, reason });
  }
}

export const photoService = new PhotoService();
