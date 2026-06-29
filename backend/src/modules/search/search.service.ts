// ============================================================
// Search Service - Elasticsearch Integration
// ============================================================

import { db } from '../../config/database';
import logger, { log } from '../../config/logger';
import { config } from '../../config/index';
import { NotFoundError, ValidationError } from '../../shared/utils/errors';
import { v4 as uuidv4 } from 'uuid';

interface EsQuery {
  bool: {
    must: Record<string, unknown>[];
    filter: Record<string, unknown>[];
    should?: Record<string, unknown>[];
    minimum_should_match?: number;
  };
}

interface SearchFilters {
  gender?: string;
  ageMin?: number;
  ageMax?: number;
  community?: string;
  religion?: string;
  caste?: string;
  motherTongue?: string;
  cityId?: string;
  stateId?: string;
  districtId?: string;
  countryId?: string;
  education?: string;
  educationLevel?: string;
  occupation?: string;
  occupationCategory?: string;
  incomeMin?: number;
  incomeMax?: number;
  heightMin?: number;
  heightMax?: number;
  manglik?: string;
  diet?: string;
  maritalStatus?: string;
  familyType?: string;
  physicalStatus?: string;
  kycVerified?: boolean;
  isPremium?: boolean;
  keyword?: string;
  name?: string;
  city?: string;
  state?: string;
  days?: number;
  page: number;
  limit: number;
  sort: string;
}

interface SearchOptions {
  viewerId?: string;
  isAdmin?: boolean;
  includeCompatibility?: boolean;
}

interface SearchResult {
  data: ProfileSearchResult[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  took: number;
}

interface ProfileSearchResult {
  id: string;
  userId: string;
  profileSlug: string;
  firstName: string;
  lastName: string;
  age: number;
  gender: string;
  religion: string;
  caste?: string;
  motherTongue?: string;
  highestEducation?: string;
  occupation?: string;
  annualIncome?: number;
  workLocation?: string;
  heightCm?: number;
  isVerified: boolean;
  isPremium: boolean;
  isFeatured: boolean;
  kycStatus: string;
  profileCompletionPercent: number;
  profileViews: number;
  createdAt: string;
  lastActiveAt?: string;
  isRecentlyJoined: boolean;
  compatibilityScore?: number;
  primaryPhoto?: {
    thumbnailUrl?: string;
    isApproved: boolean;
  };
  badges: string[];
  visibility: {
    showPhotos: boolean;
    blurPhotos: boolean;
    showContact: boolean;
  };
}

interface SavedSearch {
  id: string;
  userId: string;
  name: string;
  filters: SearchFilters;
  notifyOnNew: boolean;
  resultCount?: number;
  createdAt: string;
}

const OCCUPATION_CATEGORIES: Record<string, string[]> = {
  it_software: ['Software Engineer', 'IT Professional', 'Software Developer', 'Tech Lead', 'Project Manager', 'DevOps Engineer', 'Data Scientist', 'UI/UX Designer'],
  doctor: ['Doctor', 'Surgeon', 'Dentist', 'Physician', 'MBBS', 'MD', 'BAMS', 'BHMS'],
  engineer: ['Engineer', 'Civil Engineer', 'Mechanical Engineer', 'Electrical Engineer', 'Electronics Engineer'],
  teacher: ['Teacher', 'Professor', 'Lecturer', 'Principal', 'Education', 'Academic'],
  business: ['Business', 'Entrepreneur', 'Trader', 'Shop Owner', 'Self Employed'],
  banking: ['Banker', 'Bank Manager', 'Financial Analyst', 'Accountant', 'CA'],
  government: ['Government Employee', 'IAS Officer', 'Police', 'Defense', 'Civil Services'],
  lawyer: ['Lawyer', 'Advocate', 'Legal Professional', 'Judge'],
  accountant: ['Accountant', 'Chartered Accountant', 'Tax Consultant'],
  manager: ['Manager', 'Senior Manager', 'Director', 'Executive'],
  architect: ['Architect', 'Interior Designer', 'Urban Planner'],
  consultant: ['Consultant', 'Business Consultant', 'Management Consultant'],
  chef: ['Chef', 'Cook', 'Food Professional'],
  pilot: ['Pilot', 'Airline', 'Aviation'],
  police: ['Police Officer', 'Security', 'Defense Services'],
  other: []
};

export class SearchService {
  private useElasticsearch: boolean;

  constructor() {
    this.useElasticsearch = config.ELASTICSEARCH_ENABLED || false;
  }

  async searchProfiles(
    filters: SearchFilters,
    options: SearchOptions
  ): Promise<SearchResult> {
    const { viewerId, isAdmin, includeCompatibility } = options;
    const offset = (filters.page - 1) * filters.limit;

    if (this.useElasticsearch) {
      return this.elasticsearchSearch(filters, options);
    }

    return this.databaseSearch(filters, { ...options, offset });
  }

  private async elasticsearchSearch(
    filters: SearchFilters,
    options: SearchOptions
  ): Promise<SearchResult> {
    const { viewerId, isAdmin, includeCompatibility } = options;
    const offset = (filters.page - 1) * filters.limit;

    const query: EsQuery = {
      bool: {
        must: [],
        filter: []
      }
    };

    if (!isAdmin) {
      query.bool.filter!.push({ term: { status: 'active' } });
      query.bool.filter!.push({ term: { isApproved: true } });
    }

    if (filters.gender) {
      query.bool.must!.push({ term: { gender: filters.gender } });
    }

    if (filters.ageMin || filters.ageMax) {
      const range: Record<string, number> = {};
      if (filters.ageMin) range.gte = filters.ageMin;
      if (filters.ageMax) range.lte = filters.ageMax;
      query.bool.filter!.push({ range: { age: range } });
    }

    if (filters.religion) {
      query.bool.must!.push({ match: { religion: filters.religion } });
    }

    if (filters.caste) {
      query.bool.must!.push({ match: { caste: filters.caste } });
    }

    if (filters.motherTongue) {
      query.bool.filter!.push({ term: { motherTongue: filters.motherTongue } });
    }

    if (filters.educationLevel) {
      query.bool.filter!.push({ term: { educationLevel: filters.educationLevel } });
    }

    if (filters.occupation) {
      query.bool.must!.push({ match: { occupation: filters.occupation } });
    }

    if (filters.occupationCategory) {
      const occupations = OCCUPATION_CATEGORIES[filters.occupationCategory] || [];
      query.bool.filter!.push({ terms: { occupation: occupations } });
    }

    if (filters.incomeMin || filters.incomeMax) {
      const range: Record<string, number> = {};
      if (filters.incomeMin) range.gte = filters.incomeMin * 100000;
      if (filters.incomeMax) range.lte = filters.incomeMax * 100000;
      query.bool.filter!.push({ range: { annualIncome: range } });
    }

    if (filters.heightMin || filters.heightMax) {
      const range: Record<string, number> = {};
      if (filters.heightMin) range.gte = filters.heightMin;
      if (filters.heightMax) range.lte = filters.heightMax;
      query.bool.filter!.push({ range: { heightCm: range } });
    }

    if (filters.manglik && filters.manglik !== 'dont_mind') {
      query.bool.filter!.push({ term: { manglik: filters.manglik } });
    }

    if (filters.diet) {
      query.bool.filter!.push({ term: { diet: filters.diet } });
    }

    if (filters.maritalStatus) {
      query.bool.filter!.push({ term: { maritalStatus: filters.maritalStatus } });
    }

    if (filters.keyword) {
      query.bool.must!.push({
        multi_match: {
          query: filters.keyword,
          fields: ['firstName', 'lastName', 'aboutMe', 'occupation', 'workLocation'],
          fuzziness: 'AUTO'
        }
      });
    }

    if (filters.name) {
      query.bool.must!.push({
        match_phrase_prefix: {
          firstName: filters.name
        }
      });
    }

    let sort: any = [];
    switch (filters.sort) {
      case 'recently_joined':
        sort = [{ createdAt: 'desc' }];
        break;
      case 'last_active':
        sort = [{ lastActiveAt: 'desc' }];
        break;
      case 'completion':
        sort = [{ profileCompletionPercent: 'desc' }];
        break;
      case 'age_asc':
        sort = [{ age: 'asc' }];
        break;
      case 'age_desc':
        sort = [{ age: 'desc' }];
        break;
      case 'income_asc':
        sort = [{ annualIncome: 'asc' }];
        break;
      case 'income_desc':
        sort = [{ annualIncome: 'desc' }];
        break;
      default:
        sort = [{ _score: 'desc' }, { profileCompletionPercent: 'desc' }];
    }

    try {
      const client = await this.getElasticsearchClient();
      const response = await client.search({
        index: 'profiles',
        from: offset,
        size: filters.limit,
        query: query,
        sort: sort,
        highlight: {
          fields: {
            firstName: {},
            lastName: {},
            aboutMe: {}
          }
        }
      });

      const hits = response.hits.hits;
      const total = typeof response.hits.total === 'number' ? response.hits.total : response.hits.total?.value || 0;

      const profileIds = hits.map((hit: any) => hit._source?.id as string);
      const profilesWithVisibility = await this.enrichProfilesWithVisibility(
        profileIds.map((id, idx) => ({ id, _source: hits[idx]._source as Record<string, unknown> })),
        viewerId
      );

      return {
        data: profilesWithVisibility,
        page: filters.page,
        pageSize: filters.limit,
        total,
        totalPages: Math.ceil(total / filters.limit),
        took: response.took
      };
    } catch (error) {
      logger.error('Elasticsearch search failed, falling back to database', { error });
      return this.databaseSearch(filters, { ...options, offset });
    }
  }

  private async databaseSearch(
    filters: SearchFilters,
    options: SearchOptions & { offset: number }
  ): Promise<SearchResult> {
    const { viewerId, isAdmin, includeCompatibility, offset } = options;

    let query = db('profiles')
      .join('users', 'profiles.user_id', 'users.id')
      .select(
        'profiles.id',
        'profiles.user_id',
        'profiles.profile_slug',
        'profiles.first_name',
        'profiles.last_name',
        'profiles.age',
        'profiles.gender',
        'profiles.religion',
        'profiles.caste',
        'profiles.mother_tongue',
        'profiles.highest_education',
        'profiles.occupation',
        'profiles.annual_income',
        'profiles.work_location',
        'profiles.height_cm',
        'profiles.is_verified',
        'profiles.is_premium',
        'profiles.is_featured',
        'profiles.kyc_status',
        'profiles.profile_completion_percent',
        'profiles.profile_views',
        'profiles.created_at',
        'profiles.last_active_at'
      );

    if (!isAdmin) {
      query = query.where('users.status', 'active');
    }

    if (filters.gender) {
      query = query.where('profiles.gender', filters.gender);
    }

    if (filters.ageMin) {
      query = query.where('profiles.age', '>=', filters.ageMin);
    }

    if (filters.ageMax) {
      query = query.where('profiles.age', '<=', filters.ageMax);
    }

    if (filters.religion) {
      query = query.whereILike('profiles.religion', `%${filters.religion}%`);
    }

    if (filters.caste) {
      query = query.whereILike('profiles.caste', `%${filters.caste}%`);
    }

    if (filters.motherTongue) {
      query = query.where('profiles.mother_tongue', filters.motherTongue);
    }

    if (filters.educationLevel) {
      query = query.where('profiles.education_level', filters.educationLevel);
    }

    if (filters.occupation) {
      query = query.whereILike('profiles.occupation', `%${filters.occupation}%`);
    }

    if (filters.occupationCategory) {
      const occupations = OCCUPATION_CATEGORIES[filters.occupationCategory] || [];
      query = query.whereIn('profiles.occupation', occupations);
    }

    if (filters.incomeMin) {
      query = query.where('profiles.annual_income', '>=', filters.incomeMin * 100000);
    }

    if (filters.incomeMax) {
      query = query.where('profiles.annual_income', '<=', filters.incomeMax * 100000);
    }

    if (filters.heightMin) {
      query = query.where('profiles.height_cm', '>=', filters.heightMin);
    }

    if (filters.heightMax) {
      query = query.where('profiles.height_cm', '<=', filters.heightMax);
    }

    if (filters.maritalStatus) {
      query = query.where('profiles.marital_status', filters.maritalStatus);
    }

    if (filters.keyword) {
      query = query.where(function () {
        this.whereILike('profiles.first_name', `%${filters.keyword}%`)
          .orWhereILike('profiles.last_name', `%${filters.keyword}%`)
          .orWhereILike('profiles.about_me', `%${filters.keyword}%`)
          .orWhereILike('profiles.occupation', `%${filters.keyword}%`);
      });
    }

    if (filters.name) {
      query = query.where(function () {
        this.whereILike('profiles.first_name', `${filters.name}%`)
          .orWhereILike('profiles.last_name', `${filters.name}%`);
      });
    }

    if (filters.kycVerified) {
      query = query.where('profiles.kyc_status', 'verified');
    }

    if (filters.isPremium) {
      query = query.where('profiles.is_premium', true);
    }

    if (viewerId) {
      query = query.whereNot('profiles.user_id', viewerId);
    }

    switch (filters.sort) {
      case 'recently_joined':
        query = query.orderBy('profiles.created_at', 'desc');
        break;
      case 'last_active':
        query = query.orderBy('profiles.last_active_at', 'desc');
        break;
      case 'completion':
        query = query.orderBy('profiles.profile_completion_percent', 'desc');
        break;
      case 'age_asc':
        query = query.orderBy('profiles.age', 'asc');
        break;
      case 'age_desc':
        query = query.orderBy('profiles.age', 'desc');
        break;
      case 'income_asc':
        query = query.orderBy('profiles.annual_income', 'asc');
        break;
      case 'income_desc':
        query = query.orderBy('profiles.annual_income', 'desc');
        break;
      default:
        query = query.orderBy('profiles.profile_completion_percent', 'desc');
    }

    const countResult = await query.clone().count('* as count').first();
    const total = Number(countResult?.count) || 0;

    const profiles = await query
      .limit(filters.limit)
      .offset(offset);

    const profileIds = profiles.map(p => p.id);
    const enrichedProfiles = await this.enrichProfiles(profileIds, viewerId, includeCompatibility);

    return {
      data: enrichedProfiles,
      page: filters.page,
      pageSize: filters.limit,
      total,
      totalPages: Math.ceil(total / filters.limit),
      took: 0
    };
  }

  private async enrichProfiles(
    profileIds: string[],
    viewerId?: string,
    includeCompatibility?: boolean
  ): Promise<ProfileSearchResult[]> {
    if (profileIds.length === 0) return [];

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const photos = await db('photos')
      .whereIn('profile_id', profileIds)
      .where('is_primary', true)
      .where('is_approved', true)
      .select('profile_id', 'thumbnail_url');

    const photosMap = new Map(photos.map(p => [p.profile_id, p.thumbnail_url]));

    let compatibilityScores: Map<string, number> = new Map();
    if (includeCompatibility && viewerId && profileIds.length > 0) {
      compatibilityScores = await this.getCompatibilityScores(viewerId, profileIds);
    }

    const visibilityMap = await this.getVisibilityMap(viewerId, profileIds);

    return profileIds.map((id, idx) => {
      const profile = { id } as unknown as Record<string, unknown>;
      const originalProfile = Array.isArray(arguments[2]) ? arguments[2][idx] : null;

      const isRecentlyJoined = originalProfile?.created_at && 
        new Date(originalProfile.created_at) > thirtyDaysAgo;

      const badges: string[] = [];
      if (originalProfile?.is_verified) badges.push('Verified');
      if (isRecentlyJoined) badges.push('Recently Joined');
      if (originalProfile?.is_premium) badges.push('Premium');
      if (originalProfile?.is_featured) badges.push('Featured');

      const visibility = visibilityMap.get(id) || {
        showPhotos: true,
        blurPhotos: false,
        showContact: false
      };

      return {
        id: originalProfile?.id,
        userId: originalProfile?.user_id,
        profileSlug: originalProfile?.profile_slug,
        firstName: originalProfile?.first_name,
        lastName: originalProfile?.last_name,
        age: originalProfile?.age,
        gender: originalProfile?.gender,
        religion: originalProfile?.religion,
        caste: originalProfile?.caste,
        motherTongue: originalProfile?.mother_tongue,
        highestEducation: originalProfile?.highest_education,
        occupation: originalProfile?.occupation,
        annualIncome: originalProfile?.annual_income,
        workLocation: originalProfile?.work_location,
        heightCm: originalProfile?.height_cm,
        isVerified: originalProfile?.is_verified,
        isPremium: originalProfile?.is_premium,
        isFeatured: originalProfile?.is_featured,
        kycStatus: originalProfile?.kyc_status,
        profileCompletionPercent: originalProfile?.profile_completion_percent,
        profileViews: originalProfile?.profile_views,
        createdAt: originalProfile?.created_at,
        lastActiveAt: originalProfile?.last_active_at,
        isRecentlyJoined,
        compatibilityScore: compatibilityScores.get(id),
        primaryPhoto: photosMap.has(id) ? {
          thumbnailUrl: visibility.blurPhotos ? null : photosMap.get(id),
          isApproved: true
        } : undefined,
        badges,
        visibility
      };
    });
  }

  private async enrichProfilesWithVisibility(
    hits: Array<{ id: string; _source: Record<string, unknown> }>,
    viewerId?: string
  ): Promise<ProfileSearchResult[]> {
    const profileIds = hits.map(h => h.id);
    const visibilityMap = await this.getVisibilityMap(viewerId, profileIds);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return hits.map(({ _source }) => {
      const source = _source as Record<string, string | number | boolean | undefined>;
      const isRecentlyJoined = source.createdAt && new Date(source.createdAt as string) > thirtyDaysAgo;

      const badges: string[] = [];
      if (source.isVerified) badges.push('Verified');
      if (isRecentlyJoined) badges.push('Recently Joined');
      if (source.isPremium) badges.push('Premium');
      if (source.isFeatured) badges.push('Featured');

      const visibility = visibilityMap.get(source.id as string) || {
        showPhotos: true,
        blurPhotos: false,
        showContact: false
      };

      return {
        id: source.id as string,
        userId: source.userId as string,
        profileSlug: source.profileSlug as string,
        firstName: source.firstName as string,
        lastName: source.lastName as string,
        age: source.age as number,
        gender: source.gender as string,
        religion: source.religion as string,
        caste: source.caste as string,
        motherTongue: source.motherTongue as string,
        highestEducation: source.highestEducation as string,
        occupation: source.occupation as string,
        annualIncome: source.annualIncome as number,
        workLocation: source.workLocation as string,
        heightCm: source.heightCm as number,
        isVerified: source.isVerified as boolean,
        isPremium: source.isPremium as boolean,
        isFeatured: source.isFeatured as boolean,
        kycStatus: source.kycStatus as string,
        profileCompletionPercent: source.profileCompletionPercent as number,
        profileViews: source.profileViews as number,
        createdAt: source.createdAt as string,
        lastActiveAt: source.lastActiveAt as string,
        isRecentlyJoined,
        primaryPhoto: visibility.showPhotos ? {
          thumbnailUrl: visibility.blurPhotos ? null : source.primaryPhotoUrl as string | undefined,
          isApproved: true
        } : undefined,
        badges,
        visibility
      } as ProfileSearchResult;
    });
  }

  private async getVisibilityMap(
    viewerId?: string,
    profileIds?: string[],
    isAdmin?: boolean
  ): Promise<Map<string, { showPhotos: boolean; blurPhotos: boolean; showContact: boolean }>> {
    const map = new Map<string, { showPhotos: boolean; blurPhotos: boolean; showContact: boolean }>();

    if (isAdmin) {
      profileIds?.forEach(id => {
        map.set(id, { showPhotos: true, blurPhotos: false, showContact: true });
      });
      return map;
    }

    if (!viewerId || !profileIds || profileIds.length === 0) {
      profileIds?.forEach(id => {
        map.set(id, { showPhotos: true, blurPhotos: true, showContact: false });
      });
      return map;
    }

    const acceptedInterests = await db('interests')
      .where('sender_id', viewerId)
      .whereIn('receiver_id', profileIds)
      .where('status', 'accepted')
      .select('receiver_id');

    const acceptedSet = new Set(acceptedInterests.map(i => i.receiver_id));

    const viewerMembership = await db('user_memberships')
      .where('user_id', viewerId)
      .where('status', 'active')
      .where('end_date', '>', new Date())
      .first();

    const isPaid = !!viewerMembership;

    profileIds.forEach(id => {
      const hasAcceptedInterest = acceptedSet.has(id);
      const showContact = isPaid && hasAcceptedInterest;

      map.set(id, {
        showPhotos: true,
        blurPhotos: false,
        showContact
      });
    });

    return map;
  }

  private async getCompatibilityScores(
    viewerId: string,
    profileIds: string[]
  ): Promise<Map<string, number>> {
    const scores = new Map<string, number>();

    const [viewerProfile, viewerPreferences, viewerMembership] = await Promise.all([
      db('profiles').where('user_id', viewerId).first(),
      db('profiles').where('user_id', viewerId).select('partner_preference').first(),
      db('user_memberships').where('user_id', viewerId).where('status', 'active').first()
    ]);

    if (!viewerProfile || !viewerMembership) {
      return scores;
    }

    const preferences = viewerPreferences?.partner_preference || {};
    const targetProfiles = await db('profiles')
      .whereIn('id', profileIds)
      .select('id', 'religion', 'caste', 'mother_tongue', 'highest_education', 'occupation', 'annual_income', 'height_cm', 'age', 'diet', 'marital_status');

    targetProfiles.forEach(profile => {
      let score = 0;
      let totalWeight = 0;

      const weights: Record<string, { weight: number; value: unknown }> = {
        religion: { weight: 10, value: profile.religion },
        caste: { weight: 8, value: profile.caste },
        motherTongue: { weight: 7, value: profile.mother_tongue },
        education: { weight: 6, value: profile.highest_education },
        occupation: { weight: 5, value: profile.occupation },
        income: { weight: 4, value: profile.annual_income },
        height: { weight: 3, value: profile.height_cm },
        age: { weight: 3, value: profile.age },
        diet: { weight: 2, value: profile.diet }
      };

      if (preferences.religions?.length && !preferences.religions.includes(profile.religion)) {
        weights.religion.weight = 0;
      }
      if (preferences.castes?.length && !preferences.castes.includes(profile.caste)) {
        weights.caste.weight = 0;
      }

      for (const [, data] of Object.entries(weights)) {
        if (data.weight > 0 && data.value) {
          score += data.weight;
        }
        totalWeight += data.weight;
      }

      const percentage = totalWeight > 0 ? Math.round((score / totalWeight) * 100) : 0;
      scores.set(profile.id, percentage);
    });

    return scores;
  }

  private async getElasticsearchClient() {
    const { Client } = await import('@elastic/elasticsearch');
    return new Client({
      node: config.ELASTICSEARCH_NODE,
      auth: config.ELASTICSEARCH_API_KEY ? { apiKey: config.ELASTICSEARCH_API_KEY } : undefined
    });
  }

  async quickSearch(
    filters: SearchFilters,
    options: SearchOptions
  ): Promise<SearchResult> {
    return this.searchProfiles({
      gender: filters.gender,
      ageMin: filters.ageMin,
      ageMax: filters.ageMax,
      religion: filters.religion,
      community: filters.community,
      city: filters.city,
      state: filters.state,
      page: filters.page,
      limit: filters.limit,
      sort: 'relevance'
    }, options);
  }

  async getProfileById(
    profileId: string,
    viewerId?: string,
    isAdmin?: boolean
  ): Promise<ProfileSearchResult | null> {
    const profile = await db('profiles')
      .where('id', profileId)
      .first();

    if (!profile) {
      return null;
    }

    if (!isAdmin && profile.status !== 'active') {
      return null;
    }

    const photo = await db('photos')
      .where('profile_id', profileId)
      .where('is_primary', true)
      .where('is_approved', true)
      .first();

    const visibility = await this.getVisibilityMap(viewerId, [profileId], isAdmin);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const isRecentlyJoined = new Date(profile.created_at) > thirtyDaysAgo;

    const badges: string[] = [];
    if (profile.is_verified) badges.push('Verified');
    if (isRecentlyJoined) badges.push('Recently Joined');
    if (profile.is_premium) badges.push('Premium');
    if (profile.is_featured) badges.push('Featured');

    const vis = visibility.get(profileId) || { showPhotos: true, blurPhotos: true, showContact: false };

    return {
      id: profile.id,
      userId: profile.user_id,
      profileSlug: profile.profile_slug,
      firstName: profile.first_name,
      lastName: profile.last_name,
      age: profile.age,
      gender: profile.gender,
      religion: profile.religion,
      caste: profile.caste,
      motherTongue: profile.mother_tongue,
      highestEducation: profile.highest_education,
      occupation: profile.occupation,
      annualIncome: profile.annual_income,
      workLocation: profile.work_location,
      heightCm: profile.height_cm,
      isVerified: profile.is_verified,
      isPremium: profile.is_premium,
      isFeatured: profile.is_featured,
      kycStatus: profile.kyc_status,
      profileCompletionPercent: profile.profile_completion_percent,
      profileViews: profile.profile_views,
      createdAt: profile.created_at,
      lastActiveAt: profile.last_active_at,
      isRecentlyJoined,
      primaryPhoto: vis.showPhotos ? {
        thumbnailUrl: vis.blurPhotos ? null : photo?.thumbnail_url,
        isApproved: true
      } : undefined,
      badges,
      visibility: vis
    };
  }

  async getSuggestions(
    query: string,
    type: 'names' | 'cities' | 'occupations' | 'educations' | 'all',
    limit: number
  ): Promise<Record<string, unknown>> {
    const result: Record<string, unknown[]> = {};

    if (type === 'all' || type === 'names') {
      const names = await db('profiles')
        .where(function () {
          this.whereILike('first_name', `${query}%`)
            .orWhereILike('last_name', `${query}%`);
        })
        .where('is_active', true)
        .select('first_name', 'last_name', 'gender')
        .limit(limit);
      result.names = names.map(n => ({
        text: `${n.first_name} ${n.last_name}`,
        gender: n.gender
      }));
    }

    if (type === 'all' || type === 'cities') {
      const cities = await db('geo_locations')
        .where('location_type', 'taluka')
        .whereILike('name', `%${query}%`)
        .select('id', 'name', 'pincode')
        .limit(limit);
      result.cities = cities;
    }

    if (type === 'all' || type === 'occupations') {
      const occupations = await db('profiles')
        .whereILike('occupation', `%${query}%`)
        .select('occupation')
        .groupBy('occupation')
        .limit(limit);
      result.occupations = occupations.map(o => o.occupation);
    }

    if (type === 'all' || type === 'educations') {
      const educations = await db('profiles')
        .whereILike('highest_education', `%${query}%`)
        .select('highest_education')
        .groupBy('highest_education')
        .limit(limit);
      result.educations = educations.map(e => e.highest_education);
    }

    return result;
  }

  async searchByLocation(
    filters: { cityId: string; page: number; limit: number },
    options: SearchOptions
  ): Promise<SearchResult> {
    const geoLocation = await db('geo_locations')
      .where('id', filters.cityId)
      .first();

    if (!geoLocation) {
      return { data: [], page: 1, pageSize: filters.limit, total: 0, totalPages: 0, took: 0 };
    }

    if (geoLocation.location_type === 'taluka') {
      return this.searchProfiles({
        ...filters,
        sort: 'relevance'
      } as SearchFilters, options);
    }

    return { data: [], page: 1, pageSize: filters.limit, total: 0, totalPages: 0, took: 0 };
  }

  async searchByOccupation(
    filters: { occupationCategory: string; page: number; limit: number },
    options: SearchOptions
  ): Promise<SearchResult> {
    return this.searchProfiles({
      occupationCategory: filters.occupationCategory,
      sort: 'relevance',
      page: filters.page,
      limit: filters.limit
    } as SearchFilters, options);
  }

  async searchByEducation(
    filters: { educationLevel: string; page: number; limit: number },
    options: SearchOptions
  ): Promise<SearchResult> {
    return this.searchProfiles({
      educationLevel: filters.educationLevel,
      sort: 'relevance',
      page: filters.page,
      limit: filters.limit
    } as SearchFilters, options);
  }

  async getRecentlyJoined(
    filters: { days: number; page: number; limit: number },
    options: SearchOptions
  ): Promise<SearchResult> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - filters.days);

    return this.searchProfiles({
      page: filters.page,
      limit: filters.limit,
      sort: 'recently_joined'
    } as SearchFilters, options);
  }

  async getPremiumMembers(
    filters: { page: number; limit: number },
    options: SearchOptions
  ): Promise<SearchResult> {
    return this.searchProfiles({
      isPremium: true,
      page: filters.page,
      limit: filters.limit,
      sort: 'relevance'
    } as SearchFilters, options);
  }

  async getFeaturedProfiles(
    filters: { page: number; limit: number },
    viewerId?: string
  ): Promise<SearchResult> {
    const offset = (filters.page - 1) * filters.limit;

    const query = db('profiles')
      .join('users', 'profiles.user_id', 'users.id')
      .where('profiles.is_featured', true)
      .where('users.status', 'active')
      .select(
        'profiles.id',
        'profiles.user_id',
        'profiles.profile_slug',
        'profiles.first_name',
        'profiles.last_name',
        'profiles.age',
        'profiles.gender',
        'profiles.religion',
        'profiles.caste',
        'profiles.mother_tongue',
        'profiles.highest_education',
        'profiles.occupation',
        'profiles.annual_income',
        'profiles.work_location',
        'profiles.height_cm',
        'profiles.is_verified',
        'profiles.is_premium',
        'profiles.is_featured',
        'profiles.kyc_status',
        'profiles.profile_completion_percent',
        'profiles.profile_views',
        'profiles.created_at',
        'profiles.last_active_at'
      )
      .orderBy('profiles.profile_completion_percent', 'desc');

    const countResult = await query.clone().count('* as count').first();
    const total = Number(countResult?.count) || 0;

    const profiles = await query.limit(filters.limit).offset(offset);

    const enrichedProfiles = await this.enrichProfiles(
      profiles.map(p => p.id),
      viewerId,
      false
    );

    return {
      data: enrichedProfiles,
      page: filters.page,
      pageSize: filters.limit,
      total,
      totalPages: Math.ceil(total / filters.limit),
      took: 0
    };
  }

  async getSavedSearches(userId: string): Promise<SavedSearch[]> {
    return await db('saved_searches')
      .where('user_id', userId)
      .orderBy('created_at', 'desc');
  }

  async saveSearch(
    userId: string,
    data: { name: string; filters: SearchFilters; notifyOnNew: boolean }
  ): Promise<SavedSearch> {
    const [savedSearch] = await db('saved_searches')
      .insert({
        id: uuidv4(),
        user_id: userId,
        name: data.name,
        filters: JSON.stringify(data.filters),
        notify_on_new: data.notifyOnNew,
        created_at: new Date()
      })
      .returning('*');

    return savedSearch;
  }

  async deleteSavedSearch(userId: string, searchId: string): Promise<void> {
    await db('saved_searches')
      .where('id', searchId)
      .where('user_id', userId)
      .delete();
  }

  async exportResults(
    adminId: string,
    filters: Record<string, unknown>,
    format: 'csv' | 'excel',
    maxRecords: number
  ): Promise<Buffer | string> {
    const result = await this.searchProfiles(
      { ...filters, page: 1, limit: maxRecords, sort: 'recently_joined' } as SearchFilters,
      { isAdmin: true }
    );

    const headers = [
      'ID', 'First Name', 'Last Name', 'Age', 'Gender', 'Religion', 'Caste',
      'Mother Tongue', 'Education', 'Occupation', 'Annual Income', 'Location',
      'Is Verified', 'Is Premium', 'Profile Completion', 'Created At'
    ];

    const rows = result.data.map(p => [
      p.id,
      p.firstName,
      p.lastName,
      p.age,
      p.gender,
      p.religion,
      p.caste || '',
      p.motherTongue || '',
      p.highestEducation || '',
      p.occupation || '',
      p.annualIncome || '',
      p.workLocation || '',
      p.isVerified ? 'Yes' : 'No',
      p.isPremium ? 'Yes' : 'No',
      p.profileCompletionPercent,
      p.createdAt
    ]);

    log.admin.dataExported(adminId, 'search_results', rows.length);

    if (format === 'excel') {
      const XLSX = await import('xlsx');
      const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Search Results');
      return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }) as unknown as Buffer;
    }

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    return csvContent;
  }
}

export const searchService = new SearchService();
