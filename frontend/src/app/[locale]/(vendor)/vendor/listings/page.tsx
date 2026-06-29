'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Store, MapPin, Phone, Mail, Star, Edit, Eye, Trash2, Plus, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Pagination } from '@/components/ui/pagination';

interface VendorListing {
  id: string;
  businessName: string;
  category: string;
  description: string;
  location: string;
  phone: string;
  email: string;
  website?: string;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  isActive: boolean;
  plan: 'free' | 'basic' | 'premium';
  createdAt: string;
}

const planColors: Record<string, string> = {
  free: 'bg-stone-100 text-stone-600 border-stone-200',
  basic: 'bg-primary/10 text-primary border-primary/20',
  premium: 'bg-secondary-200/20 text-secondary-500 border-secondary-200/30'
};

export default function VendorListingsPage() {
  const [listings, setListings] = useState<VendorListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/vendor/listings?page=${page}&search=${search}&category=${categoryFilter}`);
        const data = await res.json();
        setListings(data.data?.listings || []);
        setTotalPages(data.data?.pagination?.totalPages || 1);
      } catch {
        console.error('Failed to fetch listings');
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, [page, search, categoryFilter]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 font-headline">My Listings</h1>
          <p className="text-stone-500 mt-1">Manage your business listings</p>
        </div>
        <Button variant="primary">
          <Plus className="w-4 h-4 mr-2" />
          Add Listing
        </Button>
      </div>

      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <Input
              placeholder="Search listings..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-stone-200 rounded-lg text-sm bg-white"
          >
            <option value="all">All Categories</option>
            <option value="venue">Venues</option>
            <option value="catering">Catering</option>
            <option value="photography">Photography</option>
            <option value="decor">Decoration</option>
            <option value="jewelry">Jewelry</option>
            <option value="makeup">Makeup</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="p-4">
                <div className="space-y-3">
                  <div className="h-40 bg-stone-100 rounded-lg animate-pulse" />
                  <div className="h-5 bg-stone-100 rounded animate-pulse w-3/4" />
                  <div className="h-4 bg-stone-100 rounded animate-pulse w-1/2" />
                  <div className="h-4 bg-stone-100 rounded animate-pulse w-full" />
                </div>
              </Card>
            ))
          ) : listings.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Store className="w-12 h-12 text-stone-300 mx-auto mb-3" />
              <p className="text-stone-500 mb-4">No listings found</p>
              <Button variant="primary">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Listing
              </Button>
            </div>
          ) : (
            listings.map((listing) => (
              <Card key={listing.id} className="overflow-hidden hover:shadow-medium transition-shadow">
                <div className="h-40 bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
                  <Store className="w-12 h-12 text-primary/30" />
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-stone-900 truncate">{listing.businessName}</h3>
                    <Badge className={planColors[listing.plan]}>{listing.plan}</Badge>
                  </div>
                  <p className="text-sm text-stone-500 mb-3 line-clamp-2">{listing.description}</p>

                  <div className="space-y-1.5 text-sm text-stone-600">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-stone-400" />
                      <span className="truncate">{listing.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-stone-400" />
                      <span>{listing.phone}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-stone-100">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span className="text-sm font-medium">{listing.rating}</span>
                      <span className="text-xs text-stone-400">({listing.reviewCount})</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-error">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        <div className="mt-4">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </Card>
    </div>
  );
}
