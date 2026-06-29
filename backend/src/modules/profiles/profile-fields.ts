// ============================================================
// Profile Visibility Field Permissions
// ============================================================

import { VisibilityLevel } from './profile-visibility';

export const fieldPermissions: Record<VisibilityLevel, string[]> = {
  minimal: [
    'first_name',
    'age',
    'gender',
    'religion',
    'marital_status',
    'mother_tongue',
    'caste',
    'profile_slug',
    'is_verified',
    'profile_completion_percent',
    'profile_views'
  ],
  basic: [
    'first_name',
    'middle_name',
    'last_name',
    'age',
    'gender',
    'date_of_birth',
    'height_cm',
    'complexion',
    'body_type',
    'physical_status',
    'religion',
    'caste',
    'sub_caste',
    'mother_tongue',
    'highest_education',
    'occupation',
    'annual_income',
    'work_location',
    'diet',
    'smoking',
    'drinking',
    'marital_status',
    'about_me',
    'profile_slug',
    'is_verified',
    'is_premium',
    'is_featured',
    'profile_completion_percent',
    'profile_views',
    'interests_received',
    'kyc_status'
  ],
  full: [
    'first_name',
    'middle_name',
    'last_name',
    'display_name',
    'age',
    'gender',
    'date_of_birth',
    'height_cm',
    'weight_kg',
    'complexion',
    'body_type',
    'physical_status',
    'religion',
    'caste',
    'sub_caste',
    'mother_tongue',
    'gothra',
    'highest_education',
    'education_details',
    'occupation',
    'occupation_details',
    'employed_in',
    'annual_income',
    'work_location',
    'diet',
    'smoking',
    'drinking',
    'hobbies',
    'about_me',
    'expectations',
    'profile_slug',
    'profile_visibility',
    'photo_visibility',
    'is_verified',
    'is_premium',
    'is_featured',
    'profile_completion_percent',
    'profile_views',
    'interests_received',
    'interests_sent',
    'shortlists_received',
    'kyc_status',
    'preferred_language',
    'last_active_at',
    'photos',
    'family_info',
    'horoscope',
    'partner_preference'
  ],
  admin: [
    'first_name',
    'middle_name',
    'last_name',
    'display_name',
    'age',
    'gender',
    'date_of_birth',
    'height_cm',
    'weight_kg',
    'complexion',
    'body_type',
    'physical_status',
    'religion',
    'caste',
    'sub_caste',
    'mother_tongue',
    'gothra',
    'highest_education',
    'education_details',
    'college_university',
    'occupation',
    'occupation_details',
    'employed_in',
    'annual_income',
    'work_location',
    'diet',
    'smoking',
    'drinking',
    'hobbies',
    'about_me',
    'expectations',
    'profile_slug',
    'profile_visibility',
    'photo_visibility',
    'is_verified',
    'is_premium',
    'is_featured',
    'is_online',
    'profile_completion_percent',
    'profile_views',
    'interests_received',
    'interests_sent',
    'shortlists_received',
    'kyc_status',
    'kyc_verified_at',
    'preferred_language',
    'last_active_at',
    'created_at',
    'updated_at',
    'photos',
    'family_info',
    'horoscope',
    'partner_preference',
    'email',
    'phone',
    'status',
    'role',
    'membership',
    'franchise_centre'
  ]
};

export const photoVisibilityLevels: Record<string, VisibilityLevel> = {
  all: 'minimal',
  contacts: 'basic',
  hidden: 'minimal'
};

export function canViewContactDetails(visibility: VisibilityLevel): boolean {
  return visibility === 'full' || visibility === 'admin';
}

export function canViewSocialLinks(visibility: VisibilityLevel): boolean {
  return visibility === 'full' || visibility === 'admin';
}

export function canViewHoroscope(visibility: VisibilityLevel): boolean {
  return visibility === 'full' || visibility === 'admin';
}

export function canViewFamilyDetails(visibility: VisibilityLevel): boolean {
  return visibility === 'full' || visibility === 'admin';
}

export function shouldBlurPhotos(visibility: VisibilityLevel): boolean {
  return visibility === 'minimal';
}
