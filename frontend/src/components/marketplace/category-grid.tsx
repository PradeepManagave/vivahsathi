'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  vendorCount: number;
}

interface CategoryGridProps {
  categories: Category[];
  className?: string;
}

const categoryIcons: Record<string, string> = {
  photography: '📸',
  catering: '🍽️',
  venue: '🏛️',
  decoration: '💐',
  jewellery: '💍',
  'bridal-wear': '👗',
  'groom-wear': '🤵',
  makeup: '💄',
  music: '🎵',
  transport: '🚗',
  gifts: '🎁',
  'event-planning': '📋',
};

export function CategoryGrid({ categories, className }: CategoryGridProps) {
  return (
    <div className={cn('grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4', className)}>
      {categories.map(category => (
        <Link
          key={category.id}
          href={`/marketplace?category=${category.slug}`}
          className="flex flex-col items-center justify-center p-6 bg-white rounded-xl border border-stone-200 hover:shadow-medium hover:border-primary/20 transition-all duration-300 group"
        >
          <span className="text-3xl mb-3 group-hover:scale-110 transition-transform">
            {category.icon || categoryIcons[category.slug] || '🏪'}
          </span>
          <span className="text-sm font-medium text-stone-900 text-center group-hover:text-primary transition-colors">
            {category.name}
          </span>
          <span className="text-xs text-stone-400 mt-1">{category.vendorCount} vendors</span>
        </Link>
      ))}
    </div>
  );
}
