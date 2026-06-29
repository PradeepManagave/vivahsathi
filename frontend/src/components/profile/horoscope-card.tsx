'use client';

import { Star, Sun, Moon, Globe, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface HoroscopeCardProps {
  rashi?: string;
  nakshatra?: string;
  gotra?: string;
  birthTime?: string;
  birthPlace?: string;
  manglik?: boolean;
  onEdit?: () => void;
}

export function HoroscopeCard({ rashi, nakshatra, gotra, birthTime, birthPlace, manglik, onEdit }: HoroscopeCardProps) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2"><Star className="w-5 h-5 text-primary" /><h3 className="font-semibold">Horoscope</h3></div>
        {onEdit && <button onClick={onEdit} className="text-sm text-primary hover:underline">Edit</button>}
      </div>
      <div className="grid grid-cols-2 gap-4 text-sm">
        {rashi && <div><p className="text-gray-500 mb-0.5">Rashi</p><p className="font-medium">{rashi}</p></div>}
        {nakshatra && <div><p className="text-gray-500 mb-0.5">Nakshatra</p><p className="font-medium">{nakshatra}</p></div>}
        {gotra && <div><p className="text-gray-500 mb-0.5">Gotra</p><p className="font-medium">{gotra}</p></div>}
        {birthTime && <div><p className="text-gray-500 mb-0.5">Birth Time</p><p className="font-medium">{birthTime}</p></div>}
        {birthPlace && <div className="col-span-2"><p className="text-gray-500 mb-0.5">Birth Place</p><p className="font-medium">{birthPlace}</p></div>}
        {manglik !== undefined && <div className="col-span-2"><p className="text-gray-500 mb-0.5">Manglik</p><Badge variant={manglik ? 'warning' : 'success'}>{manglik ? 'Manglik' : 'Non-Manglik'}</Badge></div>}
      </div>
    </Card>
  );
}
