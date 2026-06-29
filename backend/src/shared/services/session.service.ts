// ============================================================
// Redis Session Store
// ============================================================

import { cache } from '../../config/redis';
import logger from '../../config/logger';

interface Session {
  userId: string;
  ip?: string;
  fcmToken?: string;
  userAgent?: string;
  loginAt: string;
  lastActivity?: string;
  [key: string]: unknown;
}

interface SessionInfo {
  sessionId: string;
  session: Session;
  ttl: number;
}

const SESSION_TTL = 24 * 60 * 60; // 24 hours
const SESSION_PREFIX = 'session:';

export const sessions = {
  /**
   * Create a new session
   */
  async create(userId: string, data: Partial<Session>): Promise<string> {
    const sessionId = `${userId}:${Date.now()}:${Math.random().toString(36).substring(2, 9)}`;

    const session: Session = {
      userId,
      loginAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      ...data
    };

    await cache.set(`${SESSION_PREFIX}${sessionId}`, session, SESSION_TTL);

    // Add to user's session list
    const userSessions = await this.getUserSessions(userId);
    userSessions.push(sessionId);

    // Keep only last 5 sessions
    const trimmedSessions = userSessions.slice(-5);
    await cache.set(`user_sessions:${userId}`, trimmedSessions, SESSION_TTL);

    logger.info('Session created', { userId, sessionId });

    return sessionId;
  },

  /**
   * Get session by ID
   */
  async get(sessionId: string): Promise<Session | null> {
    return cache.get<Session>(`${SESSION_PREFIX}${sessionId}`);
  },

  /**
   * Update session
   */
  async update(sessionId: string, data: Partial<Session>): Promise<void> {
    const session = await this.get(sessionId);
    if (!session) return;

    const updated: Session = {
      ...session,
      ...data,
      lastActivity: new Date().toISOString()
    };

    // Get TTL
    const ttl = await cache.ttl(`${SESSION_PREFIX}${sessionId}`);
    if (ttl > 0) {
      await cache.set(`${SESSION_PREFIX}${sessionId}`, updated, ttl);
    }
  },

  /**
   * Destroy session
   */
  async destroy(sessionId: string): Promise<void> {
    const session = await this.get(sessionId);
    if (!session) return;

    await cache.del(`${SESSION_PREFIX}${sessionId}`);

    // Remove from user's session list
    const userSessions = await this.getUserSessions(session.userId);
    const filtered = userSessions.filter((id) => id !== sessionId);
    await cache.set(`user_sessions:${session.userId}`, filtered, SESSION_TTL);

    logger.info('Session destroyed', { sessionId });
  },

  /**
   * Destroy all sessions for a user
   */
  async destroyAll(userId: string): Promise<void> {
    const sessionIds = await this.getUserSessions(userId);

    for (const sessionId of sessionIds) {
      await cache.del(`${SESSION_PREFIX}${sessionId}`);
    }

    await cache.del(`user_sessions:${userId}`);

    logger.info('All sessions destroyed', { userId, count: sessionIds.length });
  },

  /**
   * Get all sessions for a user
   */
  async getUserSessions(userId: string): Promise<string[]> {
    const sessions = await cache.get<string[]>(`user_sessions:${userId}`);
    return sessions ?? [];
  },

  /**
   * Get session info with TTL
   */
  async getSessionInfo(sessionId: string): Promise<SessionInfo | null> {
    const session = await this.get(sessionId);
    if (!session) return null;

    const ttl = await cache.ttl(`${SESSION_PREFIX}${sessionId}`);

    return {
      sessionId,
      session,
      ttl
    };
  },

  /**
   * Extend session TTL
   */
  async extend(sessionId: string): Promise<void> {
    const session = await this.get(sessionId);
    if (!session) return;

    await cache.set(`${SESSION_PREFIX}${sessionId}`, session, SESSION_TTL);

    // Also extend user sessions list
    const userSessions = await this.getUserSessions(session.userId);
    await cache.set(`user_sessions:${session.userId}`, userSessions, SESSION_TTL);
  },

  /**
   * Refresh session activity timestamp
   */
  async touch(sessionId: string): Promise<void> {
    await this.update(sessionId, { lastActivity: new Date().toISOString() });
  }
};
