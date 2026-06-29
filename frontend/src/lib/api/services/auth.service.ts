import { apiClient, API_ENDPOINTS } from '@/lib/api/client';
import { User, AuthTokens, RegisterData, LoginData } from '@/types';

export interface SendOtpParams {
  phone?: string;
  email?: string;
}

export interface VerifyOtpParams {
  phone?: string;
  email?: string;
  otp: string;
}

export interface ForgotPasswordParams {
  identifier: string;
}

export interface ResetPasswordParams {
  token: string;
  newPassword: string;
}

export interface Setup2faParams {
  method: 'totp' | 'sms';
}

export interface Verify2faParams {
  tempToken: string;
  code: string;
}

export class AuthService {
  async login(data: LoginData): Promise<{ user: User; tokens: AuthTokens }> {
    const response = await apiClient.post<{ user: User; tokens: AuthTokens }>(
      API_ENDPOINTS.auth.login,
      data
    );
    return response.data as { user: User; tokens: AuthTokens };
  }

  async register(data: RegisterData): Promise<{ user: User; tokens: AuthTokens }> {
    const response = await apiClient.post<{ user: User; tokens: AuthTokens }>(
      API_ENDPOINTS.auth.register,
      data
    );
    return response.data as { user: User; tokens: AuthTokens };
  }

  async sendOtp(params: SendOtpParams): Promise<boolean> {
    const response = await apiClient.post<{ otpSent: boolean }>(
      API_ENDPOINTS.auth.sendOtp,
      params
    );
    return (response.data as { otpSent: boolean }).otpSent;
  }

  async verifyOtp(params: VerifyOtpParams): Promise<{ verified: boolean; tempToken?: string }> {
    const response = await apiClient.post<{ verified: boolean; tempToken?: string }>(
      API_ENDPOINTS.auth.verifyOtp,
      params
    );
    return response.data as { verified: boolean; tempToken?: string };
  }

  async verifyEmail(token: string): Promise<boolean> {
    const response = await apiClient.post<{ verified: boolean }>(
      API_ENDPOINTS.auth.verifyEmail,
      { token }
    );
    return (response.data as { verified: boolean }).verified;
  }

  async verifyPhone(otp: string): Promise<boolean> {
    const response = await apiClient.post<{ verified: boolean }>(
      API_ENDPOINTS.auth.verifyPhone,
      { otp }
    );
    return (response.data as { verified: boolean }).verified;
  }

  async forgotPassword(params: ForgotPasswordParams): Promise<boolean> {
    const response = await apiClient.post<{ sent: boolean }>(
      API_ENDPOINTS.auth.forgotPassword,
      params
    );
    return (response.data as { sent: boolean }).sent;
  }

  async resetPassword(params: ResetPasswordParams): Promise<boolean> {
    const response = await apiClient.post<{ success: boolean }>(
      API_ENDPOINTS.auth.resetPassword,
      params
    );
    return (response.data as { success: boolean }).success;
  }

  async logout(): Promise<void> {
    await apiClient.post(API_ENDPOINTS.auth.logout);
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    const response = await apiClient.post<AuthTokens>(
      API_ENDPOINTS.auth.refreshToken,
      { refreshToken }
    );
    return response.data as AuthTokens;
  }

  async setup2fa(params: Setup2faParams): Promise<{ secret: string; qrCodeUrl: string; backupCodes: string[] }> {
    const response = await apiClient.post<{ secret: string; qrCodeUrl: string; backupCodes: string[] }>(
      `${API_ENDPOINTS.users.me}/2fa/setup`,
      params
    );
    return response.data as { secret: string; qrCodeUrl: string; backupCodes: string[] };
  }

  async verify2fa(params: Verify2faParams): Promise<{ user: User; tokens: AuthTokens }> {
    const response = await apiClient.post<{ user: User; tokens: AuthTokens }>(
      `${API_ENDPOINTS.users.me}/2fa/verify`,
      params
    );
    return response.data as { user: User; tokens: AuthTokens };
  }

  async disable2fa(password: string): Promise<boolean> {
    const response = await apiClient.post<{ disabled: boolean }>(
      `${API_ENDPOINTS.users.me}/2fa/disable`,
      { password }
    );
    return (response.data as { disabled: boolean }).disabled;
  }

  async getMe(): Promise<User> {
    const response = await apiClient.get<User>(API_ENDPOINTS.users.me);
    return response.data as User;
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await apiClient.patch<User>(
      API_ENDPOINTS.users.updateProfile,
      data
    );
    return response.data as User;
  }
}

export const authService = new AuthService();
