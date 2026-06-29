'use client';

import { Users } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface FamilyInfoProps {
  fatherName?: string;
  motherName?: string;
  siblings?: { name: string; relation: string; married?: boolean }[];
  familyType?: string;
  familyValues?: string;
  familyStatus?: string;
  onEdit?: () => void;
}

export function FamilyInfo({ fatherName, motherName, siblings = [], familyType, familyValues, familyStatus, onEdit }: FamilyInfoProps) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2"><Users className="w-5 h-5 text-primary" /><h3 className="font-semibold">Family Details</h3></div>
        {onEdit && <button onClick={onEdit} className="text-sm text-primary hover:underline">Edit</button>}
      </div>
      <div className="space-y-3 text-sm">
        {(fatherName || motherName) && (
          <div className="grid grid-cols-2 gap-3">
            {fatherName && <div><p className="text-gray-500 mb-0.5">Father</p><p className="font-medium">{fatherName}</p></div>}
            {motherName && <div><p className="text-gray-500 mb-0.5">Mother</p><p className="font-medium">{motherName}</p></div>}
          </div>
        )}
        <div className="grid grid-cols-3 gap-3">
          {familyType && <div><p className="text-gray-500 mb-0.5">Type</p><p className="font-medium">{familyType}</p></div>}
          {familyValues && <div><p className="text-gray-500 mb-0.5">Values</p><p className="font-medium">{familyValues}</p></div>}
          {familyStatus && <div><p className="text-gray-500 mb-0.5">Status</p><p className="font-medium">{familyStatus}</p></div>}
        </div>
        {siblings.length > 0 && (
          <div><p className="text-gray-500 mb-1">Siblings ({siblings.length})</p>
            <div className="space-y-1">{siblings.map((s, i) => <p key={i} className="font-medium">{s.name} ({s.relation}){s.married ? ' - Married' : ''}</p>)}</div>
          </div>
        )}
      </div>
    </Card>
  );
}
