'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { BannerAd } from './banner-ad';

interface AdConfig {
  id: string;
  imageUrl: string;
  linkUrl: string;
  alt?: string;
  pageTarget?: string;
  deviceTarget?: 'all' | 'mobile' | 'desktop';
  weight?: number;
  startDate?: string;
  endDate?: string;
}

interface AdManagerProps {
  ads: AdConfig[];
  currentPage?: string;
  position?: 'top' | 'middle' | 'bottom' | 'sidebar';
  className?: string;
}

export function AdManager({ ads, currentPage, position = 'middle', className }: AdManagerProps) {
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;

  const now = new Date().toISOString();
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  const eligible = ads
    .filter(ad => {
      if (dismissed.includes(ad.id)) return false;
      if (ad.pageTarget && ad.pageTarget !== currentPage) return false;
      if (ad.deviceTarget === 'mobile' && !isMobile) return false;
      if (ad.deviceTarget === 'desktop' && isMobile) return false;
      if (ad.startDate && ad.startDate > now) return false;
      if (ad.endDate && ad.endDate < now) return false;
      return true;
    })
    .sort((a, b) => (b.weight || 1) - (a.weight || 1));

  if (eligible.length === 0) return null;

  const selected = eligible[0];

  return (
    <div className={cn('my-4', className)}>
      <BannerAd
        imageUrl={selected.imageUrl}
        linkUrl={selected.linkUrl}
        alt={selected.alt || 'Sponsored'}
        dismissable
        onDismiss={() => setDismissed(p => [...p, selected.id])}
      />
    </div>
  );
}
