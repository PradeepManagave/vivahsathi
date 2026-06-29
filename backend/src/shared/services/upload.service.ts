import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { config } from '../../config/index';
import logger from '../../config/logger';
import { v4 as uuidv4 } from 'uuid';

export interface UploadResult {
  key: string;
  url: string;
  cdnUrl?: string;
  size: number;
  mimeType: string;
}

class UploadService {
  private client: S3Client;
  private bucket: string;
  private cdnUrl: string;

  constructor() {
    this.client = new S3Client({
      region: config.AWS_REGION,
      credentials: config.AWS_ACCESS_KEY_ID ? {
        accessKeyId: config.AWS_ACCESS_KEY_ID,
        secretAccessKey: config.AWS_SECRET_ACCESS_KEY!,
      } : undefined,
    });
    this.bucket = config.AWS_S3_BUCKET!;
    this.cdnUrl = config.AWS_CLOUDFRONT_URL || '';
  }

  private getUrl(key: string): string {
    return this.cdnUrl ? `${this.cdnUrl}/${key}` : `https://${this.bucket}.s3.${config.AWS_REGION}.amazonaws.com/${key}`;
  }

  async upload(buffer: Buffer, options: { mimeType: string; prefix?: string; fileName?: string; acl?: string }): Promise<UploadResult> {
    const ext = options.mimeType.split('/')[1] || 'bin';
    const key = `${options.prefix || 'uploads'}/${uuidv4()}.${ext}`;

    await this.client.send(new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: buffer,
      ContentType: options.mimeType,
      ACL: (options.acl as any) || 'public-read',
    }));

    return { key, url: this.getUrl(key), cdnUrl: this.cdnUrl ? this.getUrl(key) : undefined, size: buffer.length, mimeType: options.mimeType };
  }

  async delete(key: string): Promise<void> {
    await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
  }

  async getSignedUrl(key: string, expiresIn = 3600): Promise<string> {
    return getSignedUrl(this.client, new GetObjectCommand({ Bucket: this.bucket, Key: key }), { expiresIn });
  }

  async uploadBase64(base64: string, options: { prefix?: string; mimeType?: string }): Promise<UploadResult> {
    const matches = base64.match(/^data:(.+);base64,(.+)$/);
    const mimeType = matches ? matches[1] : options.mimeType || 'application/octet-stream';
    const data = matches ? Buffer.from(matches[2], 'base64') : Buffer.from(base64, 'base64');
    return this.upload(data, { ...options, mimeType });
  }
}

export const uploadService = new UploadService();
