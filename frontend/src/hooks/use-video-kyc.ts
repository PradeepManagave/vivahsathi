import { useState, useCallback } from 'react';
import { apiClient, API_ENDPOINTS } from '@/lib/api/client';

interface KycSession {
  id: string;
  user_id: string;
  session_type: string;
  status: string;
  scheduled_at: string;
  room_id: string;
  room_url: string;
  started_at?: string;
  completed_at?: string;
}

interface KycSlot {
  id: string;
  centre_id: string;
  slot_date: string;
  start_time: string;
  end_time: string;
  kyc_type: string;
  max_participants: number;
  current_participants: number;
  status: string;
  centre_name?: string;
  staff_first_name?: string;
}

interface KycStatus {
  status: string;
  kycStatus: string;
  hasVerifiedBadge: boolean;
  lastKycDate: string | null;
  pendingChanges: boolean;
  currentSession?: KycSession;
}

interface UseVideoKycOptions {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function useVideoKyc(options: UseVideoKycOptions = {}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<KycSession | null>(null);
  const [slots, setSlots] = useState<KycSlot[]>([]);
  const [status, setStatus] = useState<KycStatus | null>(null);

  const handleError = useCallback((err: unknown) => {
    const apiError = (err as { message?: string })?.message || 'An unexpected error occurred';
    setError(apiError);
    options.onError?.(apiError);
  }, [options.onError]);

  const createSession = useCallback(async (scheduledAt?: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post<KycSession>(
        API_ENDPOINTS.videoKyc.createSession,
        { sessionType: 'video_verification', scheduledAt }
      );
      if (response.success && response.data) {
        setSession(response.data);
        options.onSuccess?.();
        return response.data;
      } else {
        throw new Error(response.error?.message || 'Failed to create session');
      }
    } catch (err) {
      handleError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleError, options]);

  const getStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<KycStatus>(API_ENDPOINTS.videoKyc.status);
      if (response.success && response.data) {
        setStatus(response.data);
        return response.data;
      }
      return null;
    } catch (err) {
      handleError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const getAvailableSlots = useCallback(async (centreId?: string, date?: string) => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = {};
      if (centreId) params.centreId = centreId;
      if (date) params.date = date;

      const response = await apiClient.get<KycSlot[]>(API_ENDPOINTS.videoKyc.slots, params);
      if (response.success && response.data) {
        setSlots(response.data);
        return response.data;
      }
      return [];
    } catch (err) {
      handleError(err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const bookSlot = useCallback(async (slotId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post<KycSession>(
        API_ENDPOINTS.videoKyc.bookSlot,
        { slotId }
      );
      if (response.success && response.data) {
        setSession(response.data);
        options.onSuccess?.();
        return response.data;
      } else {
        throw new Error(response.error?.message || 'Failed to book slot');
      }
    } catch (err) {
      handleError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleError, options]);

  const joinSession = useCallback(async (sessionId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post<{
        token: string;
        roomId: string;
        roomUrl: string;
        expiresAt: string;
      }>(API_ENDPOINTS.videoKyc.joinSession(sessionId));
      if (response.success && response.data) {
        return response.data;
      }
      return null;
    } catch (err) {
      handleError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const completeSession = useCallback(async (sessionId: string, notes?: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post<KycSession>(
        API_ENDPOINTS.videoKyc.completeSession(sessionId),
        { notes }
      );
      if (response.success && response.data) {
        setSession(response.data);
        options.onSuccess?.();
        return response.data;
      }
      return null;
    } catch (err) {
      handleError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleError, options]);

  const cancelSession = useCallback(async (sessionId: string, reason?: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post(
        API_ENDPOINTS.videoKyc.cancelSession(sessionId),
        { reason }
      );
      if (response.success) {
        setSession(null);
        options.onSuccess?.();
        return true;
      }
      return false;
    } catch (err) {
      handleError(err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [handleError, options]);

  return {
    loading,
    error,
    session,
    slots,
    status,
    setError,
    createSession,
    getStatus,
    getAvailableSlots,
    bookSlot,
    joinSession,
    completeSession,
    cancelSession
  };
}
