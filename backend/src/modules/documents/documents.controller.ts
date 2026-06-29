import { Request, Response, NextFunction } from 'express';
import { documentsService } from './documents.service';
import { successResponse } from '../../shared/utils/response';

export class DocumentsController {
  async upload(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) return res.status(400).json({ success: false, error: { message: 'No file provided' } });
      const doc = await documentsService.uploadDocument((req as any).user.id, req.file, req.body.documentType, req.body.label);
      res.status(201).json(successResponse(doc, 'Document uploaded'));
    } catch (error) { next(error); }
  }

  async listMyDocuments(req: Request, res: Response, next: NextFunction) {
    try {
      const { status } = req.query;
      const docs = await documentsService.listUserDocuments((req as any).user.id, status as string);
      res.json(successResponse(docs));
    } catch (error) { next(error); }
  }

  async getDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const doc = await documentsService.getDocumentById(req.params.id);
      res.json(successResponse(doc));
    } catch (error) { next(error); }
  }

  async deleteDocument(req: Request, res: Response, next: NextFunction) {
    try {
      await documentsService.deleteDocument(req.params.id);
      res.json(successResponse(null, 'Document deleted'));
    } catch (error) { next(error); }
  }

  async listAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, documentType, page = '1', limit = '20' } = req.query;
      const result = await documentsService.listAllDocuments({ status: status as string, documentType: documentType as string, page: parseInt(page as string, 10), limit: parseInt(limit as string, 10) });
      res.json(successResponse(result));
    } catch (error) { next(error); }
  }

  async approve(req: Request, res: Response, next: NextFunction) {
    try {
      const doc = await documentsService.approveDocument(req.params.id, (req as any).user.id);
      res.json(successResponse(doc, 'Document approved'));
    } catch (error) { next(error); }
  }

  async reject(req: Request, res: Response, next: NextFunction) {
    try {
      const doc = await documentsService.rejectDocument(req.params.id, (req as any).user.id, req.body.reason);
      res.json(successResponse(doc, 'Document rejected'));
    } catch (error) { next(error); }
  }
}

export const documentsController = new DocumentsController();
