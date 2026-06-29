'use client';

import { useState, useCallback, useEffect } from 'react';
import { apiClient, API_ENDPOINTS } from '@/lib/api';

export interface ProfileData {
  id: string;
  memberId: string;
  name: string;
  gender: 'male' | 'female' | 'other';
  dateOfBirth: string;
  age: number;
  height?: string;
  weight?: string;
  bodyType?: string;
  complexion?: string;
  physicalStatus?: string;
  religion?: string;
  caste?: string;
  subCaste?: string;
  motherTongue?: string;
  country?: string;
  state?: string;
  city?: string;
  address?: string;
  education?: string;
  educationDetail?: string;
  profession?: string;
  professionDetail?: string;
  income?: string;
  maritalStatus?: string;
  aboutMe?: string;
  partnerExpectations?: string;
  isVerified: boolean;
  isPremium: boolean;
  profileCompletion: number;
  photos: Array<{
    id: string;
    url: string;
    isPrimary: boolean;
    isVerified: boolean;
    isPrivate: boolean;
  }>;
  family?: {
    fatherOccupation?: string;
    motherOccupation?: string;
    brothers?: number;
    sisters?: number;
    familyType?: string;
    familyStatus?: string;
    familyValues?: string;
  };
  horoscope?: {
    hasHoroscope: boolean;
    gothra?: string;
    raasi?: string;
    star?: string;
    rashiLord?: string;
    manglik: boolean;
  };
  partnerPreference?: {
    ageMin?: number;
    ageMax?: number;
    heightMin?: string;
    heightMax?: string;
    religion?: string;
    caste?: string;
    education?: string;
    profession?: string;
    income?: string;
    location?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface UseProfileReturn {
  profile: ProfileData | null;
  loading: boolean;
  error: string | null;
  fetchProfile: (id?: string) => Promise<void>;
  updateProfile: (data: Partial<ProfileData>) => Promise<void>;
  uploadPhoto: (file: File) => Promise<void>;
  setPrimaryPhoto: (photoId: string) => Promise<void>;
  deletePhoto: (photoId: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export function useProfile(profileId?: string): UseProfileReturn {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async (id?: string) => {
    try {
      setLoading(true);
      setError(null);
      const endpoint = id
        ? API_ENDPOINTS.profiles.byId(id)
        : API_ENDPOINTS.users.profile;
      const response = await apiClient.get(endpoint);
      const data = response.data as { data?: ProfileData };
      if (data?.data) {
        setProfile(data.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (data: Partial<ProfileData>) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.put(API_ENDPOINTS.users.updateProfile, data);
      const result = response.data as { data?: ProfileData };
      if (result?.data) {
        setProfile(result.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadPhoto = useCallback(async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('photo', file);
      const response = await apiClient.post(API_ENDPOINTS.profiles.uploadPhoto('me'), formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const result = response.data as { data?: ProfileData['photos'][0] };
      if (result?.data) {
        const newPhoto = result.data as ProfileData['photos'][0];
        setProfile((prev) =>
          prev
            ? { ...prev, photos: [...prev.photos, newPhoto] }
            : prev
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload photo');
      throw err;
    }
  }, []);

  const setPrimaryPhoto = useCallback(async (photoId: string) => {
    try {
      setError(null);
      await apiClient.put(`${API_ENDPOINTS.profiles.photos('me')}/${photoId}/primary`);
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              photos: prev.photos.map((p) => ({
                ...p,
                isPrimary: p.id === photoId
              }))
            }
          : prev
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set primary photo');
      throw err;
    }
  }, []);

  const deletePhoto = useCallback(async (photoId: string) => {
    try {
      setError(null);
      await apiClient.delete(API_ENDPOINTS.profiles.deletePhoto('me', photoId));
      setProfile((prev) =>
        prev
          ? { ...prev, photos: prev.photos.filter((p) => p.id !== photoId) }
          : prev
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete photo');
      throw err;
    }
  }, []);

  const refreshProfile = useCallback(() => {
    return fetchProfile(profileId);
  }, [fetchProfile, profileId]);

  useEffect(() => {
    if (!profile) {
      fetchProfile(profileId);
    }
  }, [profileId, fetchProfile, profile]);

  return {
    profile,
    loading,
    error,
    fetchProfile,
    updateProfile,
    uploadPhoto,
    setPrimaryPhoto,
    deletePhoto,
    refreshProfile
  };
}
