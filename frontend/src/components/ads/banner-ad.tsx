'use client';

import React from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BannerAdProps {
  imageUrl: string;
  linkUrl: string;
  alt?: string;
  dismissable?: boolean;
  onDismiss?: () => void;
  className?: string;
}

export function BannerAd({ imageUrl, linkUrl, alt, dismissable, onDismiss, className }: BannerAdProps) {
  return (
    <div className={cn('relative rounded-xl overflow-hidden bg-stone-100', className)}>
      <Link href={linkUrl} target="_blank" rel="noopener noreferrer">
        <img src={imageUrl} alt={alt || 'Advertisement'} className="w-full h-full object-cover" />
      </Link>
      {dismissable && onDismiss && (
        <button
          onClick={onDismiss}
          className="absolute top-2 right-2 p-1 bg-white/80 rounded-full hover:bg-white transition-colors"
          aria-label="Dismiss ad"
        >
          <X className="w-3.5 h-3.5 text-stone-600" />
        </button>
      )}
    </div>
  );
}
