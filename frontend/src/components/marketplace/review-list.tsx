'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Rating } from '@/components/ui/rating';
import { Avatar } from '@/components/ui/avatar';

export interface Review {
  id: string;
  authorName: string;
  rating: number;
  comment: string;
  createdAt: string;
  avatarUrl?: string;
}

interface ReviewListProps {
  reviews: Review[];
  className?: string;
}

export function ReviewList({ reviews, className }: ReviewListProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {reviews.map(review => (
        <div key={review.id} className="bg-white rounded-xl border border-stone-200 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar size="sm" src={review.avatarUrl}>
                <span className="text-xs">{review.authorName.charAt(0).toUpperCase()}</span>
              </Avatar>
              <div>
                <p className="font-medium text-sm text-stone-900">{review.authorName}</p>
                <p className="text-xs text-stone-400">{new Date(review.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            <Rating value={review.rating} size="sm" />
          </div>
          <p className="text-sm text-stone-600 leading-relaxed">{review.comment}</p>
        </div>
      ))}
    </div>
  );
}
