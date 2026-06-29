import { db } from '../../config/database';
import logger from '../../config/logger';
import { NotFoundError, ValidationError } from '../../shared/utils/errors';
import { uploadService } from '../../shared/services/upload.service';
import { v4 as uuidv4 } from 'uuid';

const ALLOWED_TYPES = ['aadhaar', 'pan', 'passport', 'driving_license', 'voter_id', 'income_proof', 'education_certificate', 'photo', 'other'] as const;
type DocumentType = typeof ALLOWED_TYPES[number];

interface Document {
  id: string; userId: string; documentType: string; documentLabel?: string;
  fileKey: string; fileUrl: string; fileSize?: number; mimeType?: string;
  status: string; rejectionReason?: string; reviewedBy?: string; reviewedAt?: string;
  isActive: boolean; createdAt: string; updatedAt: string;
}

interface DocumentUploadResult extends Document { }

export class DocumentsService {
  async uploadDocument(userId: string, file: Express.Multer.File, documentType: string, label?: string): Promise<DocumentUploadResult> {
    if (!ALLOWED_TYPES.includes(documentType as any)) throw new ValidationError(`Invalid document type. Allowed: ${ALLOWED_TYPES.join(', ')}`);

    const result = await uploadService.upload(file.buffer, { mimeType: file.mimetype, prefix: `documents/${userId}` });

    const id = uuidv4();
    await db('member_documents').insert({
      id, user_id: userId, document_type: documentType, document_label: label || null,
      file_key: result.key, file_url: result.url, file_size: result.size, mime_type: result.mimeType,
      status: 'pending', is_active: true, created_at: new Date(), updated_at: new Date(),
    });

    return this.getDocumentById(id);
  }

  async getDocumentById(id: string): Promise<Document> {
    const doc = await db('member_documents').where('id', id).where('is_active', true).first();
    if (!doc) throw new NotFoundError('Document');
    return doc;
  }

  async listUserDocuments(userId: string, status?: string): Promise<Document[]> {
    let query = db('member_documents').where('user_id', userId).where('is_active', true);
    if (status) query = query.where('status', status);
    return query.orderBy('created_at', 'desc');
  }

  async listAllDocuments(params: { status?: string; documentType?: string; page?: number; limit?: number }): Promise<{ data: Document[]; page: number; pageSize: number; total: number; totalPages: number }> {
    const { status, documentType, page = 1, limit = 20 } = params;
    let query = db('member_documents').where('is_active', true);
    if (status) query = query.where('status', status);
    if (documentType) query = query.where('document_type', documentType);
    const total = (await query.clone().count('id as count').first()) as any;
    const totalCount = parseInt(total?.count || '0', 10);
    const data = await query.orderBy('created_at', 'desc').offset((page - 1) * limit).limit(limit);
    return { data, page, pageSize: limit, total: totalCount, totalPages: Math.ceil(totalCount / limit) };
  }

  async approveDocument(id: string, reviewerId: string): Promise<Document> {
    const doc = await db('member_documents').where('id', id).first();
    if (!doc) throw new NotFoundError('Document');
    await db('member_documents').where('id', id).update({ status: 'approved', reviewed_by: reviewerId, reviewed_at: new Date(), updated_at: new Date() });
    return this.getDocumentById(id);
  }

  async rejectDocument(id: string, reviewerId: string, reason: string): Promise<Document> {
    const doc = await db('member_documents').where('id', id).first();
    if (!doc) throw new NotFoundError('Document');
    await db('member_documents').where('id', id).update({ status: 'rejected', rejection_reason: reason, reviewed_by: reviewerId, reviewed_at: new Date(), updated_at: new Date() });
    return this.getDocumentById(id);
  }

  async deleteDocument(id: string): Promise<void> {
    const doc = await db('member_documents').where('id', id).first();
    if (!doc) throw new NotFoundError('Document');
    try { await uploadService.delete(doc.file_key); } catch (err) { logger.error('S3 delete failed', err); }
    await db('member_documents').where('id', id).update({ is_active: false, updated_at: new Date() });
  }
}

export const documentsService = new DocumentsService();
