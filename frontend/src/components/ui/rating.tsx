'use client';

import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface RatingProps {
  value: number;
  onChange?: (value: number) => void;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  readOnly?: boolean;
  className?: string;
}

const sizeMap = { sm: 'w-3.5 h-3.5', md: 'w-5 h-5', lg: 'w-7 h-7' };

export function Rating({ value, onChange, max = 5, size = 'md', readOnly = false, className }: RatingProps) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {Array.from({ length: max }, (_, i) => {
        const filled = i < (hovered || value);
        return (
          <button
            key={i}
            type="button"
            disabled={readOnly}
            onClick={() => onChange?.(i + 1)}
            onMouseEnter={() => !readOnly && setHovered(i + 1)}
            onMouseLeave={() => setHovered(0)}
            className={cn('transition-colors', !readOnly && 'cursor-pointer hover:scale-110')}
          >
            <Star className={cn(sizeMap[size], filled ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300')} />
          </button>
        );
      })}
    </div>
  );
}
