import { Request, Response } from 'express';
import { VideoKycService, VideoKycSession, KycSlot } from './video-kyc.service';
import { success, created } from '../../shared/utils/response';
import { AppError } from '../../shared/utils/errors';

export class VideoKycController {
  private service: VideoKycService;

  constructor() {
    this.service = new VideoKycService();
  }

  createSession = async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const { sessionType, scheduledAt } = req.body;

      const session = await this.service.createSession(
        userId,
        sessionType || 'video_verification',
        scheduledAt ? new Date(scheduledAt) : undefined
      );
      success(res, session, 'KYC session created', 201);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to create session', 500, 'CREATE_FAILED');
    }
  };

  getMySessions = async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const { status } = req.query;

      const sessions = await this.service.getUserSessions(userId, status as string);
      success(res, sessions);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to get sessions', 500, 'GET_FAILED');
    }
  };

  getMyKycStatus = async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const status = await this.service.getUserKycStatus(userId);
      success(res, status);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to get KYC status', 500, 'GET_FAILED');
    }
  };

  getAvailableSlots = async (req: Request, res: Response) => {
    try {
      const { centreId, date } = req.query;
      const slots = await this.service.getAvailableSlots(
        centreId as string | undefined,
        date as string | undefined
      );
      success(res, slots);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to get slots', 500, 'GET_FAILED');
    }
  };

  bookSlot = async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const { slotId } = req.body;

      const session = await this.service.bookSlot(userId, slotId);
      success(res, session, 'KYC slot booked successfully', 201);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to book slot', 500, 'BOOK_FAILED');
    }
  };

  createSlot = async (req: Request, res: Response) => {
    try {
      const staffId = req.user!.id;
      const { centreId, slotDate, startTime, endTime, kycType, maxParticipants } = req.body;

      const slot = await this.service.scheduleSlot(staffId, {
        centreId,
        slotDate,
        startTime,
        endTime,
        kycType,
        maxParticipants
      });
      success(res, slot, 'KYC slot created', 201);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to create slot', 500, 'CREATE_FAILED');
    }
  };

  joinSession = async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const { sessionId } = req.params;

      const session = await this.service.joinSession(sessionId, userId);
      success(res, session, 'Session joined');
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to join session', 500, 'JOIN_FAILED');
    }
  };

  completeSession = async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const { sessionId } = req.params;
      const { notes, recordingUrl } = req.body;

      const session = await this.service.completeSession(sessionId, userId, notes, recordingUrl);
      success(res, session, 'Session completed');
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to complete session', 500, 'COMPLETE_FAILED');
    }
  };

  cancelSession = async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const { sessionId } = req.params;
      const { reason } = req.body;

      const session = await this.service.cancelSession(sessionId, userId, reason);
      success(res, session, 'Session cancelled');
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to cancel session', 500, 'CANCEL_FAILED');
    }
  };

  approveKyc = async (req: Request, res: Response) => {
    try {
      const reviewerId = req.user!.id;
      const { sessionId } = req.params;
      const { notes } = req.body;

      const session = await this.service.approveKyc(sessionId, reviewerId, notes);
      success(res, session, 'KYC approved successfully. Verified badge added to profile.');
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to approve KYC', 500, 'APPROVE_FAILED');
    }
  };

  rejectKyc = async (req: Request, res: Response) => {
    try {
      const reviewerId = req.user!.id;
      const { sessionId } = req.params;
      const { reason } = req.body;

      const session = await this.service.rejectKyc(sessionId, reviewerId, reason);
      success(res, session, 'KYC rejected');
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to reject KYC', 500, 'REJECT_FAILED');
    }
  };

  submitDocument = async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const { documentType, documentNumber, frontImageUrl, backImageUrl, expiryDate } = req.body;

      const document = await this.service.submitDocument(
        userId,
        documentType,
        documentNumber,
        frontImageUrl,
        backImageUrl,
        expiryDate ? new Date(expiryDate) : undefined
      );
      success(res, document, 'Document submitted', 201);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to submit document', 500, 'SUBMIT_FAILED');
    }
  };

  getMyDocuments = async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const documents = await this.service.getUserDocuments(userId);
      success(res, documents);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to get documents', 500, 'GET_FAILED');
    }
  };

  getPendingVerifications = async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);

      const result = await this.service.getPendingVerifications(page, limit);
      success(res, result);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to get pending verifications', 500, 'GET_FAILED');
    }
  };

  getPendingSessions = async (req: Request, res: Response) => {
    try {
      const centreId = (req as any).user?.centreId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);

      const result = await this.service.getPendingSessions(centreId, page, limit);
      success(res, result);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to get pending sessions', 500, 'GET_FAILED');
    }
  };

  verifyDocument = async (req: Request, res: Response) => {
    try {
      const reviewerId = req.user!.id;
      const { documentId } = req.params;
      const { status, rejectionReason } = req.body;

      const document = await this.service.verifyDocument(
        documentId,
        reviewerId,
        status,
        rejectionReason
      );
      success(res, document, 'Document verification updated');
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to verify document', 500, 'VERIFY_FAILED');
    }
  };

  evaluateSession = async (req: Request, res: Response) => {
    try {
      const reviewerId = req.user!.id;
      const { sessionId } = req.params;
      const { criteria } = req.body;

      const session = await this.service.evaluateSession(sessionId, reviewerId, criteria);
      success(res, session, 'Session evaluated');
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to evaluate session', 500, 'EVALUATE_FAILED');
    }
  };
}
