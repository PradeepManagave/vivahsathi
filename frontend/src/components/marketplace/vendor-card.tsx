'use client';

import React from 'react';
import { Store, MapPin, Star, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Rating } from '@/components/ui/rating';

export interface Vendor {
  id: string;
  name: string;
  category: string;
  location: string;
  rating: number;
  reviewCount: number;
  photoUrl?: string;
  isVerified?: boolean;
  startingPrice?: number;
}

interface VendorCardProps {
  vendor: Vendor;
  className?: string;
}

export function VendorCard({ vendor, className }: VendorCardProps) {
  return (
    <Link href={`/marketplace/vendor/${vendor.id}`}>
      <div className={cn('bg-white rounded-xl border border-stone-200 overflow-hidden hover:shadow-medium transition-all duration-300 group', className)}>
        <div className="aspect-[16/9] bg-stone-100 relative overflow-hidden">
          {vendor.photoUrl ? (
            <img src={vendor.photoUrl} alt={vendor.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-amber-100 to-stone-200 flex items-center justify-center">
              <Store className="w-12 h-12 text-stone-400" />
            </div>
          )}
          {vendor.isVerified && (
            <Badge className="absolute top-3 left-3 bg-emerald-500 text-white border-0">Verified</Badge>
          )}
          {vendor.startingPrice && (
            <Badge className="absolute top-3 right-3 bg-white text-stone-900 border-stone-200">
              ₹{vendor.startingPrice}+
            </Badge>
          )}
        </div>
        <div className="p-4 space-y-2">
          <h3 className="font-semibold text-stone-900 group-hover:text-primary transition-colors">{vendor.name}</h3>
          <p className="text-sm text-stone-500">{vendor.category}</p>
          <div className="flex items-center gap-1 text-sm text-stone-500">
            <MapPin className="w-3.5 h-3.5" />
            {vendor.location}
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-stone-100">
            <div className="flex items-center gap-1.5">
              <Rating value={vendor.rating} size="sm" />
              <span className="text-sm text-stone-500">({vendor.reviewCount})</span>
            </div>
            <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-primary transition-colors" />
          </div>
        </div>
      </div>
    </Link>
  );
}
