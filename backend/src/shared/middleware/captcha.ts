// ============================================================
// CAPTCHA Validation Middleware - Google reCAPTCHA v3
// ============================================================

import { Request, Response as ExpressResponse, NextFunction } from 'express';
import { config } from '../../config/index';
import logger, { log } from '../../config/logger';
import { AppError } from '../utils/errors';

interface CaptchaConfig {
  secretKey: string;
  verifyUrl: string;
  scoreThreshold: number;
}

interface CaptchaResponse {
  success: boolean;
  score?: number;
  action?: string;
  challenge_ts?: string;
  hostname?: string;
  'error-codes'?: string[];
}

export class CaptchaService {
  private config: CaptchaConfig;

  constructor() {
    this.config = {
      secretKey: config.RECAPTCHA_SECRET_KEY || '',
      verifyUrl: 'https://www.google.com/recaptcha/api/siteverify',
      scoreThreshold: config.RECAPTCHA_SCORE_THRESHOLD || 0.5
    };
  }

  async verifyToken(token: string, action?: string): Promise<boolean> {
    if (!this.config.secretKey) {
      logger.warn('reCAPTCHA secret key not configured');
      return true;
    }

    if (!token) {
      return false;
    }

    try {
      const fetchResponse = await fetch(this.config.verifyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          secret: this.config.secretKey,
          response: token
        })
      });

      const data: CaptchaResponse = await (fetchResponse as any).json() as CaptchaResponse;

      if (!data.success) {
        log.security.captchaFailed(data['error-codes'] || []);
        return false;
      }

      if (data.score !== undefined && data.score < this.config.scoreThreshold) {
        log.security.captchaLowScore(data.score, action);
        return false;
      }

      if (action && data.action && data.action !== action) {
        log.security.captchaActionMismatch(data.action, action);
        return false;
      }

      return true;
    } catch (error) {
      logger.error('reCAPTCHA verification failed', { error: (error as Error).message });
      return false;
    }
  }

  async verifyTokenWithScore(token: string): Promise<{ valid: boolean; score?: number }> {
    if (!this.config.secretKey) {
      return { valid: true };
    }

    if (!token) {
      return { valid: false };
    }

    try {
      const fetchResponse = await fetch(this.config.verifyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          secret: this.config.secretKey,
          response: token
        })
      });

      const data: CaptchaResponse = await (fetchResponse as any).json() as CaptchaResponse;

      return {
        valid: data.success,
        score: data.score
      };
    } catch (error) {
      logger.error('reCAPTCHA verification failed', { error: (error as Error).message });
      return { valid: false };
    }
  }
}

export const captchaService = new CaptchaService();

export function requireCaptcha(
  options: { action?: string; scoreThreshold?: number } = {}
) {
  return async (
    req: Request,
    res: ExpressResponse,
    next: NextFunction
  ): Promise<void> => {
    try {
      const token = req.body.recaptchaToken || req.headers['x-recaptcha-token'] as string;

      if (!token) {
        const error = new AppError(
          'CAPTCHA verification required',
          400,
          'CAPTCHA_REQUIRED'
        );
        next(error);
        return;
      }

      const isValid = await captchaService.verifyToken(token, options.action);

      if (!isValid) {
        const error = new AppError(
          'CAPTCHA verification failed. Please try again.',
          400,
          'CAPTCHA_INVALID'
        );
        next(error);
        return;
      }

      next();
    } catch (error) {
      logger.error('CAPTCHA middleware error', { error: (error as Error).message });
      next(error);
    }
  };
}

export function optionalCaptcha(
  options: { action?: string } = {}
) {
  return async (
    req: Request,
    _res: ExpressResponse,
    next: NextFunction
  ): Promise<void> => {
    try {
      const token = req.body.recaptchaToken || req.headers['x-recaptcha-token'] as string;

      if (token) {
        const isValid = await captchaService.verifyToken(token, options.action);
        (req as unknown as Record<string, unknown>).captchaVerified = isValid;
      }

      next();
    } catch (error) {
      (req as unknown as Record<string, unknown>).captchaVerified = false;
      next();
    }
  };
}

declare global {
  namespace Express {
    interface Request {
      captchaVerified?: boolean;
      captchaScore?: number;
    }
  }
}
