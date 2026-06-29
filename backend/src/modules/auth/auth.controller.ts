// ============================================================
// Auth Controller
// ============================================================

import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { success, created } from '../../shared/utils/response';
import { log } from '../../config/logger';

export class AuthController {
  private authService: AuthService;

  constructor(authService: AuthService) {
    this.authService = authService;
  }

  /**
   * POST /auth/social/google
   * Login or register with Google
   */
  socialLoginGoogle = async (req: Request, res: Response): Promise<void> => {
    const { accessToken } = req.body;
    const ip = req.ip || 'unknown';
    const { SocialAuthService } = await import('../../shared/services/social-auth.service');
    const service = new SocialAuthService();
    const result = await service.socialLogin('google', accessToken, ip);
    success(res, result, 'Google login successful');
  };

  /**
   * POST /auth/social/facebook
   * Login or register with Facebook
   */
  socialLoginFacebook = async (req: Request, res: Response): Promise<void> => {
    const { accessToken } = req.body;
    const ip = req.ip || 'unknown';
    const { SocialAuthService } = await import('../../shared/services/social-auth.service');
    const service = new SocialAuthService();
    const result = await service.socialLogin('facebook', accessToken, ip);
    success(res, result, 'Facebook login successful');
  };

  /**
   * POST /auth/send-otp
   * Send OTP to mobile number
   */
  sendOtp = async (req: Request, res: Response): Promise<void> => {
    const { phone, countryCode = '+91' } = req.body;
    const ip = req.ip || 'unknown';

    await this.authService.sendOtp(phone, countryCode, ip);

    log.user.login(phone, ip); // Audit log
    success(res, null, 'OTP sent successfully to your mobile number');
  };

  /**
   * POST /auth/verify-otp
   * Verify OTP and get temporary auth token
   */
  verifyOtp = async (req: Request, res: Response): Promise<void> => {
    const { phone, otp } = req.body;
    const ip = req.ip || 'unknown';

    const result = await this.authService.verifyOtp(phone, otp, ip);

    log.user.login(phone, ip); // Audit log
    success(res, result, 'OTP verified successfully');
  };

  /**
   * POST /auth/register
   * Register new member (after OTP verification)
   */
  register = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const ip = req.ip || 'unknown';
    const {
      phone,
      email,
      firstName,
      lastName,
      gender,
      dateOfBirth,
      religion,
      password,
      membershipPlan = 'free'
    } = req.body;

    const result = await this.authService.completeRegistration({
      userId,
      phone,
      email,
      firstName,
      lastName,
      gender,
      dateOfBirth,
      religion,
      password,
      membershipPlan,
      ip
    });

    log.user.register(result.user.id as string, result.user.role as string);
    created(res, result, 'Registration completed successfully');
  };

  /**
   * POST /auth/login
   * Login with email/mobile and password
   */
  login = async (req: Request, res: Response): Promise<void> => {
    const { identifier, password, fcmToken } = req.body;
    const ip = req.ip || 'unknown';

    const result = await this.authService.login(identifier, password, ip, fcmToken);

    log.user.login(result.user.id as string, ip);
    success(res, result, 'Login successful');
  };

  /**
   * POST /auth/logout
   * Logout and invalidate tokens
   */
  logout = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const refreshToken = req.body.refreshToken;

    await this.authService.logout(userId, refreshToken);

    log.user.logout(userId);
    success(res, null, 'Logout successful');
  };

  /**
   * POST /auth/refresh
   * Refresh access token
   */
  refreshToken = async (req: Request, res: Response): Promise<void> => {
    const { refreshToken } = req.body;

    const result = await this.authService.refreshAccessToken(refreshToken);

    success(res, result, 'Token refreshed successfully');
  };

  /**
   * POST /auth/forgot-password
   * Request password reset
   */
  forgotPassword = async (req: Request, res: Response): Promise<void> => {
    const { identifier } = req.body;
    const ip = req.ip || 'unknown';

    await this.authService.initiatePasswordReset(identifier, ip);

    success(res, null, 'Password reset instructions sent to your email/phone');
  };

  /**
   * POST /auth/verify-reset-token
   * Verify password reset token
   */
  verifyResetToken = async (req: Request, res: Response): Promise<void> => {
    const { token } = req.body;

    const result = await this.authService.verifyResetToken(token);

    success(res, result, 'Token is valid');
  };

  /**
   * POST /auth/reset-password
   * Reset password with token
   */
  resetPassword = async (req: Request, res: Response): Promise<void> => {
    const { token, password } = req.body;
    const ip = req.ip || 'unknown';

    await this.authService.resetPassword(token, password, ip);

    success(res, null, 'Password reset successful');
  };

  /**
   * GET /auth/me
   * Get current authenticated user
   */
  getCurrentUser = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;

    const user = await this.authService.getCurrentUser(userId);

    success(res, user);
  };

  /**
   * GET /auth/session
   * Get session info
   */
  getSession = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;

    const session = await this.authService.getSessionInfo(userId);

    success(res, session);
  };

  /**
   * POST /auth/2fa/setup
   * Setup 2FA for admin accounts
   */
  setup2fa = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const { method = 'totp' } = req.body;

    const result = await this.authService.setup2fa(userId, method);

    log.security.invalidToken(req.ip || '', '2FA setup');
    success(res, result, '2FA setup initiated');
  };

  /**
   * POST /auth/2fa/enable
   * Enable 2FA after verification
   */
  enable2fa = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const { code } = req.body;

    const result = await this.authService.enable2fa(userId, code);

    log.admin.memberApproved(req.user!.id, userId); // Audit log
    success(res, result, '2FA enabled successfully');
  };

  /**
   * POST /auth/2fa/disable
   * Disable 2FA
   */
  disable2fa = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const { code, password } = req.body;

    await this.authService.disable2fa(userId, code, password);

    success(res, null, '2FA disabled successfully');
  };

  /**
   * POST /auth/2fa/verify
   * Verify 2FA during login
   */
  verify2fa = async (req: Request, res: Response): Promise<void> => {
    const { tempToken, code, fcmToken } = req.body;
    const ip = req.ip || 'unknown';

    const result = await this.authService.loginWith2fa(tempToken, code, ip, fcmToken);

    log.user.login(result.user.id as string, ip);
    success(res, result, '2FA verification successful');
  };

  /**
   * POST /auth/2fa/backup-codes
   * Generate new backup codes
   */
  generateBackupCodes = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;

    const result = await this.authService.generateBackupCodes(userId);

    success(res, result, 'Backup codes generated');
  };
}
