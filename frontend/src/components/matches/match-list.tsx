'use client';

import { UserRound, Heart, MapPin, Briefcase, GraduationCap, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';

export interface Match {
  id: string;
  name: string;
  age: number;
  location: string;
  photoUrl?: string;
  profession?: string;
  education?: string;
  compatibility: number;
  isInterested?: boolean;
}

interface MatchListProps {
  matches: Match[];
  loading?: boolean;
  onSendInterest?: (id: string) => void;
}

function getCompatibilityColor(score: number) {
  if (score > 70) return 'bg-green-100 text-green-700 border-green-300';
  if (score >= 40) return 'bg-yellow-100 text-yellow-700 border-yellow-300';
  return 'bg-red-100 text-red-700 border-red-300';
}

function MatchCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-stone-200 overflow-hidden p-5 space-y-4">
      <div className="flex gap-4">
        <Skeleton variant="rect" width="80px" height="80px" className="rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="title" width="60%" />
          <Skeleton variant="text" width="40%" />
          <Skeleton variant="text" width="50%" />
        </div>
      </div>
      <div className="flex justify-between items-center pt-3 border-t border-stone-100">
        <Skeleton variant="text" width="80px" />
        <Skeleton variant="rect" width="100px" height="36px" className="rounded-lg" />
      </div>
    </div>
  );
}

export function MatchList({ matches, loading, onSendInterest }: MatchListProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <MatchCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!matches.length) {
    return (
      <EmptyState
        icon={<Users className="w-12 h-12" />}
        title="No matches found"
        description="Try adjusting your search preferences to discover more profiles."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {matches.map((match) => (
        <div
          key={match.id}
          className="bg-white rounded-xl border border-stone-200 overflow-hidden hover:shadow-medium transition-all duration-300"
        >
          <div className="aspect-[4/3] bg-stone-100 relative overflow-hidden">
            {match.photoUrl ? (
              <img
                src={match.photoUrl}
                alt={match.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-rose-100 to-stone-200 flex items-center justify-center">
                <UserRound className="w-16 h-16 text-stone-400" />
              </div>
            )}
            <Badge
              className={cn(
                'absolute top-3 right-3 border',
                getCompatibilityColor(match.compatibility)
              )}
            >
              {match.compatibility}% Match
            </Badge>
          </div>

          <div className="p-4 space-y-3">
            <div>
              <h3 className="font-semibold text-stone-900 text-lg">
                {match.name}, {match.age}
              </h3>
              <div className="flex items-center gap-1 text-sm text-stone-500 mt-0.5">
                <MapPin className="w-3.5 h-3.5" />
                {match.location}
              </div>
            </div>

            <div className="space-y-1.5 text-sm text-stone-600">
              {match.profession && (
                <div className="flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-stone-400" />
                  {match.profession}
                </div>
              )}
              {match.education && (
                <div className="flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-stone-400" />
                  {match.education}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-stone-100">
              {match.isInterested ? (
                <Button variant="outline" className="w-full" disabled>
                  <Heart className="w-4 h-4 mr-2" />
                  Interest Sent
                </Button>
              ) : (
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => onSendInterest?.(match.id)}
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Send Interest
                </Button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
