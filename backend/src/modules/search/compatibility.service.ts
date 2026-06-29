// ============================================================
// Compatibility Scoring Service
// ============================================================

import { db } from '../../config/database';
import logger, { log } from '../../config/logger';

interface CompatibilityMatch {
  overallScore: number;
  breakdown: {
    religion: { score: number; max: number; match: boolean };
    caste: { score: number; max: number; match: boolean };
    motherTongue: { score: number; max: number; match: boolean };
    education: { score: number; max: number; match: boolean };
    occupation: { score: number; max: number; match: boolean };
    age: { score: number; max: number; match: boolean };
    height: { score: number; max: number; match: boolean };
    location: { score: number; max: number; match: boolean };
    income: { score: number; max: number; match: boolean };
    diet: { score: number; max: number; match: boolean };
    maritalStatus: { score: number; max: number; match: boolean };
  };
  matchedPreferences: string[];
  unmatchedPreferences: string[];
  suggestions: string[];
}

interface PartnerPreference {
  minAge?: number;
  maxAge?: number;
  minHeightCm?: number;
  maxHeightCm?: number;
  religions?: string[];
  castes?: string[];
  motherTongues?: string[];
  educations?: string[];
  occupations?: string[];
  minIncome?: number;
  maxIncome?: number;
  diet?: string[];
  maritalStatus?: string[];
  countries?: string[];
  states?: string[];
  cities?: string[];
}

interface Profile {
  religion?: string;
  caste?: string;
  subCaste?: string;
  motherTongue?: string;
  highestEducation?: string;
  educationLevel?: string;
  occupation?: string;
  age?: number;
  heightCm?: number;
  annualIncome?: number;
  diet?: string;
  maritalStatus?: string;
  workLocation?: string;
  familyCity?: string;
  familyState?: string;
}

const SCORING_WEIGHTS = {
  religion: 15,
  caste: 12,
  motherTongue: 10,
  education: 8,
  occupation: 7,
  age: 8,
  height: 5,
  location: 10,
  income: 5,
  diet: 5,
  maritalStatus: 15
};

export class CompatibilityService {
  async calculateMatchPercentage(
    viewerId: string,
    targetProfileId: string
  ): Promise<CompatibilityMatch> {
    const [viewerProfile, targetProfile] = await Promise.all([
      db('profiles')
        .where('user_id', viewerId)
        .first(),
      db('profiles')
        .where('id', targetProfileId)
        .first()
    ]);

    if (!viewerProfile || !targetProfile) {
      throw new Error('Profile not found');
    }

    const viewerPreferences: PartnerPreference = viewerProfile.partner_preference || {};
    const viewerFamily = await db('family_info')
      .where('profile_id', viewerProfile.id)
      .first();

    const targetFamily = await db('family_info')
      .where('profile_id', targetProfileId)
      .first();

    const target: Profile = {
      religion: targetProfile.religion,
      caste: targetProfile.caste,
      subCaste: targetProfile.sub_caste,
      motherTongue: targetProfile.mother_tongue,
      highestEducation: targetProfile.highest_education,
      occupation: targetProfile.occupation,
      age: targetProfile.age,
      heightCm: targetProfile.height_cm,
      annualIncome: targetProfile.annual_income,
      diet: targetProfile.diet,
      maritalStatus: targetProfile.marital_status,
      workLocation: targetProfile.work_location,
      familyCity: targetFamily?.family_city,
      familyState: targetFamily?.family_state
    };

    const breakdown = this.calculateBreakdown(viewerPreferences, target);
    const overallScore = this.calculateOverallScore(breakdown);
    const { matchedPreferences, unmatchedPreferences } = this.getPreferenceMatches(
      viewerPreferences,
      target
    );
    const suggestions = this.generateSuggestions(viewerPreferences, target);

    logger.info('Compatibility calculated', {
      viewerId,
      targetProfileId,
      score: overallScore
    });

    return {
      overallScore,
      breakdown,
      matchedPreferences,
      unmatchedPreferences,
      suggestions
    };
  }

  private calculateBreakdown(
    preferences: PartnerPreference,
    profile: Profile
  ): CompatibilityMatch['breakdown'] {
    const religion = this.scoreReligion(preferences, profile);
    const caste = this.scoreCaste(preferences, profile);
    const motherTongue = this.scoreMotherTongue(preferences, profile);
    const education = this.scoreEducation(preferences, profile);
    const occupation = this.scoreOccupation(preferences, profile);
    const age = this.scoreAge(preferences, profile);
    const height = this.scoreHeight(preferences, profile);
    const location = this.scoreLocation(preferences, profile);
    const income = this.scoreIncome(preferences, profile);
    const diet = this.scoreDiet(preferences, profile);
    const maritalStatus = this.scoreMaritalStatus(preferences, profile);

    return {
      religion,
      caste,
      motherTongue,
      education,
      occupation,
      age,
      height,
      location,
      income,
      diet,
      maritalStatus
    };
  }

  private scoreReligion(
    preferences: PartnerPreference,
    profile: Profile
  ): { score: number; max: number; match: boolean } {
    if (!preferences.religions?.length) {
      return { score: SCORING_WEIGHTS.religion, max: SCORING_WEIGHTS.religion, match: true };
    }
    const match = preferences.religions.includes(profile.religion || '');
    return {
      score: match ? SCORING_WEIGHTS.religion : 0,
      max: SCORING_WEIGHTS.religion,
      match
    };
  }

  private scoreCaste(
    preferences: PartnerPreference,
    profile: Profile
  ): { score: number; max: number; match: boolean } {
    if (!preferences.castes?.length) {
      return { score: SCORING_WEIGHTS.caste, max: SCORING_WEIGHTS.caste, match: true };
    }
    const profileCaste = profile.caste || profile.subCaste || '';
    const match = preferences.castes.some(c =>
      profileCaste.toLowerCase().includes(c.toLowerCase()) ||
      c.toLowerCase().includes(profileCaste.toLowerCase())
    );
    return {
      score: match ? SCORING_WEIGHTS.caste : 0,
      max: SCORING_WEIGHTS.caste,
      match
    };
  }

  private scoreMotherTongue(
    preferences: PartnerPreference,
    profile: Profile
  ): { score: number; max: number; match: boolean } {
    if (!preferences.motherTongues?.length) {
      return { score: SCORING_WEIGHTS.motherTongue, max: SCORING_WEIGHTS.motherTongue, match: true };
    }
    const match = preferences.motherTongues.includes(profile.motherTongue || '');
    return {
      score: match ? SCORING_WEIGHTS.motherTongue : SCORING_WEIGHTS.motherTongue / 2,
      max: SCORING_WEIGHTS.motherTongue,
      match
    };
  }

  private scoreEducation(
    preferences: PartnerPreference,
    profile: Profile
  ): { score: number; max: number; match: boolean } {
    if (!preferences.educations?.length) {
      return { score: SCORING_WEIGHTS.education, max: SCORING_WEIGHTS.education, match: true };
    }
    const match = preferences.educations.some(e =>
      (profile.highestEducation || '').toLowerCase().includes(e.toLowerCase())
    );
    return {
      score: match ? SCORING_WEIGHTS.education : 0,
      max: SCORING_WEIGHTS.education,
      match
    };
  }

  private scoreOccupation(
    preferences: PartnerPreference,
    profile: Profile
  ): { score: number; max: number; match: boolean } {
    if (!preferences.occupations?.length) {
      return { score: SCORING_WEIGHTS.occupation, max: SCORING_WEIGHTS.occupation, match: true };
    }
    const match = preferences.occupations.some(o =>
      (profile.occupation || '').toLowerCase().includes(o.toLowerCase())
    );
    return {
      score: match ? SCORING_WEIGHTS.occupation : 0,
      max: SCORING_WEIGHTS.occupation,
      match
    };
  }

  private scoreAge(
    preferences: PartnerPreference,
    profile: Profile
  ): { score: number; max: number; match: boolean } {
    const minAge = preferences.minAge || 18;
    const maxAge = preferences.maxAge || 70;
    const age = profile.age || 30;

    if (age >= minAge && age <= maxAge) {
      const idealAge = (minAge + maxAge) / 2;
      const distance = Math.abs(age - idealAge);
      const maxDistance = (maxAge - minAge) / 2;
      const ratio = 1 - (distance / maxDistance);

      return {
        score: Math.round(SCORING_WEIGHTS.age * Math.max(0.5, ratio)),
        max: SCORING_WEIGHTS.age,
        match: true
      };
    }

    return { score: 0, max: SCORING_WEIGHTS.age, match: false };
  }

  private scoreHeight(
    preferences: PartnerPreference,
    profile: Profile
  ): { score: number; max: number; match: boolean } {
    const minHeight = preferences.minHeightCm || 100;
    const maxHeight = preferences.maxHeightCm || 250;
    const height = profile.heightCm || 170;

    if (height >= minHeight && height <= maxHeight) {
      return {
        score: SCORING_WEIGHTS.height,
        max: SCORING_WEIGHTS.height,
        match: true
      };
    }

    return { score: 0, max: SCORING_WEIGHTS.height, match: false };
  }

  private scoreLocation(
    preferences: PartnerPreference,
    profile: Profile
  ): { score: number; max: number; match: boolean } {
    const targetLocation = profile.workLocation || profile.familyCity || '';
    const targetState = profile.familyState || '';

    if (!preferences.countries?.length && !preferences.states?.length && !preferences.cities?.length) {
      return { score: SCORING_WEIGHTS.location, max: SCORING_WEIGHTS.location, match: true };
    }

    let match = false;

    if (preferences.cities?.length) {
      match = preferences.cities.some(c =>
        targetLocation.toLowerCase().includes(c.toLowerCase())
      );
    }

    if (!match && preferences.states?.length) {
      match = preferences.states.some(s =>
        targetState.toLowerCase().includes(s.toLowerCase())
      );
    }

    if (!match && preferences.countries?.length) {
      match = preferences.countries.includes('India');
    }

    return {
      score: match ? SCORING_WEIGHTS.location : 0,
      max: SCORING_WEIGHTS.location,
      match
    };
  }

  private scoreIncome(
    preferences: PartnerPreference,
    profile: Profile
  ): { score: number; max: number; match: boolean } {
    const minIncome = preferences.minIncome || 0;
    const income = profile.annualIncome || 0;

    if (income >= minIncome) {
      const idealIncome = preferences.maxIncome || minIncome * 2;
      if (income <= idealIncome) {
        return {
          score: SCORING_WEIGHTS.income,
          max: SCORING_WEIGHTS.income,
          match: true
        };
      }
      return {
        score: Math.round(SCORING_WEIGHTS.income * 0.7),
        max: SCORING_WEIGHTS.income,
        match: true
      };
    }

    return { score: 0, max: SCORING_WEIGHTS.income, match: false };
  }

  private scoreDiet(
    preferences: PartnerPreference,
    profile: Profile
  ): { score: number; max: number; match: boolean } {
    if (!preferences.diet?.length) {
      return { score: SCORING_WEIGHTS.diet, max: SCORING_WEIGHTS.diet, match: true };
    }
    const match = preferences.diet.includes(profile.diet || '');
    return {
      score: match ? SCORING_WEIGHTS.diet : SCORING_WEIGHTS.diet / 2,
      max: SCORING_WEIGHTS.diet,
      match
    };
  }

  private scoreMaritalStatus(
    preferences: PartnerPreference,
    profile: Profile
  ): { score: number; max: number; match: boolean } {
    if (!preferences.maritalStatus?.length) {
      return { score: SCORING_WEIGHTS.maritalStatus, max: SCORING_WEIGHTS.maritalStatus, match: true };
    }
    const match = preferences.maritalStatus.includes(profile.maritalStatus || '');
    return {
      score: match ? SCORING_WEIGHTS.maritalStatus : 0,
      max: SCORING_WEIGHTS.maritalStatus,
      match
    };
  }

  private calculateOverallScore(breakdown: CompatibilityMatch['breakdown']): number {
    let totalScore = 0;
    let totalMax = 0;

    for (const [key, value] of Object.entries(breakdown)) {
      totalScore += value.score;
      totalMax += value.max;
    }

    return totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0;
  }

  private getPreferenceMatches(
    preferences: PartnerPreference,
    profile: Profile
  ): { matchedPreferences: string[]; unmatchedPreferences: string[] } {
    const matched: string[] = [];
    const unmatched: string[] = [];

    if (preferences.religions?.length && preferences.religions.includes(profile.religion || '')) {
      matched.push(`Religion: ${profile.religion}`);
    } else if (preferences.religions?.length) {
      unmatched.push(`Religion: ${profile.religion} not in preferences`);
    }

    if (preferences.motherTongues?.length && preferences.motherTongues.includes(profile.motherTongue || '')) {
      matched.push(`Mother Tongue: ${profile.motherTongue}`);
    }

    if (preferences.educations?.length && preferences.educations.some(e =>
      (profile.highestEducation || '').toLowerCase().includes(e.toLowerCase())
    )) {
      matched.push(`Education: ${profile.highestEducation}`);
    }

    if (preferences.occupations?.length && preferences.occupations.some(o =>
      (profile.occupation || '').toLowerCase().includes(o.toLowerCase())
    )) {
      matched.push(`Occupation: ${profile.occupation}`);
    }

    return { matchedPreferences: matched, unmatchedPreferences: unmatched };
  }

  private generateSuggestions(
    preferences: PartnerPreference,
    profile: Profile
  ): string[] {
    const suggestions: string[] = [];

    if (!preferences.religions?.length) {
      suggestions.push('Broaden your religion preference to find more matches');
    }

    if (!preferences.castes?.length) {
      suggestions.push('Consider adding caste preferences or broadening existing ones');
    }

    if (preferences.minAge && preferences.maxAge && preferences.minAge > 25) {
      suggestions.push('Consider lowering minimum age requirement for more options');
    }

    if (!preferences.motherTongues?.length) {
      suggestions.push('Adding mother tongue preferences can improve match quality');
    }

    return suggestions;
  }
}

export const compatibilityService = new CompatibilityService();
