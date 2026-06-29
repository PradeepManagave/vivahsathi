'use client';

import { Heart, MessageCircle, Eye, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SearchResultItem {
  id: string;
  name: string;
  age: number;
  photo?: string;
  location: string;
  profession?: string;
  education?: string;
  religion?: string;
  caste?: string;
  isOnline?: boolean;
  isVerified?: boolean;
  matchScore?: number;
}

interface SearchResultsProps {
  items: SearchResultItem[];
  total?: number;
  loading?: boolean;
  onViewProfile: (id: string) => void;
  onSendInterest: (id: string) => void;
  onSendMessage: (id: string) => void;
  className?: string;
}

export function SearchResults({ items, total, loading, onViewProfile, onSendInterest, onSendMessage, className }: SearchResultsProps) {
  if (loading) {
    return (
      <div className={cn('space-y-3', className)}>
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse"><CardContent className="p-4"><div className="flex gap-4"><div className="w-16 h-16 rounded-full bg-gray-200" /><div className="flex-1 space-y-2"><div className="h-4 bg-gray-200 rounded w-1/3" /><div className="h-3 bg-gray-200 rounded w-1/2" /><div className="h-3 bg-gray-200 rounded w-2/3" /></div></div></CardContent></Card>
        ))}
      </div>
    );
  }

  if (!items || items.length === 0) {
    return <div className={cn('text-center py-12 text-gray-500', className)}><p className="text-lg font-medium">No members found</p><p className="text-sm mt-1">Try adjusting your search filters</p></div>;
  }

  return (
    <div className={cn('space-y-3', className)}>
      {total !== undefined && <p className="text-sm text-gray-500">{total} member{total !== 1 ? 's' : ''} found</p>}
      {items.map(item => (
        <Card key={item.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => onViewProfile(item.id)}>
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="relative flex-shrink-0">
                <div className={cn('w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-xl font-bold text-primary')}>
                  {item.photo ? <img src={item.photo} alt={item.name} className="w-full h-full rounded-full object-cover" /> : item.name.charAt(0)}
                </div>
                {item.isOnline && <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold">{item.name}</h3><span className="text-gray-500">{item.age}</span>
                  {item.isVerified && <Badge variant="success" className="text-[10px]">Verified</Badge>}
                  {item.matchScore !== undefined && <Badge variant={item.matchScore >= 80 ? 'success' : 'warning'} className="text-[10px]">{item.matchScore}% Match</Badge>}
                </div>
                <p className="text-sm text-gray-500 truncate">{item.profession}{item.profession && item.education ? ' | ' : ''}{item.education}</p>
                <p className="text-sm text-gray-400">{item.location}{item.religion ? ` • ${item.religion}` : ''}{item.caste ? ` • ${item.caste}` : ''}</p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="w-8 h-8" title="Send Interest" onClick={() => onSendInterest(item.id)}><Heart className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" className="w-8 h-8" title="Send Message" onClick={() => onSendMessage(item.id)}><MessageCircle className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" className="w-8 h-8" title="View Profile"><Eye className="w-4 h-4" /><ChevronRight className="w-3 h-3" /></Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
