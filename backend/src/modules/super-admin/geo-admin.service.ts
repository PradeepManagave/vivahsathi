import { db } from '../../config/database';
import logger from '../../config/logger';
import { AppError } from '../../shared/utils/errors';

export class GeoAdminService {
  async addCountry(data: { name: string; code: string; phoneCode?: string; currency?: string }) {
    const existing = await db('countries').where('code', data.code).first();
    if (existing) {
      throw new AppError('Country code already exists', 400, 'EXISTS');
    }

    const [country] = await db('countries')
      .insert({
        name: data.name,
        code: data.code,
        phone_code: data.phoneCode,
        currency: data.currency,
        is_active: true
      })
      .returning('*');

    return country;
  }

  async addState(data: { countryId: string; name: string; code: string; capital?: string }) {
    const country = await db('countries').where('id', data.countryId).first();
    if (!country) {
      throw new AppError('Country not found', 404, 'NOT_FOUND');
    }

    const existing = await db('states')
      .where('country_id', data.countryId)
      .where('code', data.code)
      .first();

    if (existing) {
      throw new AppError('State code already exists in this country', 400, 'EXISTS');
    }

    const [state] = await db('states')
      .insert({
        country_id: data.countryId,
        name: data.name,
        code: data.code,
        capital: data.capital,
        is_active: true
      })
      .returning('*');

    return state;
  }

  async addDistrict(data: { stateId: string; name: string; code: string }) {
    const state = await db('states').where('id', data.stateId).first();
    if (!state) {
      throw new AppError('State not found', 404, 'NOT_FOUND');
    }

    const existing = await db('districts')
      .where('state_id', data.stateId)
      .where('code', data.code)
      .first();

    if (existing) {
      throw new AppError('District code already exists in this state', 400, 'EXISTS');
    }

    const [district] = await db('districts')
      .insert({
        state_id: data.stateId,
        name: data.name,
        code: data.code,
        is_active: true
      })
      .returning('*');

    return district;
  }

  async addTaluka(data: { districtId: string; name: string; code: string }) {
    const district = await db('districts').where('id', data.districtId).first();
    if (!district) {
      throw new AppError('District not found', 404, 'NOT_FOUND');
    }

    const existing = await db('talukas')
      .where('district_id', data.districtId)
      .where('code', data.code)
      .first();

    if (existing) {
      throw new AppError('Taluka code already exists in this district', 400, 'EXISTS');
    }

    const [taluka] = await db('talukas')
      .insert({
        district_id: data.districtId,
        name: data.name,
        code: data.code,
        is_active: true
      })
      .returning('*');

    return taluka;
  }

  async addVillage(data: { talukaId: string; name: string; pincode?: string }) {
    const taluka = await db('talukas').where('id', data.talukaId).first();
    if (!taluka) {
      throw new AppError('Taluka not found', 404, 'NOT_FOUND');
    }

    const [village] = await db('villages')
      .insert({
        taluka_id: data.talukaId,
        name: data.name,
        pincode: data.pincode,
        is_active: true
      })
      .returning('*');

    return village;
  }

  async updateGeoEntry(type: string, id: string, data: any) {
    const tableMap: Record<string, string> = {
      country: 'countries',
      state: 'states',
      district: 'districts',
      taluka: 'talukas',
      village: 'villages'
    };

    const table = tableMap[type];
    if (!table) {
      throw new AppError('Invalid geo type', 400, 'INVALID_TYPE');
    }

    const entry = await db(table).where('id', id).first();
    if (!entry) {
      throw new AppError(`${type} not found`, 404, 'NOT_FOUND');
    }

    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.code) updateData.code = data.code;
    if (data.capital) updateData.capital = data.capital;
    if (data.pincode) updateData.pincode = data.pincode;
    if (typeof data.isActive === 'boolean') updateData.is_active = data.isActive;

    const [updated] = await db(table)
      .where('id', id)
      .update(updateData)
      .returning('*');

    return updated;
  }

  async bulkImportVillages(talukaId: string, villages: { name: string; pincode?: string }[]) {
    const taluka = await db('talukas').where('id', talukaId).first();
    if (!taluka) {
      throw new AppError('Taluka not found', 404, 'NOT_FOUND');
    }

    const validVillages = villages.filter(v => v.name && v.name.trim().length > 0);
    
    if (validVillages.length === 0) {
      throw new AppError('No valid villages to import', 400, 'NO_DATA');
    }

    const insertData = validVillages.map(v => ({
      taluka_id: talukaId,
      name: v.name.trim(),
      pincode: v.pincode || null,
      is_active: true
    }));

    const imported = await db('villages')
      .insert(insertData)
      .returning('*');

    return {
      total: villages.length,
      imported: imported.length,
      skipped: villages.length - validVillages.length,
      villages: imported
    };
  }

  async bulkImportFromCSV(talukaId: string, csvData: string) {
    const lines = csvData.trim().split('\n');
    const villages: { name: string; pincode?: string }[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const parts = line.split(',').map(p => p.trim().replace(/"/g, ''));
      if (parts.length >= 1 && parts[0]) {
        villages.push({
          name: parts[0],
          pincode: parts[1] || undefined
        });
      }
    }

    return this.bulkImportVillages(talukaId, villages);
  }

  async getPendingVillageRequests(page = 1, limit = 20) {
    const offset = (page - 1) * limit;

    const [requests, total] = await Promise.all([
      db('village_requests as vr')
        .select(
          'vr.*',
          'v.name as village_name',
          't.name as taluka_name',
          'd.name as district_name',
          's.name as state_name',
          'u.first_name as requested_by_first_name',
          'u.last_name as requested_by_last_name'
        )
        .leftJoin('villages as v', 'v.id', 'vr.village_id')
        .leftJoin('talukas as t', 't.id', 'vr.taluka_id')
        .leftJoin('districts as d', 'd.id', 't.district_id')
        .leftJoin('states as s', 's.id', 'd.state_id')
        .leftJoin('users as u', 'u.id', 'vr.requested_by')
        .where('vr.status', 'pending')
        .orderBy('vr.created_at', 'asc')
        .limit(limit)
        .offset(offset),
      db('village_requests')
        .where('status', 'pending')
        .count('id as count')
        .first()
    ]);

    return {
      data: requests,
      pagination: {
        page,
        limit,
        total: Number(total?.count || 0),
        pages: Math.ceil(Number(total?.count || 0) / limit)
      }
    };
  }

  async approveVillageRequest(requestId: string, adminId: string) {
    const request = await db('village_requests').where('id', requestId).first();
    if (!request) {
      throw new AppError('Request not found', 404, 'NOT_FOUND');
    }

    if (request.status !== 'pending') {
      throw new AppError('Request is not pending', 400, 'INVALID_STATUS');
    }

    let village;
    if (request.village_id) {
      village = await db('villages').where('id', request.village_id).first();
    } else {
      [village] = await db('villages')
        .insert({
          taluka_id: request.taluka_id,
          name: request.village_name,
          pincode: request.pincode,
          is_active: true
        })
        .returning('*');
    }

    const [updated] = await db('village_requests')
      .where('id', requestId)
      .update({
        status: 'approved',
        processed_by: adminId,
        processed_at: db.fn.now()
      })
      .returning('*');

    return { request: updated, village };
  }

  async rejectVillageRequest(requestId: string, adminId: string, reason: string) {
    const request = await db('village_requests').where('id', requestId).first();
    if (!request) {
      throw new AppError('Request not found', 404, 'NOT_FOUND');
    }

    if (request.status !== 'pending') {
      throw new AppError('Request is not pending', 400, 'INVALID_STATUS');
    }

    const [updated] = await db('village_requests')
      .where('id', requestId)
      .update({
        status: 'rejected',
        processed_by: adminId,
        processed_at: db.fn.now(),
        rejection_reason: reason
      })
      .returning('*');

    return updated;
  }

  async getGeoHierarchy(countryId?: string) {
    const countries = countryId
      ? await db('countries').where('id', countryId).where('is_active', true)
      : await db('countries').where('is_active', true);

    const result = await Promise.all(countries.map(async (country) => {
      const states = await db('states').where('country_id', country.id).where('is_active', true);
      
      const statesWithDistricts = await Promise.all(states.map(async (state) => {
        const districts = await db('districts').where('state_id', state.id).where('is_active', true);
        
        const districtsWithTalukas = await Promise.all(districts.map(async (district) => {
          const talukas = await db('talukas').where('district_id', district.id).where('is_active', true);
          
          const talukasWithVillages = await Promise.all(talukas.map(async (taluka) => {
            const villages = await db('villages').where('taluka_id', taluka.id).where('is_active', true);
            return { ...taluka, villages };
          }));
          
          return { ...district, talukas: talukasWithVillages };
        }));
        
        return { ...state, districts: districtsWithTalukas };
      }));
      
      return { ...country, states: statesWithDistricts };
    }));

    return result;
  }
}
