'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface AdSenseSlotProps {
  adSlot: string;
  adFormat?: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
  className?: string;
}

export function AdSenseSlot({ adSlot, adFormat = 'auto', className }: AdSenseSlotProps) {
  React.useEffect(() => {
    try {
      if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
        (window as any).adsbygoogle.push({});
      }
    } catch { /* safe */ }
  }, []);

  return (
    <div className={cn('overflow-hidden', className)}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive="true"
      />
    </div>
  );
}
