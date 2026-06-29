'use client';

import { MapPin, Calendar, Briefcase, GraduationCap, Heart, ChevronRight } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ProfileHeaderProps {
  name: string;
  age: number;
  photo?: string;
  location?: string;
  profession?: string;
  education?: string;
  religion?: string;
  caste?: string;
  isVerified?: boolean;
  isOnline?: boolean;
  membership?: string;
  onSendInterest?: () => void;
  onViewPhoto?: () => void;
}

export function ProfileHeader({ name, age, photo, location, profession, education, religion, caste, isVerified, isOnline, membership, onSendInterest, onViewPhoto }: ProfileHeaderProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-primary to-primary/80 p-6 pb-24" />
      <div className="px-6 pb-6 -mt-16">
        <div className="flex items-end gap-4 mb-4">
          <div className="relative">
            <Avatar src={photo} name={name} size="xl" className="ring-4 ring-white" />
            {isOnline && <span className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />}
          </div>
          <div className="flex-1 pt-16">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{name}, {age}</h1>
              {isVerified && <Badge variant="success">Verified</Badge>}
              {membership && membership !== 'free' && <Badge variant="primary">{membership}</Badge>}
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-gray-500">
              {location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{location}</span>}
              {profession && <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" />{profession}</span>}
              {education && <span className="flex items-center gap-1"><GraduationCap className="w-3.5 h-3.5" />{education}</span>}
            </div>
            {(religion || caste) && <p className="text-sm text-gray-400 mt-1">{[religion, caste].filter(Boolean).join(' | ')}</p>}
          </div>
        </div>

        <div className="flex gap-3">
          {onSendInterest && <Button onClick={onSendInterest}><Heart className="w-4 h-4 mr-1.5" />Send Interest</Button>}
          {onViewPhoto && <Button variant="outline" onClick={onViewPhoto}>View Photos <ChevronRight className="w-4 h-4 ml-1" /></Button>}
        </div>
      </div>
    </div>
  );
}
