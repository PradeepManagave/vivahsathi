// ============================================================
// Search Indexer Service - Elasticsearch Indexing
// ============================================================

import { db } from '../../config/database';
import { config } from '../../config/index';
import logger, { log } from '../../config/logger';
import { cache } from '../../config/redis';

interface ProfileDocument {
  id: string;
  userId: string;
  profileSlug: string;
  firstName: string;
  lastName: string;
  gender: string;
  age: number;
  dateOfBirth: string;
  heightCm?: number;
  weightKg?: number;
  complexion?: string;
  bodyType?: string;
  physicalStatus: string;
  religion: string;
  caste?: string;
  subCaste?: string;
  motherTongue?: string;
  gothra?: string;
  highestEducation?: string;
  educationLevel?: string;
  educationDetails?: string;
  occupation?: string;
  occupationCategory?: string;
  employedIn?: string;
  annualIncome?: number;
  workLocation?: string;
  diet?: string;
  smoking?: string;
  drinking?: string;
  maritalStatus: string;
  aboutMe?: string;
  kycStatus: string;
  isVerified: boolean;
  isPremium: boolean;
  isFeatured: boolean;
  profileCompletionPercent: number;
  profileViews: number;
  createdAt: string;
  lastActiveAt?: string;
  partnerPreference?: Record<string, unknown>;
  familyCity?: string;
  familyState?: string;
  familyType?: string;
  manglik?: string;
  primaryPhotoUrl?: string;
  status: string;
  isApproved: boolean;
}

const OCCUPATION_CATEGORIES: Record<string, string[]> = {
  it_software: ['Software Engineer', 'IT Professional', 'Software Developer', 'Tech Lead', 'Project Manager', 'DevOps Engineer', 'Data Scientist', 'UI/UX Designer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer'],
  doctor: ['Doctor', 'Surgeon', 'Dentist', 'Physician', 'MBBS', 'MD', 'BAMS', 'BHMS', 'Veterinary', 'Pharmacist'],
  engineer: ['Engineer', 'Civil Engineer', 'Mechanical Engineer', 'Electrical Engineer', 'Electronics Engineer', 'Chemical Engineer', 'Aerospace Engineer', 'Automobile Engineer'],
  teacher: ['Teacher', 'Professor', 'Lecturer', 'Principal', 'Education', 'Academic', 'Trainer', 'Coach'],
  business: ['Business', 'Entrepreneur', 'Trader', 'Shop Owner', 'Self Employed', 'Business Owner', 'Proprietor'],
  banking: ['Banker', 'Bank Manager', 'Financial Analyst', 'Accountant', 'CA', 'Chartered Accountant', 'Tax Consultant', 'Investment Banker'],
  government: ['Government Employee', 'IAS Officer', 'Police', 'Defense', 'Civil Services', 'IPS', 'IRS', 'PCS'],
  lawyer: ['Lawyer', 'Advocate', 'Legal Professional', 'Judge', 'Attorney', 'Legal Consultant'],
  accountant: ['Accountant', 'Chartered Accountant', 'Tax Consultant', 'Auditor', 'Finance Manager'],
  manager: ['Manager', 'Senior Manager', 'Director', 'Executive', 'Operations Manager', 'HR Manager', 'Marketing Manager'],
  architect: ['Architect', 'Interior Designer', 'Urban Planner', 'Landscape Architect', 'Draftsman'],
  consultant: ['Consultant', 'Business Consultant', 'Management Consultant', 'Strategy Consultant', 'IT Consultant'],
  chef: ['Chef', 'Cook', 'Food Professional', 'Baker', 'Caterer'],
  pilot: ['Pilot', 'Airline', 'Aviation', 'Flight Attendant', 'Air Traffic Controller'],
  police: ['Police Officer', 'Security', 'Defense Services', 'Armed Forces', 'Army', 'Navy', 'Air Force'],
  other: []
};

const EDUCATION_LEVELS: Record<string, string[]> = {
  high_school: ['High School', '10th', '12th', 'SSC', 'HSC', 'ICSE', 'CBSE'],
  bachelors: ['Bachelors', 'B.A', 'B.Sc', 'B.Com', 'B.E', 'B.Tech', 'BBA', 'BCA', 'B.Arch', 'LLB', 'MBBS', 'BAMS', 'BHMS'],
  masters: ['Masters', 'M.A', 'M.Sc', 'M.Com', 'M.E', 'M.Tech', 'MBA', 'MCA', 'LLM', 'MD', 'MS'],
  doctorate: ['Ph.D', 'Doctorate', 'M.Phil', 'Post Doctorate'],
  post_doctorate: ['Post Doctorate', 'Post Doc', 'Research Scholar']
};

export class SearchIndexer {
  private useElasticsearch: boolean;
  private indexName = 'profiles';

  constructor() {
    this.useElasticsearch = config.ELASTICSEARCH_ENABLED || false;
  }

  async triggerReindex(full: boolean, adminId: string): Promise<void> {
    logger.info('Reindex triggered', { full, adminId });

    await cache.set('search:reindex:status', {
      status: 'in_progress',
      startedAt: new Date().toISOString(),
      startedBy: adminId,
      full
    }, 3600);

    if (full) {
      await this.fullReindex();
    } else {
      await this.incrementalReindex();
    }

    await cache.set('search:reindex:status', {
      status: 'completed',
      completedAt: new Date().toISOString()
    }, 3600);

    logger.info('Reindex completed', { full, adminId });
  }

  async indexProfile(profileId: string): Promise<void> {
    if (!this.useElasticsearch) {
      return;
    }

    const profile = await this.getProfileDocument(profileId);

    if (!profile) {
      logger.warn('Profile not found for indexing', { profileId });
      return;
    }

    await this.bulkIndex([profile]);
  }

  async removeProfileFromIndex(profileId: string): Promise<void> {
    if (!this.useElasticsearch) {
      return;
    }

    try {
      const client = await this.getElasticsearchClient();
      await client.delete({
        index: this.indexName,
        id: profileId
      });
    } catch (error) {
      logger.error('Failed to remove profile from index', { profileId, error });
    }
  }

  async fullReindex(): Promise<void> {
    if (!this.useElasticsearch) {
      logger.warn('Elasticsearch not enabled, skipping full reindex');
      return;
    }

    await this.createIndex();

    const batchSize = 500;
    let offset = 0;
    let totalIndexed = 0;

    while (true) {
      const profiles = await db('profiles')
        .join('users', 'profiles.user_id', 'users.id')
        .leftJoin('family_info', 'profiles.id', 'family_info.profile_id')
        .leftJoin('photos', function () {
          this.on('profiles.id', '=', 'photos.profile_id')
            .andOn('photos.is_primary', '=', db.raw('true'));
        })
        .leftJoin('horoscopes', 'profiles.id', 'horoscopes.profile_id')
        .select(
          'profiles.*',
          'users.status as user_status',
          'family_info.family_city',
          'family_info.family_state',
          'family_info.family_type',
          'photos.thumbnail_url as primary_photo_url',
          'horoscopes.manglik'
        )
        .where('users.status', 'active')
        .where('profiles.kyc_status', '!=', 'rejected')
        .limit(batchSize)
        .offset(offset);

      if (profiles.length === 0) {
        break;
      }

      const documents = await this.transformProfiles(profiles);
      await this.bulkIndex(documents);

      totalIndexed += documents.length;
      offset += batchSize;

      await cache.set('search:reindex:progress', {
        indexed: totalIndexed,
        offset,
        lastUpdated: new Date().toISOString()
      }, 3600);

      logger.info('Reindex progress', { indexed: totalIndexed, offset });
    }

    logger.info('Full reindex completed', { totalIndexed });
  }

  async incrementalReindex(): Promise<void> {
    const lastIndexed = await cache.get<string>('search:reindex:last_timestamp');
    const since = lastIndexed ? new Date(lastIndexed) : new Date(Date.now() - 60 * 60 * 1000);

    const updatedProfiles = await db('profiles')
      .join('users', 'profiles.user_id', 'users.id')
      .leftJoin('family_info', 'profiles.id', 'family_info.profile_id')
      .leftJoin('photos', function () {
        this.on('profiles.id', '=', 'photos.profile_id')
          .andOn('photos.is_primary', '=', db.raw('true'));
      })
      .leftJoin('horoscopes', 'profiles.id', 'horoscopes.profile_id')
      .select(
        'profiles.*',
        'users.status as user_status',
        'family_info.family_city',
        'family_info.family_state',
        'family_info.family_type',
        'photos.thumbnail_url as primary_photo_url',
        'horoscopes.manglik'
      )
      .where('profiles.updated_at', '>', since);

    if (updatedProfiles.length === 0) {
      logger.info('No profiles to reindex');
      return;
    }

    const documents = await this.transformProfiles(updatedProfiles);

    const activeDocs = documents.filter(d => d.status === 'active');
    const inactiveDocs = documents.filter(d => d.status !== 'active');

    if (activeDocs.length > 0) {
      await this.bulkIndex(activeDocs);
    }

    for (const doc of inactiveDocs) {
      await this.removeProfileFromIndex(doc.id);
    }

    await cache.set('search:reindex:last_timestamp', new Date().toISOString());

    logger.info('Incremental reindex completed', { count: documents.length });
  }

  async createIndex(): Promise<void> {
    if (!this.useElasticsearch) {
      return;
    }

    const client = await this.getElasticsearchClient();

    const indexExists = await client.indices.exists({ index: this.indexName });

    if (indexExists) {
      await client.indices.delete({ index: this.indexName });
    }

    await client.indices.create({
      index: this.indexName,
      body: {
        settings: {
          number_of_shards: 3,
          number_of_replicas: 1,
          analysis: {
            analyzer: {
              autocomplete: {
                type: 'custom',
                tokenizer: 'standard',
                filter: ['lowercase', 'autocomplete_filter']
              },
              autocomplete_search: {
                type: 'custom',
                tokenizer: 'standard',
                filter: ['lowercase']
              }
            },
            filter: {
              autocomplete_filter: {
                type: 'edge_ngram',
                min_gram: 2,
                max_gram: 20
              }
            }
          }
        },
        mappings: {
          properties: {
            id: { type: 'keyword' },
            userId: { type: 'keyword' },
            profileSlug: { type: 'keyword' },
            firstName: {
              type: 'text',
              analyzer: 'autocomplete',
              search_analyzer: 'autocomplete_search',
              fields: {
                keyword: { type: 'keyword' }
              }
            },
            lastName: {
              type: 'text',
              analyzer: 'autocomplete',
              search_analyzer: 'autocomplete_search',
              fields: {
                keyword: { type: 'keyword' }
              }
            },
            gender: { type: 'keyword' },
            age: { type: 'integer' },
            heightCm: { type: 'integer' },
            religion: {
              type: 'text',
              fields: { keyword: { type: 'keyword' } }
            },
            caste: {
              type: 'text',
              fields: { keyword: { type: 'keyword' } }
            },
            subCaste: { type: 'text' },
            motherTongue: { type: 'keyword' },
            highestEducation: {
              type: 'text',
              fields: { keyword: { type: 'keyword' } }
            },
            educationLevel: { type: 'keyword' },
            occupation: {
              type: 'text',
              fields: { keyword: { type: 'keyword' } }
            },
            occupationCategory: { type: 'keyword' },
            employedIn: { type: 'keyword' },
            annualIncome: { type: 'integer' },
            workLocation: { type: 'text' },
            diet: { type: 'keyword' },
            smoking: { type: 'keyword' },
            drinking: { type: 'keyword' },
            maritalStatus: { type: 'keyword' },
            aboutMe: { type: 'text' },
            kycStatus: { type: 'keyword' },
            isVerified: { type: 'boolean' },
            isPremium: { type: 'boolean' },
            isFeatured: { type: 'boolean' },
            profileCompletionPercent: { type: 'integer' },
            profileViews: { type: 'integer' },
            createdAt: { type: 'date' },
            lastActiveAt: { type: 'date' },
            familyCity: { type: 'text' },
            familyState: { type: 'text' },
            familyType: { type: 'keyword' },
            manglik: { type: 'keyword' },
            primaryPhotoUrl: { type: 'keyword', index: false },
            status: { type: 'keyword' },
            isApproved: { type: 'boolean' },
            isActive: { type: 'boolean' }
          }
        }
      }
    });

    logger.info('Elasticsearch index created', { index: this.indexName });
  }

  private async getProfileDocument(profileId: string): Promise<ProfileDocument | null> {
    const profiles = await db('profiles')
      .join('users', 'profiles.user_id', 'users.id')
      .leftJoin('family_info', 'profiles.id', 'family_info.profile_id')
      .leftJoin('photos', function () {
        this.on('profiles.id', '=', 'photos.profile_id')
          .andOn('photos.is_primary', '=', db.raw('true'));
      })
      .leftJoin('horoscopes', 'profiles.id', 'horoscopes.profile_id')
      .select(
        'profiles.*',
        'users.status as user_status',
        'family_info.family_city',
        'family_info.family_state',
        'family_info.family_type',
        'photos.thumbnail_url as primary_photo_url',
        'horoscopes.manglik'
      )
      .where('profiles.id', profileId)
      .limit(1);

    if (profiles.length === 0) {
      return null;
    }

    const documents = await this.transformProfiles(profiles);
    return documents[0];
  }

  private async transformProfiles(profiles: Record<string, unknown>[]): Promise<ProfileDocument[]> {
    return profiles.map(profile => {
      const occupation = profile.occupation as string || '';
      const education = profile.highest_education as string || '';

      let occupationCategory = 'other';
      for (const [category, occupations] of Object.entries(OCCUPATION_CATEGORIES)) {
        if (occupations.some(o => occupation.toLowerCase().includes(o.toLowerCase()))) {
          occupationCategory = category;
          break;
        }
      }

      let educationLevel = 'other';
      for (const [level, educations] of Object.entries(EDUCATION_LEVELS)) {
        if (educations.some(e => education.toLowerCase().includes(e.toLowerCase()))) {
          educationLevel = level;
          break;
        }
      }

      return {
        id: profile.id as string,
        userId: profile.user_id as string,
        profileSlug: profile.profile_slug as string,
        firstName: profile.first_name as string,
        lastName: profile.last_name as string,
        gender: profile.gender as string,
        age: profile.age as number,
        dateOfBirth: profile.date_of_birth as string,
        heightCm: profile.height_cm as number | undefined,
        weightKg: profile.weight_kg as number | undefined,
        complexion: profile.complexion as string | undefined,
        bodyType: profile.body_type as string | undefined,
        physicalStatus: profile.physical_status as string || 'normal',
        religion: profile.religion as string,
        caste: profile.caste as string | undefined,
        subCaste: profile.sub_caste as string | undefined,
        motherTongue: profile.mother_tongue as string | undefined,
        gothra: profile.gothra as string | undefined,
        highestEducation: profile.highest_education as string | undefined,
        educationLevel,
        educationDetails: profile.education_details as string | undefined,
        occupation,
        occupationCategory,
        employedIn: profile.employed_in as string | undefined,
        annualIncome: profile.annual_income as number | undefined,
        workLocation: profile.work_location as string | undefined,
        diet: profile.diet as string | undefined,
        smoking: profile.smoking as string | undefined,
        drinking: profile.drinking as string | undefined,
        maritalStatus: profile.marital_status as string || 'unmarried',
        aboutMe: profile.about_me as string | undefined,
        kycStatus: profile.kyc_status as string,
        isVerified: profile.is_verified as boolean,
        isPremium: profile.is_premium as boolean,
        isFeatured: profile.is_featured as boolean,
        profileCompletionPercent: profile.profile_completion_percent as number,
        profileViews: profile.profile_views as number,
        createdAt: profile.created_at as string,
        lastActiveAt: profile.last_active_at as string | undefined,
        partnerPreference: profile.partner_preference as Record<string, unknown> | undefined,
        familyCity: profile.family_city as string | undefined,
        familyState: profile.family_state as string | undefined,
        familyType: profile.family_type as string | undefined,
        manglik: profile.manglik as string | undefined,
        primaryPhotoUrl: profile.primary_photo_url as string | undefined,
        status: profile.user_status as string,
        isApproved: true
      };
    });
  }

  private async bulkIndex(documents: ProfileDocument[]): Promise<void> {
    if (!this.useElasticsearch || documents.length === 0) {
      return;
    }

    try {
      const client = await this.getElasticsearchClient();

      const operations = documents.flatMap(doc => [
        { index: { _index: this.indexName, _id: doc.id } },
        doc
      ]);

      const response = await client.bulk({
        refresh: false,
        operations
      });

      if (response.errors) {
        const errorItems = response.items.filter(item => item.index?.error);
        logger.error('Bulk indexing errors', { errors: errorItems });
      }
    } catch (error) {
      logger.error('Bulk indexing failed', { error, count: documents.length });
    }
  }

  private async getElasticsearchClient() {
    const { Client } = await import('@elastic/elasticsearch');
    return new Client({
      node: config.ELASTICSEARCH_NODE,
      auth: config.ELASTICSEARCH_API_KEY ? { apiKey: config.ELASTICSEARCH_API_KEY } : undefined
    });
  }
}

export const searchIndexer = new SearchIndexer();
