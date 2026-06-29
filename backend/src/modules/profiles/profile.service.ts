// ============================================================
// Profile Service
// ============================================================

import { db } from '../../config/database';
import logger, { log } from '../../config/logger';
import {
  NotFoundError,
  ForbiddenError,
  ValidationError,
  ProfileIncompleteError
} from '../../shared/utils/errors';
import { UserRole, PartnerPreference } from '../../types/index';
import { VisibilityLevel } from './profile-visibility';

const TEXT_FIELDS = ['about_me', 'expectations', 'education_details', 'occupation_details', 'about_family'];
const MAX_TEXT_LENGTH = 10000;

function sanitizeText(text: string): string {
  if (typeof text !== 'string') return text;
  return text
    .trim()
    .substring(0, MAX_TEXT_LENGTH)
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

interface ProfileUpdateData {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  heightCm?: number;
  weightKg?: number;
  complexion?: string;
  bodyType?: string;
  physicalStatus?: 'normal' | 'disabled';
  religion?: string;
  caste?: string;
  subCaste?: string;
  motherTongue?: string;
  gothra?: string;
  highestEducation?: string;
  educationDetails?: string;
  occupation?: string;
  occupationDetails?: string;
  employedIn?: string;
  annualIncome?: number;
  workLocation?: string;
  diet?: string;
  smoking?: string;
  drinking?: string;
  hobbies?: string[];
  aboutMe?: string;
  expectations?: string;
  maritalStatus?: string;
  preferredLanguage?: string;
}

interface FamilyUpdateData {
  familyType?: string;
  familyStatus?: string;
  familyValues?: string;
  fatherName?: string;
  fatherOccupation?: string;
  fatherStatus?: string;
  motherName?: string;
  motherOccupation?: string;
  motherStatus?: string;
  brothersCount?: number;
  sistersCount?: number;
  brothersMarried?: number;
  sistersMarried?: number;
  familyLocation?: string;
  familyCity?: string;
  familyState?: string;
  aboutFamily?: string;
}

interface HoroscopeUpdateData {
  rashi?: string;
  nakshatra?: string;
  nakshatraPada?: number;
  gotra?: string;
  gothra?: string;
  manglik?: string;
  birthDate?: string;
  birthTime?: string;
  birthPlace?: string;
}

interface ProfileCompletion {
  percent: number;
  missingFields: string[];
  fieldWeights: Record<string, number>;
}

const PROFILE_FIELD_WEIGHTS: Record<string, number> = {
  first_name: 5,
  last_name: 3,
  date_of_birth: 5,
  gender: 5,
  height_cm: 3,
  weight_kg: 2,
  complexion: 2,
  body_type: 2,
  religion: 5,
  caste: 3,
  mother_tongue: 3,
  highest_education: 5,
  occupation: 4,
  annual_income: 4,
  diet: 2,
  marital_status: 4,
  about_me: 5,
  photos: 10,
  family_info: 5,
  horoscope: 3
};

const MINIMAL_FIELDS = ['first_name', 'last_name', 'gender', 'date_of_birth', 'religion'];

const BASIC_FIELDS = [
  ...MINIMAL_FIELDS,
  'height_cm',
  'marital_status',
  'mother_tongue',
  'highest_education',
  'occupation',
  'annual_income',
  'caste'
];

const FULL_FIELDS = [
  ...BASIC_FIELDS,
  'weight_kg',
  'complexion',
  'body_type',
  'physical_status',
  'sub_caste',
  'gothra',
  'education_details',
  'employed_in',
  'work_location',
  'diet',
  'smoking',
  'drinking',
  'hobbies',
  'about_me',
  'expectations'
];

export class ProfileService {
  async getProfile(
    userId: string,
    viewerId?: string,
    visibility: VisibilityLevel = 'basic'
  ): Promise<Record<string, unknown>> {
    const profile = await db('profiles')
      .where('user_id', userId)
      .first();

    if (!profile) {
      throw new NotFoundError('Profile', userId);
    }

    // Determine if viewer can see unapproved photos (owner or admin only)
    const isOwner = viewerId === userId;
    const canSeeUnapprovedPhotos = isOwner || visibility === 'admin';

    const [photos, familyInfo, horoscope, user] = await Promise.all([
      db('photos')
        .where('profile_id', profile.id)
        .where('visibility', '!=', 'hidden')
        .where(function () {
          if (canSeeUnapprovedPhotos) {
            // Owner/admin sees all photos
            this.where('is_approved', true).orWhere('is_approved', false);
          } else {
            // Others only see approved photos
            this.where('is_approved', true);
          }
        })
        .orderBy('display_order')
        .select('id', 'thumbnail_url', 'medium_url', 'large_url', 'is_primary', 'is_approved', 'approval_status', 'visibility'),
      db('family_info')
        .where('profile_id', profile.id)
        .first(),
      db('horoscopes')
        .where('profile_id', profile.id)
        .first(),
      db('users')
        .where('id', userId)
        .select('id', 'email', 'phone', 'role', 'status', 'created_at')
        .first()
    ]);

    const filteredPhotos = this.filterPhotosByVisibility(
      photos,
      visibility,
      viewerId,
      userId
    );

    let result: Record<string, unknown> = {
      id: profile.id,
      userId: profile.user_id,
      firstName: profile.first_name,
      middleName: profile.middle_name,
      lastName: profile.last_name,
      displayName: profile.display_name,
      profileSlug: profile.profile_slug,
      gender: profile.gender,
      dateOfBirth: profile.date_of_birth,
      age: profile.age,
      profileViews: profile.profile_views,
      interestsReceived: profile.interests_received,
      isVerified: profile.is_verified,
      isPremium: profile.is_premium,
      profileCompletionPercent: profile.profile_completion_percent,
      preferredLanguage: profile.preferred_language
    };

    if (visibility === 'basic' || visibility === 'full' || visibility === 'admin') {
      result = {
        ...result,
        heightCm: profile.height_cm,
        complexion: profile.complexion,
        bodyType: profile.body_type,
        physicalStatus: profile.physical_status,
        religion: profile.religion,
        caste: profile.caste,
        subCaste: profile.sub_caste,
        motherTongue: profile.mother_tongue,
        gothra: profile.gothra,
        highestEducation: profile.highest_education,
        educationDetails: profile.education_details,
        occupation: profile.occupation,
        occupationDetails: profile.occupation_details,
        employedIn: profile.employed_in,
        annualIncome: profile.annual_income,
        workLocation: profile.work_location,
        diet: profile.diet,
        smoking: profile.smoking,
        drinking: profile.drinking,
        hobbies: profile.hobbies,
        maritalStatus: profile.marital_status,
        aboutMe: profile.about_me,
        kycStatus: profile.kyc_status
      };
    }

    if (visibility === 'full' || visibility === 'admin') {
      result = {
        ...result,
        expectations: profile.expectations,
        photos: filteredPhotos,
        partnerPreference: profile.partner_preference,
        familyInfo: familyInfo,
        horoscope: horoscope ? {
          rashi: horoscope.rashi,
          nakshatra: horoscope.nakshatra,
          gotra: horoscope.gotra,
          gothra: horoscope.gothra,
          manglik: horoscope.manglik
        } : null
      };

      if (visibility === 'admin') {
        result = {
          ...result,
          email: user?.email,
          phone: user?.phone,
          fullProfile: profile,
          membership: await this.getMembershipStatus(userId)
        };
      }
    }

    return result;
  }

  async updateProfile(
    userId: string,
    data: ProfileUpdateData
  ): Promise<Record<string, unknown>> {
    const profile = await db('profiles')
      .where('user_id', userId)
      .first();

    if (!profile) {
      throw new NotFoundError('Profile');
    }

    const updateData: Record<string, unknown> = {};

    const fieldMappings: Record<string, string> = {
      firstName: 'first_name',
      middleName: 'middle_name',
      lastName: 'last_name',
      dateOfBirth: 'date_of_birth',
      heightCm: 'height_cm',
      weightKg: 'weight_kg',
      bodyType: 'body_type',
      physicalStatus: 'physical_status',
      subCaste: 'sub_caste',
      motherTongue: 'mother_tongue',
      highestEducation: 'highest_education',
      educationDetails: 'education_details',
      occupationDetails: 'occupation_details',
      employedIn: 'employed_in',
      annualIncome: 'annual_income',
      workLocation: 'work_location',
      maritalStatus: 'marital_status',
      preferredLanguage: 'preferred_language',
      aboutMe: 'about_me',
      expectations: 'expectations'
    };

    for (const [key, value] of Object.entries(data)) {
      const dbField = fieldMappings[key] || key.replace(/([A-Z])/g, '_$1').toLowerCase();
      if (value !== undefined) {
        if (TEXT_FIELDS.includes(dbField) && typeof value === 'string') {
          updateData[dbField] = sanitizeText(value);
        } else {
          updateData[dbField] = value;
        }
      }
    }

    if (Object.keys(updateData).length > 0) {
      updateData.updated_at = new Date();

      await db('profiles')
        .where('user_id', userId)
        .update(updateData);
    }

    const newCompletion = await this.calculateProfileCompletion(userId);
    await db('profiles')
      .where('user_id', userId)
      .update({ profile_completion_percent: newCompletion.percent });

    logger.info("Profile updated", { userId });

    return {
      ...updateData,
      profileCompletionPercent: newCompletion.percent,
      missingFields: newCompletion.missingFields
    };
  }

  async updatePartnerPreference(
    userId: string,
    data: Partial<PartnerPreference>
  ): Promise<Record<string, unknown>> {
    const profile = await db('profiles')
      .where('user_id', userId)
      .first();

    if (!profile) {
      throw new NotFoundError('Profile');
    }

    const currentPreference = profile.partner_preference || {};
    const updatedPreference = {
      ...currentPreference,
      ...data
    };

    await db('profiles')
      .where('user_id', userId)
      .update({
        partner_preference: JSON.stringify(updatedPreference),
        updated_at: new Date()
      });

    logger.info("Profile updated", { userId });

    return { partnerPreference: updatedPreference };
  }

  async getFamilyInfo(
    userId: string,
    viewerId?: string,
    visibility: VisibilityLevel = 'basic'
  ): Promise<Record<string, unknown> | null> {
    const profile = await db('profiles')
      .where('user_id', userId)
      .first();

    if (!profile) {
      throw new NotFoundError('Profile');
    }

    const familyInfo = await db('family_info')
      .where('profile_id', profile.id)
      .first();

    if (!familyInfo) {
      return null;
    }

    if (visibility === 'minimal' || visibility === 'basic') {
      return {
        familyType: familyInfo.family_type,
        familyStatus: familyInfo.family_status
      };
    }

    return {
      id: familyInfo.id,
      familyType: familyInfo.family_type,
      familyStatus: familyInfo.family_status,
      familyValues: familyInfo.family_values,
      fatherName: familyInfo.father_name,
      fatherOccupation: familyInfo.father_occupation,
      fatherStatus: familyInfo.father_status,
      motherName: familyInfo.mother_name,
      motherOccupation: familyInfo.mother_occupation,
      motherStatus: familyInfo.mother_status,
      brothersCount: familyInfo.brothers_count,
      sistersCount: familyInfo.sisters_count,
      brothersMarried: familyInfo.brothers_married,
      sistersMarried: familyInfo.sisters_married,
      familyLocation: familyInfo.family_location,
      familyCity: familyInfo.family_city,
      familyState: familyInfo.family_state,
      aboutFamily: familyInfo.about_family
    };
  }

  async updateFamilyInfo(
    userId: string,
    data: FamilyUpdateData
  ): Promise<Record<string, unknown>> {
    const profile = await db('profiles')
      .where('user_id', userId)
      .first();

    if (!profile) {
      throw new NotFoundError('Profile');
    }

    let familyInfo = await db('family_info')
      .where('profile_id', profile.id)
      .first();

    const updateData: Record<string, unknown> = {};

    const fieldMappings: Record<string, string> = {
      familyType: 'family_type',
      familyStatus: 'family_status',
      familyValues: 'family_values',
      fatherName: 'father_name',
      fatherOccupation: 'father_occupation',
      fatherStatus: 'father_status',
      motherName: 'mother_name',
      motherOccupation: 'mother_occupation',
      motherStatus: 'mother_status',
      brothersCount: 'brothers_count',
      sistersCount: 'sisters_count',
      brothersMarried: 'brothers_married',
      sistersMarried: 'sisters_married',
      familyLocation: 'family_location',
      familyCity: 'family_city',
      familyState: 'family_state',
      aboutFamily: 'about_family'
    };

    for (const [key, value] of Object.entries(data)) {
      const dbField = fieldMappings[key] || key;
      if (value !== undefined) {
        if ((dbField === 'about_family') && typeof value === 'string') {
          updateData[dbField] = sanitizeText(value);
        } else {
          updateData[dbField] = value;
        }
      }
    }

    if (!familyInfo) {
      updateData.id = require('uuid').v4();
      updateData.profile_id = profile.id;
      updateData.created_at = new Date();
      updateData.updated_at = new Date();

      await db('family_info').insert(updateData);
    } else {
      updateData.updated_at = new Date();
      await db('family_info')
        .where('profile_id', profile.id)
        .update(updateData);
    }

    const newCompletion = await this.calculateProfileCompletion(userId);
    await db('profiles')
      .where('user_id', userId)
      .update({ profile_completion_percent: newCompletion.percent });

    logger.info("Profile updated", { userId });

    return updateData;
  }

  async getHoroscope(
    userId: string,
    viewerId?: string,
    visibility: VisibilityLevel = 'basic'
  ): Promise<Record<string, unknown> | null> {
    const profile = await db('profiles')
      .where('user_id', userId)
      .first();

    if (!profile) {
      throw new NotFoundError('Profile');
    }

    const horoscope = await db('horoscopes')
      .where('profile_id', profile.id)
      .first();

    if (!horoscope) {
      return null;
    }

    if (visibility === 'minimal' || visibility === 'basic') {
      return {
        rashi: horoscope.rashi,
        nakshatra: horoscope.nakshatra,
        manglik: horoscope.manglik
      };
    }

    return {
      id: horoscope.id,
      rashi: horoscope.rashi,
      nakshatra: horoscope.nakshatra,
      nakshatraPada: horoscope.nakshatra_pada,
      gotra: horoscope.gotra,
      gothra: horoscope.gothra,
      manglik: horoscope.manglik,
      ashtaKoot: horoscope.ashta_koot,
      birthDate: horoscope.birth_date,
      birthTime: horoscope.birth_time,
      birthPlace: horoscope.birth_place,
      documentStatus: horoscope.document_status
    };
  }

  async updateHoroscope(
    userId: string,
    data: HoroscopeUpdateData
  ): Promise<Record<string, unknown>> {
    const profile = await db('profiles')
      .where('user_id', userId)
      .first();

    if (!profile) {
      throw new NotFoundError('Profile');
    }

    let horoscope = await db('horoscopes')
      .where('profile_id', profile.id)
      .first();

    const updateData: Record<string, unknown> = {};

    const fieldMappings: Record<string, string> = {
      nakshatraPada: 'nakshatra_pada',
      birthDate: 'birth_date',
      birthTime: 'birth_time',
      birthPlace: 'birth_place'
    };

    for (const [key, value] of Object.entries(data)) {
      const dbField = fieldMappings[key] || key.replace(/([A-Z])/g, '_$1').toLowerCase();
      if (value !== undefined) {
        updateData[dbField] = value;
      }
    }

    if (!horoscope) {
      updateData.id = require('uuid').v4();
      updateData.profile_id = profile.id;
      updateData.document_status = 'pending';
      updateData.created_at = new Date();
      updateData.updated_at = new Date();

      await db('horoscopes').insert(updateData);
    } else {
      updateData.updated_at = new Date();
      await db('horoscopes')
        .where('profile_id', profile.id)
        .update(updateData);
    }

    const newCompletion = await this.calculateProfileCompletion(userId);
    await db('profiles')
      .where('user_id', userId)
      .update({ profile_completion_percent: newCompletion.percent });

    logger.info("Profile updated", { userId });

    return updateData;
  }

  async getProfileCompletion(userId: string): Promise<ProfileCompletion> {
    return await this.calculateProfileCompletion(userId);
  }

  async getProfileSharingInfo(userId: string): Promise<{ profileSlug: string; displayName: string }> {
    const profile = await db('profiles')
      .where('user_id', userId)
      .select('profile_slug', 'display_name')
      .first();

    if (!profile) {
      throw new NotFoundError('Profile');
    }

    return {
      profileSlug: profile.profile_slug,
      displayName: profile.display_name
    };
  }

  private async calculateProfileCompletion(userId: string): Promise<ProfileCompletion> {
    const profile = await db('profiles')
      .where('user_id', userId)
      .first();

    if (!profile) {
      return { percent: 0, missingFields: Object.keys(PROFILE_FIELD_WEIGHTS), fieldWeights: PROFILE_FIELD_WEIGHTS };
    }

    const [photoCount, familyInfo, horoscope] = await Promise.all([
      db('photos')
        .where('profile_id', profile.id)
        .where('is_approved', true)
        .count('* as count')
        .first(),
      db('family_info')
        .where('profile_id', profile.id)
        .first(),
      db('horoscopes')
        .where('profile_id', profile.id)
        .first()
    ]);

    let totalWeight = 0;
    let earnedWeight = 0;
    const missingFields: string[] = [];

    for (const [field, weight] of Object.entries(PROFILE_FIELD_WEIGHTS)) {
      totalWeight += weight;

      let isFilled = false;

      if (field === 'photos') {
        isFilled = (Number(photoCount?.count) || 0) > 0;
      } else if (field === 'family_info') {
        isFilled = !!familyInfo && (
          familyInfo.father_name ||
          familyInfo.mother_name ||
          familyInfo.about_family
        );
      } else if (field === 'horoscope') {
        isFilled = !!horoscope && !!horoscope.rashi;
      } else {
        isFilled = profile[field] !== null && profile[field] !== undefined && profile[field] !== '';
      }

      if (isFilled) {
        earnedWeight += weight;
      } else {
        missingFields.push(field);
      }
    }

    const percent = totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 0;

    return {
      percent,
      missingFields,
      fieldWeights: PROFILE_FIELD_WEIGHTS
    };
  }

  private filterPhotosByVisibility(
    photos: Record<string, unknown>[],
    visibility: VisibilityLevel,
    viewerId?: string,
    ownerId?: string
  ): Record<string, unknown>[] {
    if (visibility === 'minimal') {
      return photos.map(photo => ({
        id: photo.id,
        isPrimary: photo.is_primary,
        medium_url: null,
        large_url: null,
        thumbnail_url: null,
        approvalStatus: photo.approval_status
      }));
    }

    return photos.map(photo => {
      const photoVisibility = photo.visibility as string;
      const isOwner = viewerId === ownerId;

      if (photoVisibility === 'hidden' && !isOwner) {
        return { id: photo.id, isPrimary: photo.is_primary };
      }

      if (photoVisibility === 'contacts' && !viewerId) {
        return { id: photo.id, isPrimary: photo.is_primary };
      }

      if (photoVisibility === 'contacts' && viewerId && viewerId !== ownerId) {
        return { id: photo.id, isPrimary: photo.is_primary };
      }

      // Owner or full visibility - show photo details
      if (isOwner || visibility === 'full' || visibility === 'admin') {
        return {
          id: photo.id,
          thumbnailUrl: photo.thumbnail_url,
          mediumUrl: photo.medium_url,
          largeUrl: photo.large_url,
          isPrimary: photo.is_primary,
          isApproved: photo.is_approved,
          approvalStatus: photo.approval_status,
          visibility: photo.visibility
        };
      }

      return photo;
    });
  }

  private async getMembershipStatus(userId: string): Promise<Record<string, unknown> | null> {
    return await db('user_memberships')
      .where('user_id', userId)
      .where('status', 'active')
      .where('end_date', '>', new Date())
      .orderBy('created_at', 'desc')
      .first();
  }
}
