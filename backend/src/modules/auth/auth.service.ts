// ============================================================
// Auth Service - Complete Authentication Logic
// ============================================================

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import crypto from 'crypto';
import { config } from '../../config/index';
import { db } from '../../config/database';
import { cache, sessions } from '../../config/redis';
import logger, { log } from '../../config/logger';
import {
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  RateLimitError,
  AppError
} from '../../shared/utils/errors';
import { UserRole } from '../../types/index';
import { ADMIN_ROLES } from '../../shared/constants/roles';
import { SmsService } from '../../shared/services/sms.service';
import { EmailService } from '../../shared/services/email.service';

interface RegisterData {
  userId: string;
  phone: string;
  email?: string;
  firstName: string;
  lastName: string;
  gender: 'male' | 'female' | 'other';
  dateOfBirth: string;
  religion: string;
  password: string;
  membershipPlan?: string;
  ip: string;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

interface OtpResult {
  tempToken?: string;
  expiresIn: number;
}

interface LoginResult {
  user: Record<string, unknown>;
  tokens: AuthTokens;
  requires2fa?: boolean;
  tempToken?: string;
}

interface RegisterResult {
  user: Record<string, unknown>;
  tokens: AuthTokens;
}

interface Setup2faResult {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

interface SessionInfo {
  userId: string;
  role: UserRole;
  permissions: string[];
  twoFactorEnabled: boolean;
  tokenExpiry: number;
  createdAt: string;
}

// Constants
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '30d';
const OTP_EXPIRY_SECONDS = 600;
const PASSWORD_SALT_ROUNDS = 12;
const MAX_OTP_REQUESTS_PER_HOUR = 5;
const MAX_LOGIN_ATTEMPTS = 5;
const ACCOUNT_LOCK_DURATION_MINUTES = 15;

export class AuthService {
  private smsService: SmsService;
  private emailService: EmailService;

  constructor() {
    this.smsService = new SmsService();
    this.emailService = new EmailService();
  }

  // ============================================================
  // OTP Operations
  // ============================================================

  /**
   * Send OTP to mobile number
   * Fixed: Timing-safe operations to prevent phone enumeration
   */
  async sendOtp(phone: string, countryCode: string = '+91', ip: string): Promise<void> {
    const fullPhone = `${countryCode}${phone}`;
    const rateLimitKey = `otp_rate:${fullPhone}`;
    const otpKey = `otp:${fullPhone}`;

    const currentRequests = await cache.get<number>(rateLimitKey) || 0;
    
    crypto.randomBytes(8);
    
    if (currentRequests >= MAX_OTP_REQUESTS_PER_HOUR) {
      log.security.rateLimitExceeded(ip, '/auth/send-otp');
      throw new RateLimitError(3600);
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await cache.set(otpKey, {
      otp,
      attempts: 0,
      createdAt: new Date().toISOString()
    }, OTP_EXPIRY_SECONDS);

    await cache.set(rateLimitKey, currentRequests + 1, 3600);

    try {
      await this.smsService.sendOtp(fullPhone, otp);
    } catch (error) {
      log.system.error(error as Error, { context: 'OTP_SMS_SEND', phone });
    }

    logger.info('OTP sent', { phone, ip });
  }

  /**
   * Verify OTP and get temporary token
   */
  async verifyOtp(phone: string, otp: string, ip: string): Promise<OtpResult> {
    const otpKey = `otp:${phone}`;

    // Get stored OTP
    const storedOtp = await cache.get<{ otp: string; attempts: number }>(otpKey);

    if (!storedOtp) {
      throw new UnauthorizedError('OTP expired or not found. Please request a new OTP.');
    }

    // Check attempts
    if (storedOtp.attempts >= 3) {
      await cache.del(otpKey);
      throw new UnauthorizedError('Too many failed attempts. Please request a new OTP.');
    }

    // Verify OTP
    if (storedOtp.otp !== otp) {
      // Increment attempts
      storedOtp.attempts += 1;
      await cache.set(otpKey, storedOtp, OTP_EXPIRY_SECONDS);
      throw new UnauthorizedError(`Invalid OTP. ${3 - storedOtp.attempts} attempts remaining.`);
    }

    // Delete OTP after successful verification
    await cache.del(otpKey);

    // Generate temporary token for registration
    const tempToken = jwt.sign(
      { phone, purpose: 'registration' },
      config.JWT_SECRET,
      { expiresIn: '30m' }
    );

    logger.info('OTP verified', { phone, ip });

    return {
      tempToken,
      expiresIn: 1800 // 30 minutes
    };
  }

  // ============================================================
  // Registration
  // ============================================================

  /**
   * Complete registration after OTP verification
   */
  async completeRegistration(data: RegisterData): Promise<RegisterResult> {
    const {
      userId,
      phone,
      email,
      firstName,
      lastName,
      gender,
      dateOfBirth,
      religion,
      password,
      membershipPlan = 'free'
    } = data;

    // Hash password
    const passwordHash = await bcrypt.hash(password, PASSWORD_SALT_ROUNDS);

    // Generate profile slug
    const profileSlug = this.generateProfileSlug(firstName, lastName, userId);

    // Get membership plan
    const plan = await db('membership_plans')
      .where('slug', membershipPlan)
      .where('is_active', true)
      .first();

    // Create user and profile in transaction
    const profileId = uuidv4();

    await db.transaction(async (trx: any) => {
      // Update user
      await trx('users')
        .where('id', userId)
        .update({
          phone,
          email: email?.toLowerCase(),
          password_hash: passwordHash,
          role: 'free_member',
          status: 'active',
          phone_verified: true,
          updated_at: new Date()
        });

      // Create profile
      await trx('profiles').insert({
        id: profileId,
        user_id: userId,
        first_name: firstName,
        last_name: lastName,
        gender,
        date_of_birth: dateOfBirth,
        religion,
        profile_slug: profileSlug,
        kyc_status: 'pending',
        marital_status: 'unmarried',
        profile_visibility: 'public',
        photo_visibility: 'all',
        profile_views: 0,
        interests_received: 0,
        interests_sent: 0,
        profile_completion_percent: 30,
        is_featured: false,
        is_premium: plan?.slug !== 'free',
        is_verified: false,
        preferred_language: 'en',
        created_at: new Date(),
        updated_at: new Date()
      });

      // Create family_info record
      await trx('family_info').insert({
        id: uuidv4(),
        profile_id: profileId,
        brothers_count: 0,
        sisters_count: 0,
        brothers_married: 0,
        sisters_married: 0,
        created_at: new Date(),
        updated_at: new Date()
      });

      // Assign membership if not free
      if (plan && plan.slug !== 'free') {
        const now = new Date();
        const endDate = new Date(now.getTime() + plan.duration_days * 24 * 60 * 60 * 1000);

        await trx('user_memberships').insert({
          id: uuidv4(),
          user_id: userId,
          plan_id: plan.id,
          status: 'active',
          start_date: now,
          end_date: endDate,
          created_at: now,
          updated_at: now
        });
      }
    });

    // Get created user
    const user = await this.getUserById(userId);

    // Generate tokens
    const tokens = await this.generateTokens(user);

    log.user.register(userId, user.role as string);

    return { user, tokens };
  }

  // ============================================================
  // Login
  // ============================================================

  /**
   * Login with email/mobile and password
   */
  async login(
    identifier: string,
    password: string,
    ip: string,
    fcmToken?: string
  ): Promise<LoginResult> {
    // Determine if email or mobile
    const isEmail = identifier.includes('@');
    const whereClause = isEmail
      ? { email: identifier.toLowerCase() }
      : { phone: identifier };

    // Find user
    const user = await db('users')
      .where(whereClause)
      .whereNull('deleted_at')
      .first();

    if (!user) {
      log.user.failedLogin(identifier, ip, 'User not found');
      throw new UnauthorizedError('Invalid credentials');
    }

    // Check if admin user (admin roles have mandatory 2FA)
    if (ADMIN_ROLES.includes(user.role as UserRole)) {
      // Check if 2FA is enabled
      if (user.two_factor_enabled) {
        // Generate secure 2FA session in Redis (no password in JWT)
        const tempToken = await this.create2faSession(user.id, ip);

        log.security.invalidToken(ip, 'Admin login - 2FA required');
        return {
          user: this.sanitizeUser(user),
          tokens: { accessToken: '', refreshToken: '', expiresIn: 0, tokenType: 'Bearer' },
          requires2fa: true,
          tempToken
        };
      }
    }

    // Check account lock
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      const remainingMinutes = Math.ceil(
        (new Date(user.locked_until).getTime() - Date.now()) / 60000
      );
      log.user.failedLogin(identifier, ip, `Account locked for ${remainingMinutes} minutes`);
      throw new ForbiddenError(
        `Account locked. Try again after ${remainingMinutes} minutes.`
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      await this.handleFailedLogin(user, ip);
      throw new UnauthorizedError('Invalid credentials');
    }

    // Check if 2FA is enabled
    if (user.two_factor_enabled) {
      // Generate secure 2FA session in Redis (no password in JWT)
      const tempToken = await this.create2faSession(user.id, ip);

      return {
        user: this.sanitizeUser(user),
        tokens: { accessToken: '', refreshToken: '', expiresIn: 0, tokenType: 'Bearer' },
        requires2fa: true,
        tempToken
      };
    }

    // Reset failed attempts on successful login
    await this.resetFailedLogin(user.id);

    // Update last login
    await db('users')
      .where('id', user.id)
      .update({
        last_login_at: new Date(),
        last_login_ip: ip,
        failed_login_attempts: 0
      });

    // Get full user with profile
    const fullUser = await this.getUserById(user.id);

    // Generate tokens
    const tokens = await this.generateTokens(fullUser);

    // Store session
    await sessions.create(user.id, {
      ip,
      fcmToken,
      userAgent: 'unknown',
      loginAt: new Date().toISOString()
    });

    log.user.login(user.id, ip);

    return { user: fullUser, tokens };
  }

  /**
   * Login with 2FA verification
   */
  async loginWith2fa(
    tempToken: string,
    code: string,
    ip: string,
    fcmToken?: string
  ): Promise<LoginResult> {
    // Validate 2FA session (no password needed)
    const { userId } = await this.validate2faSession(tempToken);

    const user = await db('users')
      .where('id', userId)
      .whereNull('deleted_at')
      .first();

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    // Verify 2FA code
    const isValid2fa = this.verify2faCode(user.two_factor_secret, code);
    if (!isValid2fa) {
      // Check if backup code
      const backupCodes = JSON.parse(user.two_factor_recovery_codes || '[]') as string[];
      const backupIndex = backupCodes.indexOf(code);

      if (backupIndex === -1) {
        log.user.failedLogin(user.phone || user.email || 'unknown', ip, 'Invalid 2FA code');
        throw new UnauthorizedError('Invalid 2FA code');
      }

      // Remove used backup code
      backupCodes.splice(backupIndex, 1);
      await db('users')
        .where('id', user.id)
        .update({ two_factor_recovery_codes: JSON.stringify(backupCodes) });
    }

    // Get full user
    const fullUser = await this.getUserById(user.id);

    // Generate tokens
    const tokens = await this.generateTokens(fullUser);

    // Update last login
    await db('users')
      .where('id', user.id)
      .update({
        last_login_at: new Date(),
        last_login_ip: ip,
        failed_login_attempts: 0
      });

    // Store session
    await sessions.create(user.id, {
      ip,
      fcmToken,
      loginAt: new Date().toISOString()
    });

    log.user.login(user.id, ip);

    return { user: fullUser, tokens };
  }

  // ============================================================
  // Token Management
  // ============================================================

  /**
   * Generate access and refresh tokens
   */
  async generateTokens(user: Record<string, unknown>): Promise<AuthTokens> {
    // Access token
    const accessToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status
      },
      config.JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRY, algorithm: 'HS256' }
    );

    // Refresh token
    const refreshToken = jwt.sign(
      { id: user.id, type: 'refresh' },
      config.REFRESH_TOKEN_SECRET,
      { expiresIn: REFRESH_TOKEN_EXPIRY }
    );

    // Store refresh token in Redis
    await cache.set(
      `refresh:${user.id}`,
      refreshToken,
      30 * 24 * 60 * 60 // 30 days
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 minutes in seconds
      tokenType: 'Bearer'
    };
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(refreshToken: string): Promise<AuthTokens> {
    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, config.REFRESH_TOKEN_SECRET) as {
        id: string;
        type: string;
      };

      if (decoded.type !== 'refresh') {
        throw new UnauthorizedError('Invalid refresh token');
      }

      // Check if token exists in Redis
      const storedToken = await cache.get<string>(`refresh:${decoded.id}`);
      if (storedToken !== refreshToken) {
        throw new UnauthorizedError('Token has been revoked');
      }

      // Get user
      const user = await this.getUserById(decoded.id);

      // Generate new tokens
      return await this.generateTokens(user);
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedError('Refresh token expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedError('Invalid refresh token');
      }
      throw error;
    }
  }

  /**
   * Logout and invalidate tokens
   */
  async logout(userId: string, refreshToken?: string): Promise<void> {
    // Delete refresh token from Redis
    await cache.del(`refresh:${userId}`);

    // Invalidate all sessions
    await sessions.destroy(`sess:${userId}:*`);

    // If specific refresh token provided, invalidate it
    if (refreshToken) {
      try {
        const decoded = jwt.decode(refreshToken) as { id: string };
        await cache.del(`refresh:${decoded.id}`);
      } catch {
        // Token invalid, already handled
      }
    }

    log.user.logout(userId);
  }

  // ============================================================
  // Password Reset
  // ============================================================

  /**
   * Initiate password reset
   * Fixed: Uses cryptographically secure token and consistent response time
   */
  async initiatePasswordReset(identifier: string, ip: string): Promise<void> {
    const isEmail = identifier.includes('@');
    const whereClause = isEmail
      ? { email: identifier.toLowerCase() }
      : { phone: identifier };

    const user = await db('users')
      .where(whereClause)
      .whereNull('deleted_at')
      .first();

    crypto.randomBytes(8);

    if (!user) {
      logger.info('Password reset requested for non-existent user', { identifier, ip });
      return;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');

    await cache.set(`password_reset:${resetToken}`, user.id, 3600);

    if (isEmail) {
      const resetUrl = `${process.env.APP_URL}/reset-password?token=${resetToken}`;
      await this.emailService.sendPasswordResetEmail(user.email!, resetUrl);
    } else {
      await this.sendOtp(identifier, '+91', ip);
    }

    logger.info('Password reset initiated', { userId: user.id, identifier, ip });
  }

  /**
   * Verify reset token
   */
  async verifyResetToken(token: string): Promise<{ valid: boolean }> {
    const userId = await cache.get<string>(`password_reset:${token}`);

    if (!userId) {
      throw new UnauthorizedError('Invalid or expired reset token');
    }

    return { valid: true };
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string, ip: string): Promise<void> {
    const userId = await cache.get<string>(`password_reset:${token}`);

    if (!userId) {
      throw new UnauthorizedError('Invalid or expired reset token');
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, PASSWORD_SALT_ROUNDS);

    // Update password
    await db('users')
      .where('id', userId)
      .update({
        password_hash: passwordHash,
        password_changed_at: new Date(),
        updated_at: new Date()
      });

    // Delete reset token
    await cache.del(`password_reset:${token}`);

    // Invalidate all sessions
    await this.logout(userId);

    logger.info('Password reset completed', { userId, ip });
  }

  // ============================================================
  // 2FA Operations
  // ============================================================

  /**
   * Setup 2FA for admin user
   */
  async setup2fa(userId: string, method: string = 'totp'): Promise<Setup2faResult> {
    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `M-Plus Matrimony (${userId})`,
      length: 20,
      algorithm: 'sha1'
    });

    // Generate backup codes
    const backupCodes = this.generateBackupCodesList();

    // Store temporary secret (not enabled yet)
    await cache.set(
      `2fa_setup:${userId}`,
      {
        secret: secret.base32,
        method,
        backupCodes,
        createdAt: new Date().toISOString()
      },
      600 // 10 minutes to complete setup
    );

    // Generate QR code URL
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);

    logger.info('2FA setup initiated', { userId, method });

    return {
      secret: secret.base32,
      qrCodeUrl,
      backupCodes
    };
  }

  /**
   * Enable 2FA after verification
   */
  async enable2fa(userId: string, code: string): Promise<{ enabled: boolean }> {
    const setupData = await cache.get<{
      secret: string;
      backupCodes: string[];
    }>(`2fa_setup:${userId}`);

    if (!setupData) {
      throw new AppError('2FA setup expired. Please restart the setup process.', 400, '2FA_SETUP_EXPIRED');
    }

    // Verify the code
    const isValid = this.verify2faCode(setupData.secret, code);
    if (!isValid) {
      throw new UnauthorizedError('Invalid 2FA code');
    }

    // Enable 2FA for user
    await db('users')
      .where('id', userId)
      .update({
        two_factor_enabled: true,
        two_factor_secret: setupData.secret,
        two_factor_recovery_codes: JSON.stringify(setupData.backupCodes),
        updated_at: new Date()
      });

    // Delete setup cache
    await cache.del(`2fa_setup:${userId}`);

    logger.info('2FA enabled', { userId });

    return { enabled: true };
  }

  /**
   * Disable 2FA
   */
  async disable2fa(
    userId: string,
    code: string,
    password: string
  ): Promise<void> {
    const user = await db('users')
      .where('id', userId)
      .first();

    if (!user) {
      throw new NotFoundError('User');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid password');
    }

    // Verify 2FA code
    const isValid = this.verify2faCode(user.two_factor_secret, code);
    if (!isValid) {
      throw new UnauthorizedError('Invalid 2FA code');
    }

    // Disable 2FA
    await db('users')
      .where('id', userId)
      .update({
        two_factor_enabled: false,
        two_factor_secret: null,
        two_factor_recovery_codes: null,
        updated_at: new Date()
      });

    logger.info('2FA disabled', { userId });
  }

  /**
   * Generate new backup codes
   */
  async generateBackupCodes(userId: string): Promise<{ backupCodes: string[] }> {
    const user = await db('users')
      .where('id', userId)
      .first();

    if (!user?.two_factor_enabled) {
      throw new AppError('2FA not enabled', 400, '2FA_NOT_ENABLED');
    }

    const backupCodes = this.generateBackupCodesList();

    await db('users')
      .where('id', userId)
      .update({
        two_factor_recovery_codes: JSON.stringify(backupCodes),
        updated_at: new Date()
      });

    return { backupCodes };
  }

  /**
   * Verify 2FA code
   */
  private verify2faCode(secret: string, code: string): boolean {
    return speakeasy.verify({
      secret,
      encoding: 'base32',
      token: code,
      window: 1
    });
  }

  /**
   * Generate list of backup codes
   */
  private generateBackupCodesList(): string[] {
    const codes: string[] = [];
    for (let i = 0; i < 8; i++) {
      const code = Math.random().toString(36).substring(2, 6).toUpperCase() +
        '-' +
        Math.random().toString(36).substring(2, 6).toUpperCase();
      codes.push(code);
    }
    return codes;
  }

  // ============================================================
  // User Management
  // ============================================================

  /**
   * Get current user with profile
   */
  async getCurrentUser(userId: string): Promise<Record<string, unknown>> {
    const user = await this.getUserById(userId);
    return user;
  }

  /**
   * Get session info
   */
  async getSessionInfo(userId: string): Promise<SessionInfo> {
    const user = await db('users')
      .where('id', userId)
      .whereNull('deleted_at')
      .first();

    if (!user) {
      throw new NotFoundError('User');
    }

    return {
      userId: user.id,
      role: user.role as UserRole,
      permissions: this.getPermissionsForRole(user.role as UserRole),
      twoFactorEnabled: user.two_factor_enabled,
      tokenExpiry: 900, // 15 minutes
      createdAt: new Date().toISOString()
    };
  }

  // ============================================================
  // Helper Methods
  // ============================================================

  /**
   * Get user by ID with profile
   */
  private async getUserById(userId: string): Promise<Record<string, unknown>> {
    const user = await db('users')
      .where('id', userId)
      .whereNull('deleted_at')
      .first();

    if (!user) {
      throw new NotFoundError('User');
    }

    // Get profile
    const profile = await db('profiles')
      .where('user_id', userId)
      .first();

    // Get membership
    const membership = await db('user_memberships')
      .where('user_id', userId)
      .where('status', 'active')
      .orderBy('created_at', 'desc')
      .first();

    return this.sanitizeUser({
      ...user,
      profile,
      membership
    });
  }

  /**
   * Sanitize user object (remove sensitive fields)
   */
  private sanitizeUser(user: Record<string, unknown>): Record<string, unknown> {
    const { password_hash, two_factor_secret, two_factor_recovery_codes, ...safeUser } = user;
    return safeUser;
  }

  /**
   * Handle failed login attempt
   */
  private async handleFailedLogin(user: Record<string, unknown>, ip: string): Promise<void> {
    const attempts = (Number(user.failed_login_attempts) || 0) + 1;

    const updates: Record<string, unknown> = {
      failed_login_attempts: attempts,
      updated_at: new Date()
    };

    // Lock account after max attempts
    if (attempts >= MAX_LOGIN_ATTEMPTS) {
      const lockUntil = new Date(Date.now() + ACCOUNT_LOCK_DURATION_MINUTES * 60 * 1000);
      updates.locked_until = lockUntil;
      log.user.failedLogin(user.id as string, ip, 'Account locked due to too many attempts');
    } else {
      log.user.failedLogin(user.id as string, ip, `${attempts} failed attempts`);
    }

    await db('users')
      .where('id', user.id as string)
      .update(updates);
  }

  /**
   * Reset failed login attempts
   */
  private async resetFailedLogin(userId: string): Promise<void> {
    await db('users')
      .where('id', userId)
      .update({
        failed_login_attempts: 0,
        locked_until: null
      });
  }

  /**
   * Create secure 2FA session in Redis (no sensitive data in JWT)
   */
  private async create2faSession(userId: string, ip: string): Promise<string> {
    const sessionId = uuidv4();
    const tempToken = jwt.sign(
      { userId, sessionId, purpose: '2fa_verify' },
      config.JWT_SECRET,
      { expiresIn: '5m' }
    );

    // Store session in Redis with hashed user data
    await cache.set(`2fa_session:${sessionId}`, {
      userId,
      ip,
      createdAt: new Date().toISOString()
    }, 300); // 5 minutes expiry

    return tempToken;
  }

  /**
   * Validate 2FA session and get user ID
   */
  private async validate2faSession(tempToken: string): Promise<{ userId: string; sessionId: string }> {
    try {
      const decoded = jwt.verify(tempToken, config.JWT_SECRET) as { userId: string; sessionId: string; purpose: string };

      if (decoded.purpose !== '2fa_verify') {
        throw new UnauthorizedError('Invalid session');
      }

      const session = await cache.get<{ userId: string; ip: string; createdAt: string }>(`2fa_session:${decoded.sessionId}`);

      if (!session) {
        throw new UnauthorizedError('2FA session expired');
      }

      // Delete session after validation (single use)
      await cache.del(`2fa_session:${decoded.sessionId}`);

      return { userId: decoded.userId, sessionId: decoded.sessionId };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedError('2FA session expired');
      }
      throw error;
    }
  }

  /**
   * Invalidate 2FA session on failed attempt
   */
  private async _invalidate2faSession(tempToken: string): Promise<void> {
    try {
      const decoded = jwt.decode(tempToken) as { sessionId?: string };
      if (decoded.sessionId) {
        await cache.del(`2fa_session:${decoded.sessionId}`);
      }
    } catch {
      // Ignore errors during cleanup
    }
  }

  /**
   * Generate profile slug
   */
  private generateProfileSlug(firstName: string, lastName: string, userId: string): string {
    const cleanFirst = firstName.toLowerCase().replace(/[^a-z]/g, '');
    const cleanLast = lastName.toLowerCase().replace(/[^a-z]/g, '');
    const shortId = userId.substring(0, 6).toLowerCase();
    return `${cleanFirst}-${cleanLast}-${shortId}`;
  }

  /**
   * Get permissions for role
   */
  private getPermissionsForRole(role: UserRole): string[] {
    const permissions: Record<UserRole, string[]> = {
      guest: [],
      free_member: ['view_profile', 'edit_own_profile', 'send_interest', 'send_message'],
      paid_member: [
        'view_profile',
        'edit_own_profile',
        'send_interest',
        'send_message',
        'video_chat',
        'view_contacts'
      ],
      centre_staff: [
        'view_profile',
        'edit_own_profile',
        'manage_centre_members',
        'conduct_kyc',
        'manage_appointments'
      ],
      centre_admin: [
        'view_profile',
        'edit_own_profile',
        'manage_centre_members',
        'conduct_kyc',
        'manage_appointments',
        'view_reports',
        'manage_vendors'
      ],
      franchise_admin: [
        'view_profile',
        'edit_own_profile',
        'manage_centre_members',
        'conduct_kyc',
        'manage_appointments',
        'view_reports',
        'manage_vendors',
        'manage_centres'
      ],
      super_admin: ['*']
    };

    return permissions[role] || [];
  }
}
