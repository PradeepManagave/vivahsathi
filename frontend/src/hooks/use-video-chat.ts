import { useState, useCallback } from 'react';
import { apiClient, API_ENDPOINTS } from '@/lib/api/client';

interface VideoCall {
  id: string;
  caller_id: string;
  receiver_id: string;
  room_name: string;
  room_url?: string;
  status: 'pending' | 'ringing' | 'accepted' | 'declined' | 'missed' | 'completed';
  started_at?: string;
  ended_at?: string;
  duration?: number;
  recording_consent_given: boolean;
  created_at: string;
  caller_first_name?: string;
  caller_last_name?: string;
  caller_avatar?: string;
  receiver_first_name?: string;
  receiver_last_name?: string;
  receiver_avatar?: string;
}

interface CallDetails extends VideoCall {
  token?: string;
  expiresAt?: string;
}

interface UseVideoChatOptions {
  onIncomingCall?: (call: VideoCall) => void;
  onCallEnded?: () => void;
}

export function useVideoChat(options: UseVideoChatOptions = {}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentCall, setCurrentCall] = useState<CallDetails | null>(null);
  const [callHistory, setCallHistory] = useState<VideoCall[]>([]);
  const [incomingCalls, setIncomingCalls] = useState<VideoCall[]>([]);

  const handleError = useCallback((err: unknown) => {
    const apiError = (err as { message?: string })?.message || 'An unexpected error occurred';
    setError(apiError);
  }, []);

  const initiateCall = useCallback(async (profileId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post<VideoCall>(
        API_ENDPOINTS.videoChat.initiate(profileId)
      );
      if (response.success && response.data) {
        setCurrentCall(response.data);
        return response.data;
      } else {
        throw new Error(response.error?.message || 'Failed to initiate call');
      }
    } catch (err) {
      handleError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const acceptCall = useCallback(async (callId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post<VideoCall>(
        API_ENDPOINTS.videoChat.accept(callId)
      );
      if (response.success && response.data) {
        setCurrentCall(response.data);
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

  const declineCall = useCallback(async (callId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post(
        API_ENDPOINTS.videoChat.decline(callId)
      );
      if (response.success) {
        setIncomingCalls(prev => prev.filter(c => c.id !== callId));
        return true;
      }
      return false;
    } catch (err) {
      handleError(err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const joinCall = useCallback(async (callId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post<CallDetails>(
        API_ENDPOINTS.videoChat.join(callId)
      );
      if (response.success && response.data) {
        setCurrentCall(response.data);
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

  const endCall = useCallback(async (callId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post<VideoCall>(
        API_ENDPOINTS.videoChat.end(callId)
      );
      if (response.success && response.data) {
        setCurrentCall(null);
        options.onCallEnded?.();
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

  const giveRecordingConsent = useCallback(async (callId: string, consent: boolean) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post<{ recordingEnabled: boolean }>(
        API_ENDPOINTS.videoChat.consent(callId),
        { consent }
      );
      if (response.success && response.data && currentCall) {
        setCurrentCall({
          ...currentCall,
          recording_consent_given: response.data.recordingEnabled
        });
        return response.data.recordingEnabled;
      }
      return false;
    } catch (err) {
      handleError(err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [handleError, currentCall]);

  const getCallHistory = useCallback(async (page = 1, limit = 20) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<{ data: VideoCall[]; pagination: { total: number } }>(
        API_ENDPOINTS.videoChat.history,
        { page, limit }
      );
      if (response.success && response.data) {
        setCallHistory(response.data.data);
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

  const getIncomingCalls = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<VideoCall[]>(API_ENDPOINTS.videoChat.incoming);
      if (response.success && response.data) {
        setIncomingCalls(response.data);
        response.data.forEach(call => {
          options.onIncomingCall?.(call);
        });
        return response.data;
      }
      return [];
    } catch (err) {
      handleError(err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [handleError, options]);

  const getCallDetails = useCallback(async (callId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<CallDetails>(
        API_ENDPOINTS.videoChat.details(callId)
      );
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

  return {
    loading,
    error,
    currentCall,
    callHistory,
    incomingCalls,
    setError,
    initiateCall,
    acceptCall,
    declineCall,
    joinCall,
    endCall,
    giveRecordingConsent,
    getCallHistory,
    getIncomingCalls,
    getCallDetails
  };
}
