// ============================================================
// OTP Verification Hook
// ============================================================

'use client';

import { useState, useCallback } from 'react';
import { apiClient, API_ENDPOINTS } from '@/lib/api';

interface OtpState {
  phone: string;
  tempToken: string | null;
  expiresIn: number;
  isSent: boolean;
  isVerified: boolean;
  isLoading: boolean;
  error: string | null;
  attempts: number;
}

interface UseOtpOptions {
  onSuccess?: (tempToken: string) => void;
  onError?: (error: string) => void;
}

export function useOtp(options: UseOtpOptions = {}) {
  const [state, setState] = useState<OtpState>({
    phone: '',
    tempToken: null,
    expiresIn: 0,
    isSent: false,
    isVerified: false,
    isLoading: false,
    error: null,
    attempts: 0
  });

  // Send OTP
  const sendOtp = useCallback(async (phone: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      await apiClient.post(API_ENDPOINTS.auth.sendOtp, { phone });

      setState((prev) => ({
        ...prev,
        phone,
        isSent: true,
        isLoading: false,
        expiresIn: 600 // 10 minutes
      }));

      // Start countdown
      const interval = setInterval(() => {
        setState((prev) => {
          if (prev.expiresIn <= 1) {
            clearInterval(interval);
            return { ...prev, expiresIn: 0, isSent: false };
          }
          return { ...prev, expiresIn: prev.expiresIn - 1 };
        });
      }, 1000);
    } catch (error: unknown) {
      const apiError = (error as { response?: { data?: { error?: { message?: string } } } })
        ?.response?.data?.error?.message || 'Failed to send OTP';

      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: apiError
      }));

      options.onError?.(apiError);
    }
  }, [options.onError]);

  // Verify OTP
  const verifyOtp = useCallback(async (otp: string) => {
    if (!state.phone) {
      setState((prev) => ({
        ...prev,
        error: 'Please enter phone number first'
      }));
      return false;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await apiClient.post<{ tempToken: string; expiresIn: number }>(
        API_ENDPOINTS.auth.verifyOtp,
        { phone: state.phone, otp }
      );

      setState((prev) => ({
        ...prev,
        tempToken: response.data!.tempToken,
        isVerified: true,
        isLoading: false
      }));

      options.onSuccess?.(response.data!.tempToken);
      return true;
    } catch (error: unknown) {
      const apiError = (error as { response?: { data?: { error?: { message?: string } } } })
        ?.response?.data?.error?.message || 'Invalid OTP';

      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: apiError,
        attempts: prev.attempts + 1
      }));

      options.onError?.(apiError);
      return false;
    }
  }, [state.phone, options]);

  // Resend OTP
  const resendOtp = useCallback(async () => {
    return sendOtp(state.phone);
  }, [state.phone, sendOtp]);

  // Reset state
  const reset = useCallback(() => {
    setState({
      phone: '',
      tempToken: null,
      expiresIn: 0,
      isSent: false,
      isVerified: false,
      isLoading: false,
      error: null,
      attempts: 0
    });
  }, []);

  // Format time
  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return {
    ...state,
    sendOtp,
    verifyOtp,
    resendOtp,
    reset,
    formatTime,
    formattedTime: formatTime(state.expiresIn)
  };
}
