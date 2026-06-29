'use client';

import React, { useState } from 'react';
import { SlidersHorizontal, RotateCcw, Search, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/select';

export interface MatchFilterValues {
  ageRange: [number, number];
  heightRange: [number, number];
  religion?: string;
  caste?: string;
  motherTongue?: string;
  education?: string;
  occupation?: string;
  incomeRange: [number, number];
  maritalStatus?: string;
  diet?: string;
  manglik?: string;
  country?: string;
  state?: string;
  city?: string;
  hasPhoto?: boolean;
  verifiedOnly?: boolean;
}

interface MatchFiltersProps {
  values: MatchFilterValues;
  onChange: (values: MatchFilterValues) => void;
  onApply?: () => void;
  onReset?: () => void;
  className?: string;
}

const defaultValues: MatchFilterValues = {
  ageRange: [18, 60],
  heightRange: [120, 220],
  incomeRange: [0, 10000000],
};

export function MatchFilters({ values, onChange, onApply, onReset, className }: MatchFiltersProps) {
  const [open, setOpen] = useState(false);

  const update = <K extends keyof MatchFilterValues>(key: K, val: MatchFilterValues[K]) => {
    onChange({ ...values, [key]: val });
  };

  return (
    <div className={cn('bg-white rounded-xl border border-stone-200', className)}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full p-4 text-left"
      >
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-stone-500" />
          <span className="font-medium text-sm text-stone-900">Filters</span>
        </div>
        <ChevronDown className={cn('w-4 h-4 text-stone-400 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="border-t border-stone-200 p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-stone-500">Age Range</label>
              <div className="flex items-center gap-2">
                <Input type="number" min={18} max={99} value={values.ageRange[0]} onChange={e => update('ageRange', [parseInt(e.target.value) || 18, values.ageRange[1]])} className="w-full" />
                <span className="text-stone-400">-</span>
                <Input type="number" min={18} max={99} value={values.ageRange[1]} onChange={e => update('ageRange', [values.ageRange[0], parseInt(e.target.value) || 60])} className="w-full" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-stone-500">Height (cm)</label>
              <div className="flex items-center gap-2">
                <Input type="number" min={100} max={250} value={values.heightRange[0]} onChange={e => update('heightRange', [parseInt(e.target.value) || 120, values.heightRange[1]])} />
                <span className="text-stone-400">-</span>
                <Input type="number" min={100} max={250} value={values.heightRange[1]} onChange={e => update('heightRange', [values.heightRange[0], parseInt(e.target.value) || 220])} />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-stone-500">Annual Income (₹)</label>
              <div className="flex items-center gap-2">
                <Input type="number" min={0} value={values.incomeRange[0]} onChange={e => update('incomeRange', [parseInt(e.target.value) || 0, values.incomeRange[1]])} />
                <span className="text-stone-400">-</span>
                <Input type="number" min={0} value={values.incomeRange[1]} onChange={e => update('incomeRange', [values.incomeRange[0], parseInt(e.target.value) || 10000000])} />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-stone-500">Religion</label>
              <NativeSelect value={values.religion || ''} onChange={e => update('religion', e.target.value || undefined)} options={[{ value: '', label: 'Any' }, { value: 'Hindu', label: 'Hindu' }, { value: 'Muslim', label: 'Muslim' }, { value: 'Christian', label: 'Christian' }, { value: 'Sikh', label: 'Sikh' }, { value: 'Buddhist', label: 'Buddhist' }, { value: 'Jain', label: 'Jain' }, { value: 'Parsi', label: 'Parsi' }, { value: 'Other', label: 'Other' }]} />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-stone-500">Caste</label>
              <Input value={values.caste || ''} onChange={e => update('caste', e.target.value || undefined)} placeholder="Any" />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-stone-500">Mother Tongue</label>
              <NativeSelect value={values.motherTongue || ''} onChange={e => update('motherTongue', e.target.value || undefined)} options={[{ value: '', label: 'Any' }, { value: 'Hindi', label: 'Hindi' }, { value: 'Bengali', label: 'Bengali' }, { value: 'Telugu', label: 'Telugu' }, { value: 'Marathi', label: 'Marathi' }, { value: 'Tamil', label: 'Tamil' }, { value: 'Urdu', label: 'Urdu' }, { value: 'Gujarati', label: 'Gujarati' }, { value: 'Kannada', label: 'Kannada' }, { value: 'Malayalam', label: 'Malayalam' }, { value: 'Punjabi', label: 'Punjabi' }, { value: 'Other', label: 'Other' }]} />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-stone-500">Education</label>
              <NativeSelect value={values.education || ''} onChange={e => update('education', e.target.value || undefined)} options={[{ value: '', label: 'Any' }, { value: 'High School', label: 'High School' }, { value: 'Diploma', label: 'Diploma' }, { value: "Bachelor's", label: "Bachelor's" }, { value: "Master's", label: "Master's" }, { value: 'PhD', label: 'PhD' }, { value: 'Other', label: 'Other' }]} />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-stone-500">Occupation</label>
              <Input value={values.occupation || ''} onChange={e => update('occupation', e.target.value || undefined)} placeholder="Any" />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-stone-500">Marital Status</label>
              <NativeSelect value={values.maritalStatus || ''} onChange={e => update('maritalStatus', e.target.value || undefined)} options={[{ value: '', label: 'Any' }, { value: 'Never Married', label: 'Never Married' }, { value: 'Divorced', label: 'Divorced' }, { value: 'Widowed', label: 'Widowed' }, { value: 'Separated', label: 'Separated' }]} />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-stone-500">Diet</label>
              <NativeSelect value={values.diet || ''} onChange={e => update('diet', e.target.value || undefined)} options={[{ value: '', label: 'Any' }, { value: 'Vegetarian', label: 'Vegetarian' }, { value: 'Non-Vegetarian', label: 'Non-Vegetarian' }, { value: 'Eggetarian', label: 'Eggetarian' }, { value: 'Vegan', label: 'Vegan' }]} />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-stone-500">Manglik</label>
              <NativeSelect value={values.manglik || ''} onChange={e => update('manglik', e.target.value || undefined)} options={[{ value: '', label: 'Any' }, { value: 'Manglik', label: 'Manglik' }, { value: 'Non-Manglik', label: 'Non-Manglik' }, { value: "Don't Know", label: "Don't Know" }]} />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={values.hasPhoto || false} onChange={e => update('hasPhoto', e.target.checked)} className="rounded border-stone-300" />
              <span className="text-sm text-stone-600">Has Photo</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={values.verifiedOnly || false} onChange={e => update('verifiedOnly', e.target.checked)} className="rounded border-stone-300" />
              <span className="text-sm text-stone-600">Verified Only</span>
            </label>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button variant="primary" onClick={onApply}><Search className="w-4 h-4 mr-2" />Apply Filters</Button>
            <Button variant="outline" onClick={() => { onChange(defaultValues); onReset?.(); }}>
              <RotateCcw className="w-4 h-4 mr-2" />Reset
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
