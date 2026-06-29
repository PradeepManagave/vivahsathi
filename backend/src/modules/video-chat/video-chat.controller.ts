import { Request, Response } from 'express';
import { VideoChatService, VideoCall } from './video-chat.service';
import { success, created } from '../../shared/utils/response';
import { AppError } from '../../shared/utils/errors';

export class VideoChatController {
  private service: VideoChatService;

  constructor() {
    this.service = new VideoChatService();
  }

  initiateCall = async (req: Request, res: Response) => {
    try {
      const callerId = req.user!.id;
      const { profileId } = req.params;

      const call = await this.service.initiateCall(callerId, profileId);
      success(res, call, 'Call initiated', 201);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to initiate call', 500, 'INITIATE_FAILED');
    }
  };

  acceptCall = async (req: Request, res: Response) => {
    try {
      const acceptorId = req.user!.id;
      const { callId } = req.params;

      const call = await this.service.acceptCall(callId, acceptorId);
      success(res, call, 'Call accepted');
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to accept call', 500, 'ACCEPT_FAILED');
    }
  };

  declineCall = async (req: Request, res: Response) => {
    try {
      const declinerId = req.user!.id;
      const { callId } = req.params;

      const call = await this.service.declineCall(callId, declinerId);
      success(res, call, 'Call declined');
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to decline call', 500, 'DECLINE_FAILED');
    }
  };

  joinCall = async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const { callId } = req.params;

      const call = await this.service.joinCall(callId, userId);
      success(res, call, 'Joined call');
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to join call', 500, 'JOIN_FAILED');
    }
  };

  endCall = async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const { callId } = req.params;

      const call = await this.service.endCall(callId, userId);
      success(res, call, 'Call ended');
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to end call', 500, 'END_FAILED');
    }
  };

  giveRecordingConsent = async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const { callId } = req.params;
      const { consent } = req.body;

      const result = await this.service.giveRecordingConsent(callId, userId, consent);
      success(res, result, consent ? 'Recording consent given' : 'Recording consent withdrawn');
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to update recording consent', 500, 'CONSENT_FAILED');
    }
  };

  getCallHistory = async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);

      const result = await this.service.getCallHistory(userId, page, limit);
      success(res, result);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to get call history', 500, 'GET_FAILED');
    }
  };

  getIncomingCalls = async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const calls = await this.service.getIncomingCalls(userId);
      success(res, calls);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to get incoming calls', 500, 'GET_FAILED');
    }
  };

  getCallDetails = async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const { callId } = req.params;

      const call = await this.service.getCallDetails(callId, userId);
      success(res, call);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to get call details', 500, 'GET_FAILED');
    }
  };
}
