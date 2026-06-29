import { create } from 'zustand';
import { apiClient } from '@/lib/api/client';
import type { Profile } from '@/types';

interface ProfileState {
  profile: Profile | null;
  completionScore: number;
  loading: boolean;
  error: string | null;

  fetchProfile: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
  updatePhoto: (file: File) => Promise<void>;
  deletePhoto: (photoId: string) => Promise<void>;
  setProfile: (profile: Profile | null) => void;
  clearError: () => void;
}

export const useProfileStore = create<ProfileState>()((set, get) => ({
  profile: null,
  completionScore: 0,
  loading: false,
  error: null,

  fetchProfile: async () => {
    set({ loading: true, error: null });
    try {
      const res = await apiClient.get<{ profile: Profile; completionScore: number }>('/profiles/me');
      if (res.success && res.data) set({ profile: res.data.profile, completionScore: res.data.completionScore || 0 });
    } catch (e: any) { set({ error: e?.message || 'Failed to load profile' }); }
    finally { set({ loading: false }); }
  },

  updateProfile: async (data) => {
    set({ loading: true, error: null });
    try {
      const res = await apiClient.put<Profile>('/profiles/me', data);
      if (res.success && res.data) set({ profile: res.data });
    } catch (e: any) { set({ error: e?.message || 'Failed to update profile' }); }
    finally { set({ loading: false }); }
  },

  updatePhoto: async (file) => {
    set({ loading: true, error: null });
    try {
      const formData = new FormData();
      formData.append('photo', file);
      const res = await apiClient.upload<{ profile: Profile }>('/profiles/photos', formData);
      if (res.success && res.data) set({ profile: res.data.profile });
    } catch (e: any) { set({ error: e?.message || 'Failed to upload photo' }); }
    finally { set({ loading: false }); }
  },

  deletePhoto: async (photoId) => {
    set({ loading: true, error: null });
    try {
      const res = await apiClient.delete<{ profile: Profile }>(`/profiles/photos/${photoId}`);
      if (res.success && res.data) set({ profile: res.data.profile });
    } catch (e: any) { set({ error: e?.message || 'Failed to delete photo' }); }
    finally { set({ loading: false }); }
  },

  setProfile: (profile) => set({ profile }),
  clearError: () => set({ error: null }),
}));
