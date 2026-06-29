import { Request, Response } from 'express';
import { MessagingService } from './messaging.service';
import { success, created } from '../../shared/utils/response';
import { AppError } from '../../shared/utils/errors';

export class MessagingController {
  private service: MessagingService;

  constructor() {
    this.service = new MessagingService();
  }

  sendInterest = async (req: Request, res: Response) => {
    try {
      const { receiverId, message } = req.body;
      const senderId = req.user!.id;

      const interest = await this.service.sendInterest(senderId, receiverId, message);
      success(res, interest, 'Interest sent successfully', 201);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to send interest', 500, 'SEND_FAILED');
    }
  };

  acceptInterest = async (req: Request, res: Response) => {
    try {
      const { interestId } = req.params;
      const receiverId = req.user!.id;

      const interest = await this.service.acceptInterest(receiverId, interestId);
      success(res, interest, 'Interest accepted');
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to accept interest', 500, 'ACCEPT_FAILED');
    }
  };

  rejectInterest = async (req: Request, res: Response) => {
    try {
      const { interestId } = req.params;
      const receiverId = req.user!.id;

      const interest = await this.service.rejectInterest(receiverId, interestId);
      success(res, interest, 'Interest rejected');
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to reject interest', 500, 'REJECT_FAILED');
    }
  };

  cancelInterest = async (req: Request, res: Response) => {
    try {
      const { interestId } = req.params;
      const senderId = req.user!.id;

      const interest = await this.service.cancelInterest(senderId, interestId);
      success(res, interest, 'Interest cancelled');
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to cancel interest', 500, 'CANCEL_FAILED');
    }
  };

  getSentInterests = async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);

      const result = await this.service.getSentInterests(userId, page, limit);
      success(res, result);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to get interests', 500, 'GET_FAILED');
    }
  };

  getReceivedInterests = async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);

      const result = await this.service.getReceivedInterests(userId, page, limit);
      success(res, result);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to get interests', 500, 'GET_FAILED');
    }
  };

  getMatches = async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);

      const result = await this.service.getMatches(userId, page, limit);
      success(res, result);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to get matches', 500, 'GET_FAILED');
    }
  };

  sendMessage = async (req: Request, res: Response) => {
    try {
      const { receiverId, content, type, mediaUrl, replyToId } = req.body;
      const senderId = req.user!.id;

      const message = await this.service.sendMessage(
        senderId,
        receiverId,
        content,
        type || 'text',
        mediaUrl,
        replyToId
      );
      success(res, message, 'Message sent', 201);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to send message', 500, 'SEND_FAILED');
    }
  };

  getMessages = async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const { conversationId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);

      const result = await this.service.getMessages(userId, conversationId, page, limit);
      success(res, result);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to get messages', 500, 'GET_FAILED');
    }
  };

  getConversations = async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);

      const result = await this.service.getConversations(userId, page, limit);
      success(res, result);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to get conversations', 500, 'GET_FAILED');
    }
  };

  markAsRead = async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const { conversationId } = req.params;

      await this.service.markAsRead(userId, conversationId);
      success(res, null, 'Messages marked as read');
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to mark as read', 500, 'MARK_FAILED');
    }
  };

  blockUser = async (req: Request, res: Response) => {
    try {
      const blockerId = req.user!.id;
      const { userId, reason } = req.body;

      const result = await this.service.blockUser(blockerId, userId, reason);
      success(res, result, 'User blocked');
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to block user', 500, 'BLOCK_FAILED');
    }
  };

  unblockUser = async (req: Request, res: Response) => {
    try {
      const blockerId = req.user!.id;
      const { userId } = req.params;

      const result = await this.service.unblockUser(blockerId, userId);
      success(res, result, 'User unblocked');
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to unblock user', 500, 'UNBLOCK_FAILED');
    }
  };

  getBlockedUsers = async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;

      const blocked = await this.service.getBlockedUsers(userId);
      success(res, blocked);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to get blocked users', 500, 'GET_FAILED');
    }
  };

  reportProfile = async (req: Request, res: Response) => {
    try {
      const reporterId = req.user!.id;
      const { userId, reason, description, evidenceUrls } = req.body;

      const report = await this.service.reportProfile(
        reporterId,
        userId,
        reason,
        description,
        evidenceUrls
      );
      success(res, report, 'Report submitted', 201);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to submit report', 500, 'REPORT_FAILED');
    }
  };
}
