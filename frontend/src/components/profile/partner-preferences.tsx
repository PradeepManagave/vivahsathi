'use client';

import { Heart } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface PartnerPreferencesProps {
  ageRange?: { from: number; to: number };
  heightRange?: { from: string; to: string };
  education?: string[];
  occupation?: string[];
  religion?: string[];
  caste?: string[];
  location?: string[];
  maritalStatus?: string[];
  onEdit?: () => void;
}

export function PartnerPreferences({ ageRange, heightRange, education, occupation, religion, caste, location, maritalStatus, onEdit }: PartnerPreferencesProps) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2"><Heart className="w-5 h-5 text-primary" /><h3 className="font-semibold">Partner Preferences</h3></div>
        {onEdit && <button onClick={onEdit} className="text-sm text-primary hover:underline">Edit</button>}
      </div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
        {ageRange && <div><p className="text-gray-500 mb-0.5">Age Range</p><p className="font-medium">{ageRange.from} - {ageRange.to} years</p></div>}
        {heightRange && <div><p className="text-gray-500 mb-0.5">Height Range</p><p className="font-medium">{heightRange.from} - {heightRange.to}</p></div>}
        {education && education.length > 0 && <div className="col-span-2"><p className="text-gray-500 mb-0.5">Education</p><p className="font-medium">{education.join(', ')}</p></div>}
        {occupation && occupation.length > 0 && <div className="col-span-2"><p className="text-gray-500 mb-0.5">Occupation</p><p className="font-medium">{occupation.join(', ')}</p></div>}
        {religion && religion.length > 0 && <div><p className="text-gray-500 mb-0.5">Religion</p><p className="font-medium">{religion.join(', ')}</p></div>}
        {caste && caste.length > 0 && <div><p className="text-gray-500 mb-0.5">Caste</p><p className="font-medium">{caste.join(', ')}</p></div>}
        {location && location.length > 0 && <div className="col-span-2"><p className="text-gray-500 mb-0.5">Location</p><p className="font-medium">{location.join(', ')}</p></div>}
        {maritalStatus && maritalStatus.length > 0 && <div><p className="text-gray-500 mb-0.5">Marital Status</p><p className="font-medium">{maritalStatus.join(', ')}</p></div>}
      </div>
    </Card>
  );
}
