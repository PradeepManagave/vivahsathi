import axios from 'axios';
import { config } from '../../config/index';
import logger from '../../config/logger';
import { AppError } from '../utils/errors';

interface DailyRoom {
  id: string;
  name: string;
  url: string;
  created_at: string;
  expires_at: string;
}

interface DailyRoomToken {
  token: string;
  room_name: string;
  user_name: string;
  exp: number;
}

interface DailyRecording {
  id: string;
  room_name: string;
  duration: number;
  status: string;
  download_url: string;
}

export class VideoService {
  private apiKey: string;
  private apiUrl: string;

  constructor() {
    this.apiKey = config.DAILY_API_KEY || '';
    this.apiUrl = config.DAILY_API_URL || 'https://api.daily.co/v1';
  }

  private get headers() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    };
  }

  async createRoom(options: {
    name: string;
    privacy?: 'public' | 'private';
    expiresAt?: Date;
    maxParticipants?: number;
    enableRecording?: boolean;
    enableChat?: boolean;
    enableScreenShare?: boolean;
  }): Promise<DailyRoom> {
    if (!this.apiKey) {
      logger.warn('Daily.co API key not configured, using mock room');
      return this.createMockRoom(options.name);
    }

    try {
      const roomConfig: Record<string, unknown> = {
        name: options.name,
        privacy: options.privacy || 'private',
        properties: {
          enable_screenshare: options.enableScreenShare ?? false,
          enable_chat: options.enableChat ?? true,
          start_video_off: false,
          start_audio_off: false,
          max_participants: options.maxParticipants || 10,
          enable_recording: options.enableRecording ? 'cloud' : null,
          enable_knocking: true,
          enable_network_ui: true,
          eject_at_room_exp: true,
          tokens_for_moderators: true
        }
      };

      if (options.expiresAt) {
        roomConfig.expires_at = options.expiresAt.toISOString();
      }

      const response = await axios.post(`${this.apiUrl}/rooms`, roomConfig, {
        headers: this.headers,
        timeout: 10000
      });

      logger.info('Created Daily.co room', { roomId: response.data.id, name: options.name });

      return {
        id: response.data.id,
        name: response.data.name,
        url: response.data.url,
        created_at: response.data.created_at,
        expires_at: response.data.exp
      };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { info?: string } }, message?: string };
      logger.error('Failed to create Daily.co room', {
        error: err.response?.data?.info || err.message,
        name: options.name
      });
      throw new AppError('Failed to create video room', 500, 'ROOM_CREATE_FAILED');
    }
  }

  async createToken(options: {
    roomName: string;
    userId: string;
    userName: string;
    isOwner?: boolean;
    expiresIn?: number;
  }): Promise<DailyRoomToken> {
    if (!this.apiKey) {
      return this.createMockToken(options);
    }

    try {
      const expirySeconds = options.expiresIn || 3600;
      const expiryTime = Math.floor(Date.now() / 1000) + expirySeconds;

      const response = await axios.post(
        `${this.apiUrl}/meeting-tokens`,
        {
          properties: {
            room_name: options.roomName,
            user_name: options.userName,
            is_owner: options.isOwner ?? false,
            enable_screenshare: true,
            start_video_off: false,
            start_audio_off: false,
            exp: expiryTime,
            enable_recording: 'cloud'
          }
        },
        {
          headers: this.headers,
          timeout: 10000
        }
      );

      logger.info('Created Daily.co token', {
        roomName: options.roomName,
        userId: options.userId,
        expiresAt: new Date(expiryTime * 1000).toISOString()
      });

      return {
        token: response.data.token,
        room_name: options.roomName,
        user_name: options.userName,
        exp: expiryTime
      };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { info?: string } }, message?: string };
      logger.error('Failed to create Daily.co token', {
        error: err.response?.data?.info || err.message,
        roomName: options.roomName
      });
      throw new AppError('Failed to create video token', 500, 'TOKEN_CREATE_FAILED');
    }
  }

  async deleteRoom(roomName: string): Promise<void> {
    if (!this.apiKey) {
      logger.info('Mock: Would delete room', { roomName });
      return;
    }

    try {
      await axios.delete(`${this.apiUrl}/rooms/${roomName}`, {
        headers: this.headers,
        timeout: 10000
      });

      logger.info('Deleted Daily.co room', { roomName });
    } catch (error: unknown) {
      const err = error as { response?: { status?: number }, message?: string };
      if (err.response?.status === 404) {
        logger.warn('Room not found for deletion', { roomName });
        return;
      }
      logger.error('Failed to delete Daily.co room', {
        error: err.message,
        roomName
      });
    }
  }

  async getRecordings(roomName?: string): Promise<DailyRecording[]> {
    if (!this.apiKey) {
      return [];
    }

    try {
      const params = roomName ? { room_name: roomName } : {};
      const response = await axios.get(`${this.apiUrl}/recordings`, {
        headers: this.headers,
        params,
        timeout: 10000
      });

      return response.data.data.map((rec: Record<string, unknown>) => ({
        id: rec.id,
        room_name: rec.room_name,
        duration: rec.duration,
        status: rec.status,
        download_url: rec.download_url
      }));
    } catch (error: unknown) {
      logger.error('Failed to get Daily.co recordings', { error });
      return [];
    }
  }

  async deleteRecording(recordingId: string): Promise<void> {
    if (!this.apiKey) {
      logger.info('Mock: Would delete recording', { recordingId });
      return;
    }

    try {
      await axios.delete(`${this.apiUrl}/recordings/${recordingId}`, {
        headers: this.headers,
        timeout: 10000
      });

      logger.info('Deleted Daily.co recording', { recordingId });
    } catch (error: unknown) {
      logger.error('Failed to delete Daily.co recording', { error, recordingId });
    }
  }

  async getRoom(roomName: string): Promise<DailyRoom | null> {
    if (!this.apiKey) {
      return null;
    }

    try {
      const response = await axios.get(`${this.apiUrl}/rooms/${roomName}`, {
        headers: this.headers,
        timeout: 10000
      });

      return {
        id: response.data.id,
        name: response.data.name,
        url: response.data.url,
        created_at: response.data.created_at,
        expires_at: response.data.exp
      };
    } catch (error: unknown) {
      const err = error as { response?: { status?: number } };
      if (err.response?.status === 404) {
        return null;
      }
      logger.error('Failed to get Daily.co room', { error, roomName });
      return null;
    }
  }

  private createMockRoom(name: string): DailyRoom {
    const room: DailyRoom = {
      id: `mock-${Date.now()}`,
      name,
      url: `https://mock.daily.co/${name}`,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };

    logger.info('Created mock video room', { roomId: room.id, name });
    return room;
  }

  private createMockToken(options: {
    roomName: string;
    userId: string;
    userName: string;
    expiresIn?: number;
  }): DailyRoomToken {
    const expirySeconds = options.expiresIn || 3600;
    const expiryTime = Math.floor(Date.now() / 1000) + expirySeconds;

    const mockToken = Buffer.from(JSON.stringify({
      roomName: options.roomName,
      userId: options.userId,
      userName: options.userName,
      exp: expiryTime
    })).toString('base64');

    logger.info('Created mock video token', {
      roomName: options.roomName,
      userId: options.userId,
      expiresAt: new Date(expiryTime * 1000).toISOString()
    });

    return {
      token: mockToken,
      room_name: options.roomName,
      user_name: options.userName,
      exp: expiryTime
    };
  }

  generateRoomName(prefix: string, id: string): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `${prefix}-${id}-${timestamp}-${random}`;
  }
}

export const videoService = new VideoService();
