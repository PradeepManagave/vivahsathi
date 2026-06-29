// ============================================================
// Geo Service - Hierarchical Location Management
// ============================================================

import { db } from '../../config/database';
import logger, { log } from '../../config/logger';
import { NotFoundError, ValidationError } from '../../shared/utils/errors';
import { v4 as uuidv4 } from 'uuid';

interface Location {
  id: string;
  name: string;
  nameLocal?: string;
  code?: string;
  pincode?: string;
  isActive: boolean;
}

interface VillageSearchParams {
  search?: string;
  talukaId?: string;
  page: number;
  limit: number;
}

interface VillageRequestData {
  userId: string;
  name: string;
  talukaId: string;
  pincode?: string;
  description?: string;
}

interface PaginationResult<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

interface HierarchyLocation {
  id: string;
  name: string;
  type: string;
  parentId?: string;
  pincode?: string;
  children?: HierarchyLocation[];
}

export class GeoService {
  async getCountries(): Promise<Location[]> {
    const countries = await db('geo_locations')
      .where('location_type', 'country')
      .where('is_active', true)
      .orderBy('name')
      .select('id', 'name', 'name_local', 'code', 'is_active');

    return countries;
  }

  async getStates(countryId: string): Promise<Location[]> {
    const country = await db('geo_locations')
      .where('id', countryId)
      .where('location_type', 'country')
      .first();

    if (!country) {
      throw new NotFoundError('Country');
    }

    const states = await db('geo_locations')
      .where('parent_id', countryId)
      .where('location_type', 'state')
      .where('is_active', true)
      .orderBy('name')
      .select('id', 'name', 'name_local', 'code', 'pincode', 'is_active');

    return states;
  }

  async getDistricts(stateId: string): Promise<Location[]> {
    const state = await db('geo_locations')
      .where('id', stateId)
      .where('location_type', 'state')
      .first();

    if (!state) {
      throw new NotFoundError('State');
    }

    const districts = await db('geo_locations')
      .where('parent_id', stateId)
      .where('location_type', 'district')
      .where('is_active', true)
      .orderBy('name')
      .select('id', 'name', 'name_local', 'code', 'pincode', 'is_active');

    return districts;
  }

  async getTalukas(districtId: string): Promise<Location[]> {
    const district = await db('geo_locations')
      .where('id', districtId)
      .where('location_type', 'district')
      .first();

    if (!district) {
      throw new NotFoundError('District');
    }

    const talukas = await db('geo_locations')
      .where('parent_id', districtId)
      .where('location_type', 'taluka')
      .where('is_active', true)
      .orderBy('name')
      .select('id', 'name', 'name_local', 'code', 'pincode', 'is_active');

    return talukas;
  }

  async getVillages(params: VillageSearchParams): Promise<PaginationResult<Location>> {
    const { search, talukaId, page, limit } = params;
    const offset = (page - 1) * limit;

    let query = db('geo_locations')
      .where('location_type', 'village')
      .where('is_active', true);

    if (talukaId) {
      query = query.where('parent_id', talukaId);
    }

    if (search) {
      query = query.where(function () {
        this.whereILike('name', `%${search}%`)
          .orWhereILike('name_local', `%${search}%`)
          .orWhereILike('pincode', `%${search}%`);
      });
    }

    const countResult = await query.clone().count('* as count').first();
    const total = Number(countResult?.count) || 0;

    const villages = await query
      .orderBy('name')
      .limit(limit)
      .offset(offset)
      .select('id', 'name', 'name_local', 'pincode', 'is_active');

    return {
      data: villages,
      page,
      pageSize: limit,
      total,
      totalPages: Math.ceil(total / limit)
    };
  }

  async requestVillage(data: VillageRequestData): Promise<Record<string, unknown>> {
    const taluka = await db('geo_locations')
      .where('id', data.talukaId)
      .where('location_type', 'taluka')
      .first();

    if (!taluka) {
      throw new NotFoundError('Taluka');
    }

    const existingRequest = await db('village_requests')
      .where('name', data.name.trim())
      .where('taluka_id', data.talukaId)
      .whereIn('status', ['pending', 'approved'])
      .first();

    if (existingRequest) {
      throw new ValidationError('A village with this name already exists or has a pending request');
    }

    const existingVillage = await db('geo_locations')
      .where('name', data.name.trim())
      .where('parent_id', data.talukaId)
      .where('location_type', 'village')
      .first();

    if (existingVillage) {
      throw new ValidationError('This village already exists in the database');
    }

    const [request] = await db('village_requests')
      .insert({
        id: uuidv4(),
        taluka_id: data.talukaId,
        name: data.name.trim(),
        pincode: data.pincode || null,
        description: data.description || null,
        requested_by: data.userId,
        status: 'pending',
        created_at: new Date()
      })
      .returning('*');

    logger.info('Village request submitted', {
      requestId: request.id,
      userId: data.userId,
      villageName: data.name
    });

    return request;
  }

  async searchLocations(
    query: string,
    level?: 'country' | 'state' | 'district' | 'taluka' | 'village'
  ): Promise<HierarchyLocation[]> {
    let dbQuery = db('geo_locations')
      .where('is_active', true)
      .where(function () {
        this.whereILike('name', `%${query}%`)
          .orWhereILike('name_local', `%${query}%`);
      });

    if (level) {
      dbQuery = dbQuery.where('location_type', level);
    }

    const results = await dbQuery
      .orderBy('name')
      .limit(50)
      .select('id', 'name', 'location_type', 'parent_id', 'pincode');

    return results.map(r => ({
      id: r.id,
      name: r.name,
      type: r.location_type,
      parentId: r.parent_id,
      pincode: r.pincode
    }));
  }

  async getHierarchy(
    type: 'country' | 'state' | 'district' | 'taluka' | 'village',
    id: string
  ): Promise<HierarchyLocation | null> {
    const location = await db('geo_locations')
      .where('id', id)
      .where('location_type', type)
      .first();

    if (!location) {
      throw new NotFoundError('Location');
    }

    const hierarchy: HierarchyLocation = {
      id: location.id,
      name: location.name,
      type: location.location_type,
      parentId: location.parent_id,
      pincode: location.pincode
    };

    const parentChain: HierarchyLocation[] = [];
    let currentParentId = location.parent_id;

    while (currentParentId) {
      const parent = await db('geo_locations')
        .where('id', currentParentId)
        .first();

      if (!parent) break;

      parentChain.unshift({
        id: parent.id,
        name: parent.name,
        type: parent.location_type,
        parentId: parent.parent_id,
        pincode: parent.pincode
      });

      currentParentId = parent.parent_id;
    }

    if (parentChain.length > 0) {
      let current = parentChain[0];
      for (let i = 1; i < parentChain.length; i++) {
        current.children = [parentChain[i]];
        current = parentChain[i];
      }
      current.children = [hierarchy];
      return parentChain[0];
    }

    return hierarchy;
  }

  async getLocationByPincode(pincode: string): Promise<HierarchyLocation | null> {
    const location = await db('geo_locations')
      .where('pincode', pincode)
      .where('is_active', true)
      .first();

    if (!location) {
      return null;
    }

    return await this.getHierarchy(
      location.location_type as 'country' | 'state' | 'district' | 'taluka' | 'village',
      location.id
    );
  }

  async approveVillageRequest(
    adminId: string,
    requestId: string,
    approved: boolean,
    approvedName?: string,
    approvedPincode?: string
  ): Promise<void> {
    const request = await db('village_requests')
      .where('id', requestId)
      .first();

    if (!request) {
      throw new NotFoundError('Village request');
    }

    await db('village_requests')
      .where('id', requestId)
      .update({
        status: approved ? 'approved' : 'rejected',
        reviewed_by: adminId,
        reviewed_at: new Date()
      });

    if (approved) {
      const villageId = uuidv4();

      await db('geo_locations')
        .insert({
          id: villageId,
          parent_id: request.taluka_id,
          location_type: 'village',
          name: approvedName || request.name,
          pincode: approvedPincode || request.pincode,
          level: 4,
          is_active: true,
          created_at: new Date()
        });

      logger.info('Village request approved', {
        requestId,
        adminId,
        villageId,
        name: approvedName || request.name
      });
    } else {
      logger.info('Village request rejected', { requestId, adminId });
    }
  }

  async getVillageRequests(
    status?: 'pending' | 'approved' | 'rejected',
    limit: number = 20,
    offset: number = 0
  ): Promise<PaginationResult<Record<string, unknown>>> {
    let query = db('village_requests')
      .join('geo_locations as taluka', 'village_requests.taluka_id', 'taluka.id')
      .join('geo_locations as district', 'taluka.parent_id', 'district.id')
      .join('geo_locations as state', 'district.parent_id', 'state.id')
      .join('geo_locations as country', 'state.parent_id', 'country.id')
      .join('users', 'village_requests.requested_by', 'users.id')
      .select(
        'village_requests.*',
        'taluka.name as taluka_name',
        'district.name as district_name',
        'state.name as state_name',
        'country.name as country_name',
        'users.phone as requested_by_phone'
      );

    if (status) {
      query = query.where('village_requests.status', status);
    }

    const countResult = await query.clone().count('* as count').first();
    const total = Number(countResult?.count) || 0;

    const requests = await query
      .orderBy('village_requests.created_at', 'desc')
      .limit(limit)
      .offset(offset);

    return {
      data: requests,
      page: Math.floor(offset / limit) + 1,
      pageSize: limit,
      total,
      totalPages: Math.ceil(total / limit)
    };
  }

  async bulkImportVillages(
    adminId: string,
    villages: Array<{
      talukaId: string;
      name: string;
      pincode?: string;
    }>
  ): Promise<{ imported: number; skipped: number; errors: string[] }> {
    const result = {
      imported: 0,
      skipped: 0,
      errors: [] as string[]
    };

    // Validate input
    if (!villages || !Array.isArray(villages)) {
      throw new ValidationError('Villages must be an array');
    }

    if (villages.length > 1000) {
      throw new ValidationError('Maximum 1000 villages per import');
    }

    // Get existing villages in batch to check for duplicates
    const talukaIds = [...new Set(villages.map(v => v.talukaId))];
    const existingVillages = await db('geo_locations')
      .whereIn('parent_id', talukaIds)
      .where('location_type', 'village')
      .select('name', 'parent_id')
      .then(rows => rows.map(r => `${r.parent_id}:${r.name.toLowerCase()}`));

    const existingSet = new Set(existingVillages);

    // Prepare batch insert
    const toInsert: Array<{
      id: string;
      parent_id: string;
      location_type: string;
      name: string;
      pincode: string | null;
      level: number;
      is_active: boolean;
      created_at: Date;
    }> = [];

    for (const village of villages) {
      const normalizedName = village.name.trim();
      const key = `${village.talukaId}:${normalizedName.toLowerCase()}`;

      if (existingSet.has(key)) {
        result.skipped++;
        continue;
      }

      existingSet.add(key);

      toInsert.push({
        id: uuidv4(),
        parent_id: village.talukaId,
        location_type: 'village',
        name: normalizedName,
        pincode: village.pincode || null,
        level: 4,
        is_active: true,
        created_at: new Date()
      });
    }

    // Batch insert in chunks of 100
    const CHUNK_SIZE = 100;
    for (let i = 0; i < toInsert.length; i += CHUNK_SIZE) {
      const chunk = toInsert.slice(i, i + CHUNK_SIZE);
      try {
        await db('geo_locations').insert(chunk);
        result.imported += chunk.length;
      } catch (error) {
        result.errors.push(`Batch import error: ${(error as Error).message}`);
        logger.error('Village batch import failed', { error, chunkSize: chunk.length });
      }
    }

    logger.info('Village bulk import completed', {
      adminId,
      imported: result.imported,
      skipped: result.skipped
    });

    return result;
  }
}

export const geoService = new GeoService();
