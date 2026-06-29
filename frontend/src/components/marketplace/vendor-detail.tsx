'use client';

import React from 'react';
import { Store, MapPin, Phone, Globe, Clock, Shield, Star } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Rating } from '@/components/ui/rating';
import { Tabs, TabPanel } from '@/components/ui/tabs';
import type { Vendor } from './vendor-card';
import type { Review } from './review-list';

interface VendorDetailProps {
  vendor: Vendor & {
    description?: string;
    phone?: string;
    website?: string;
    workingHours?: string;
    address?: string;
    photos?: string[];
  };
  reviews?: Review[];
}

export function VendorDetail({ vendor, reviews }: VendorDetailProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        <div className="aspect-[3/1] bg-stone-100 relative">
          {vendor.photoUrl && (
            <img src={vendor.photoUrl} alt={vendor.name} className="w-full h-full object-cover" />
          )}
        </div>
        <div className="p-6 -mt-12 relative">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div className="flex items-end gap-4">
              <Avatar size="xl" className="ring-4 ring-white">
                <Store className="w-8 h-8" />
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-stone-900">{vendor.name}</h1>
                  {vendor.isVerified && <Badge className="bg-emerald-500 text-white border-0">Verified</Badge>}
                </div>
                <p className="text-stone-500">{vendor.category}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Rating value={vendor.rating} size="sm" />
                  <span className="text-sm text-stone-500">({vendor.reviewCount} reviews)</span>
                </div>
              </div>
            </div>
            <Button variant="primary">Contact Vendor</Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-stone-200 p-4 space-y-3">
          <h3 className="font-semibold text-stone-900 flex items-center gap-2"><MapPin className="w-4 h-4" /> Location</h3>
          <p className="text-sm text-stone-600">{vendor.address || vendor.location}</p>
        </div>
        <div className="bg-white rounded-xl border border-stone-200 p-4 space-y-3">
          <h3 className="font-semibold text-stone-900 flex items-center gap-2"><Phone className="w-4 h-4" /> Contact</h3>
          <p className="text-sm text-stone-600">{vendor.phone || 'Not provided'}</p>
        </div>
        <div className="bg-white rounded-xl border border-stone-200 p-4 space-y-3">
          <h3 className="font-semibold text-stone-900 flex items-center gap-2"><Clock className="w-4 h-4" /> Hours</h3>
          <p className="text-sm text-stone-600">{vendor.workingHours || 'Not specified'}</p>
        </div>
      </div>

      <Tabs tabs={[{ id: 'about', label: 'About' }, { id: 'photos', label: 'Photos' }, { id: 'reviews', label: 'Reviews' }]}>
        <TabPanel tabId="about">
          <div className="bg-white rounded-xl border border-stone-200 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-stone-900">About</h2>
            <p className="text-stone-600 leading-relaxed">{vendor.description || 'No description provided.'}</p>
            {vendor.website && (
              <a href={vendor.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline text-sm">
                <Globe className="w-4 h-4" /> {vendor.website}
              </a>
            )}
            <div className="flex items-center gap-2 text-sm text-stone-500 pt-4 border-t border-stone-100">
              <Shield className="w-4 h-4" /> Starting from ₹{vendor.startingPrice || 'Contact for pricing'}
            </div>
          </div>
        </TabPanel>
        <TabPanel tabId="photos">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {(vendor.photos?.length ?? 0) > 0 ? vendor.photos!.map((photo, i) => (
              <div key={i} className="aspect-square bg-stone-100 rounded-lg overflow-hidden">
                <img src={photo} alt={`${vendor.name} ${i + 1}`} className="w-full h-full object-cover" />
              </div>
            )) : (
              <p className="col-span-full text-center text-stone-500 py-12">No photos available.</p>
            )}
          </div>
        </TabPanel>
        <TabPanel tabId="reviews">
          <div className="space-y-4">
            {reviews && reviews.length > 0 ? reviews.map((review) => (
              <div key={review.id} className="bg-white rounded-xl border border-stone-200 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar size="sm"><span className="text-xs">{review.authorName[0]}</span></Avatar>
                    <span className="font-medium text-sm text-stone-900">{review.authorName}</span>
                  </div>
                  <Rating value={review.rating} size="sm" />
                </div>
                <p className="text-sm text-stone-600">{review.comment}</p>
                <p className="text-xs text-stone-400">{new Date(review.createdAt).toLocaleDateString()}</p>
              </div>
            )) : (
              <p className="text-center text-stone-500 py-12">No reviews yet.</p>
            )}
          </div>
        </TabPanel>
      </Tabs>
    </div>
  );
}

