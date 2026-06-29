'use client';

import React from 'react';
import { ProfileCard, ProfileCardProps } from './profile-card';
import { Skeleton } from '@/components/ui/skeleton';

export interface ProfileGridProps {
  profiles: ProfileCardProps[];
  loading?: boolean;
  emptyMessage?: string;
  onShortlist?: (id: string) => void;
  onSendInterest?: (id: string) => void;
  onViewProfile?: (id: string) => void;
  columns?: 2 | 3 | 4;
  className?: string;
}

export function ProfileGrid({
  profiles,
  loading = false,
  emptyMessage = 'No profiles found',
  onShortlist,
  onSendInterest,
  onViewProfile,
  columns = 4,
  className = ''
}: ProfileGridProps) {
  const columnClasses = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
  };

  if (loading) {
    return (
      <div className={`grid ${columnClasses[columns]} gap-6 ${className}`}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-stone-200 overflow-hidden">
            <Skeleton className="aspect-[3/4] w-full" />
            <div className="p-4 space-y-3">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (profiles.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-stone-500 text-lg">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`grid ${columnClasses[columns]} gap-6 ${className}`}>
      {profiles.map((profile) => (
        <ProfileCard
          key={profile.id}
          {...profile}
          onShortlist={onShortlist ? () => onShortlist(profile.id) : undefined}
          onSendInterest={onSendInterest ? () => onSendInterest(profile.id) : undefined}
          onViewProfile={onViewProfile ? () => onViewProfile(profile.id) : undefined}
        />
      ))}
    </div>
  );
}
