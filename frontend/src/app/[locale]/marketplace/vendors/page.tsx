'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Store, Search, Filter, Star, MapPin, Phone, 
  ExternalLink, Heart
} from 'lucide-react';

interface Vendor {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviews: number;
  location: string;
  phone: string;
  image: string;
  description: string;
  verified: boolean;
}

const mockVendors: Vendor[] = [
  { id: '1', name: 'Royal Wedding Planners', category: 'Wedding Planner', rating: 4.8, reviews: 124, location: 'Mumbai, Andheri', phone: '+91 98765 43210', image: '', description: 'Full-service wedding planning with 10+ years experience', verified: true },
  { id: '2', name: 'Sharma Photography', category: 'Photography', rating: 4.9, reviews: 89, location: 'Mumbai, Bandra', phone: '+91 98765 43211', image: '', description: 'Professional wedding photography and videography', verified: true },
  { id: '3', name: 'Golden Caterers', category: 'Catering', rating: 4.7, reviews: 156, location: 'Mumbai, Juhu', phone: '+91 98765 43212', image: '', description: 'Traditional and modern cuisine for weddings', verified: true },
  { id: '4', name: 'Elegant Decor Studio', category: 'Decoration', rating: 4.6, reviews: 67, location: 'Mumbai, Powai', phone: '+91 98765 43213', image: '', description: 'Creative wedding decoration and floral arrangements', verified: false },
  { id: '5', name: 'Bridal Beauty Salon', category: 'Makeup & Beauty', rating: 4.9, reviews: 203, location: 'Mumbai, Colaba', phone: '+91 98765 43214', image: '', description: 'Bridal makeup, hairstyling, and spa services', verified: true },
  { id: '6', name: 'Sangeet Sounds', category: 'Music & DJ', rating: 4.5, reviews: 45, location: 'Mumbai, Dadar', phone: '+91 98765 43215', image: '', description: 'Live music, DJ, and sound system for events', verified: true },
];

const categories = ['All', 'Wedding Planner', 'Photography', 'Catering', 'Decoration', 'Makeup & Beauty', 'Music & DJ'];

export default function MarketplaceVendorsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const filteredVendors = mockVendors.filter(vendor => {
    const matchesSearch = vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          vendor.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || vendor.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Wedding Vendors</h1>
          <p className="text-gray-500">Find trusted wedding service providers</p>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              selectedCategory === cat
                ? 'bg-[#2d5016] text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search vendors by name or service..."
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#2d5016] focus:border-transparent"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Vendors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVendors.map((vendor) => (
          <div key={vendor.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
            <div className="h-40 bg-gradient-to-br from-[#2d5016]/20 to-[#2d5016]/5 flex items-center justify-center">
              <Store className="w-16 h-16 text-[#2d5016]/30" />
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{vendor.name}</h3>
                    {vendor.verified && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">Verified</span>
                    )}
                  </div>
                  <p className="text-sm text-[#2d5016] font-medium mt-1">{vendor.category}</p>
                </div>
                <button 
                  className="p-1 hover:bg-gray-100 rounded"
                  onClick={() => toggleFavorite(vendor.id)}
                >
                  <Heart className={`w-5 h-5 ${favorites.has(vendor.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                </button>
              </div>
              
              <p className="text-sm text-gray-600 mt-3">{vendor.description}</p>
              
              <div className="flex items-center gap-4 mt-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  {vendor.rating} ({vendor.reviews})
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {vendor.location}
                </span>
              </div>

              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#2d5016] text-white rounded-lg hover:bg-[#1a3009] transition-colors text-sm">
                  <Phone className="w-4 h-4" />
                  Contact
                </button>
                <Link href={`/marketplace/vendors/${vendor.id}`} className="flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                  <ExternalLink className="w-4 h-4" />
                  View
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredVendors.length === 0 && (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
          <Store className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No vendors found</p>
        </div>
      )}
    </div>
  );
}
