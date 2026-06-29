import { apiClient, API_ENDPOINTS } from '@/lib/api/client';
import {
  Profile,
  Photo,
  FamilyInfo,
  Horoscope,
  PartnerPreference,
  ProfileCompletion,
} from '@/types';

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  heightCm?: number;
  weightKg?: number;
  maritalStatus?: string;
  religion?: string;
  caste?: string;
  motherTongue?: string;
  highestEducation?: string;
  occupation?: string;
  annualIncome?: number;
  workLocation?: string;
  diet?: string;
  smoking?: string;
  drinking?: string;
  aboutMe?: string;
  expectations?: string;
}

export interface PhotoUploadResponse {
  id: string;
  url: string;
  thumbnailUrl: string;
  isApproved: boolean;
}

export class ProfileService {
  async getMyProfile(): Promise<Profile> {
    const response = await apiClient.get<Profile>(API_ENDPOINTS.users.profile);
    return response.data as Profile;
  }

  async updateProfile(data: UpdateProfileData): Promise<Profile> {
    const response = await apiClient.patch<Profile>(
      API_ENDPOINTS.users.updateProfile,
      data
    );
    return response.data as Profile;
  }

  async getProfileCompletion(): Promise<ProfileCompletion> {
    const response = await apiClient.get<ProfileCompletion>(
      `${API_ENDPOINTS.users.profile}/completion`
    );
    return response.data as ProfileCompletion;
  }

  async uploadPhoto(file: File): Promise<PhotoUploadResponse> {
    const formData = new FormData();
    formData.append('photo', file);

    const response = await apiClient.upload<PhotoUploadResponse>(
      API_ENDPOINTS.profiles.uploadPhoto('me'),
      formData
    );
    return response.data as PhotoUploadResponse;
  }

  async updatePhoto(photoId: string, data: { isPrimary?: boolean; displayOrder?: number }): Promise<Photo> {
    const response = await apiClient.patch<Photo>(
      API_ENDPOINTS.profiles.photos('me') + `/${photoId}`,
      data
    );
    return response.data as Photo;
  }

  async deletePhoto(photoId: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.profiles.deletePhoto('me', photoId));
  }

  async getFamilyInfo(): Promise<FamilyInfo> {
    const response = await apiClient.get<FamilyInfo>(`${API_ENDPOINTS.users.profile}/family`);
    return response.data as FamilyInfo;
  }

  async updateFamilyInfo(data: Partial<FamilyInfo>): Promise<FamilyInfo> {
    const response = await apiClient.patch<FamilyInfo>(
      `${API_ENDPOINTS.users.profile}/family`,
      data
    );
    return response.data as FamilyInfo;
  }

  async getHoroscope(): Promise<Horoscope> {
    const response = await apiClient.get<Horoscope>(`${API_ENDPOINTS.users.profile}/horoscope`);
    return response.data as Horoscope;
  }

  async updateHoroscope(data: Partial<Horoscope>): Promise<Horoscope> {
    const response = await apiClient.patch<Horoscope>(
      `${API_ENDPOINTS.users.profile}/horoscope`,
      data
    );
    return response.data as Horoscope;
  }

  async getPartnerPreference(): Promise<PartnerPreference> {
    const response = await apiClient.get<PartnerPreference>(
      `${API_ENDPOINTS.users.profile}/preferences`
    );
    return response.data as PartnerPreference;
  }

  async updatePartnerPreference(data: Partial<PartnerPreference>): Promise<PartnerPreference> {
    const response = await apiClient.patch<PartnerPreference>(
      `${API_ENDPOINTS.users.profile}/preferences`,
      data
    );
    return response.data as PartnerPreference;
  }

  async getProfileById(id: string): Promise<Profile> {
    const response = await apiClient.get<Profile>(API_ENDPOINTS.profiles.byId(id));
    return response.data as Profile;
  }
}

export const profileService = new ProfileService();
