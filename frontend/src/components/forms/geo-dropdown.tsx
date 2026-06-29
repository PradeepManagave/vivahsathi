'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/client';

interface GeoOption { id: string; name: string; }

interface GeoDropdownProps {
  countryId?: string;
  stateId?: string;
  districtId?: string;
  talukaId?: string;
  villageId?: string;
  onChange: (level: string, id: string, name: string) => void;
  includeVillage?: boolean;
  className?: string;
  labels?: { country?: string; state?: string; district?: string; taluka?: string; village?: string };
}

export function GeoDropdown({ countryId, stateId, districtId, talukaId, villageId, onChange, includeVillage = false, className, labels }: GeoDropdownProps) {
  const [countries, setCountries] = useState<GeoOption[]>([]);
  const [states, setStates] = useState<GeoOption[]>([]);
  const [districts, setDistricts] = useState<GeoOption[]>([]);
  const [talukas, setTalukas] = useState<GeoOption[]>([]);
  const [villages, setVillages] = useState<GeoOption[]>([]);
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const fetchOptions = useCallback(async (endpoint: string, setter: (v: GeoOption[]) => void, key: string) => {
    setLoading(p => ({ ...p, [key]: true }));
    try {
      const res = await apiClient.get<{ data: GeoOption[] }>(endpoint);
      if (res.success && res.data) setter(res.data.data || []);
    } catch { setter([]); }
    finally { setLoading(p => ({ ...p, [key]: false })); }
  }, []);

  useEffect(() => { fetchOptions(API_ENDPOINTS.geo.countries, setCountries, 'countries'); }, [fetchOptions]);
  useEffect(() => { if (countryId) fetchOptions(API_ENDPOINTS.geo.states(countryId), setStates, 'states'); else { setStates([]); setDistricts([]); setTalukas([]); setVillages([]); } }, [countryId, fetchOptions]);
  useEffect(() => { if (stateId) fetchOptions(API_ENDPOINTS.geo.districts(stateId), setDistricts, 'districts'); else { setDistricts([]); setTalukas([]); setVillages([]); } }, [stateId, fetchOptions]);
  useEffect(() => { if (districtId) fetchOptions(API_ENDPOINTS.geo.talukas(districtId), setTalukas, 'talukas'); else { setTalukas([]); setVillages([]); } }, [districtId, fetchOptions]);
  useEffect(() => { if (talukaId && includeVillage) fetchOptions(API_ENDPOINTS.geo.villages(talukaId), setVillages, 'villages'); else setVillages([]); }, [talukaId, includeVillage, fetchOptions]);

  const l = { country: 'Country', state: 'State', district: 'District', taluka: 'Taluka', village: 'Village', ...labels };

  const renderSelect = (label: string, value: string | undefined, options: GeoOption[], loadingKey: string, onValueChange: (v: string) => void, disabled: boolean) => (
    <div className="space-y-1">
      <label className="text-xs text-gray-500">{label}</label>
      <Select value={value || ''} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger>
          {loading[loadingKey] ? <Loader2 className="w-4 h-4 animate-spin" /> : <SelectValue placeholder={`Select ${label}`} />}
        </SelectTrigger>
        <SelectContent>
          {options.map(o => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <div className={cn('grid grid-cols-1 sm:grid-cols-2 gap-3', className)}>
      {renderSelect(l.country, countryId, countries, 'countries', v => { const o = countries.find(c => c.id === v); onChange('country', v, o?.name || ''); }, false)}
      {renderSelect(l.state, stateId, states, 'states', v => { const o = states.find(s => s.id === v); onChange('state', v, o?.name || ''); }, !countryId)}
      {renderSelect(l.district, districtId, districts, 'districts', v => { const o = districts.find(d => d.id === v); onChange('district', v, o?.name || ''); }, !stateId)}
      {renderSelect(l.taluka, talukaId, talukas, 'talukas', v => { const o = talukas.find(t => t.id === v); onChange('taluka', v, o?.name || ''); }, !districtId)}
      {includeVillage && renderSelect(l.village, villageId, villages, 'villages', v => { const o = villages.find(vl => vl.id === v); onChange('village', v, o?.name || ''); }, !talukaId)}
    </div>
  );
}
