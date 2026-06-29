'use client';

import React, { useState } from 'react';
import { 
  Megaphone, Search, Filter, MapPin, Clock,
  Phone, MessageCircle, Heart
} from 'lucide-react';

interface Classified {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  price: string;
  postedBy: string;
  postedAt: string;
  phone: string;
  image: string;
}

const mockClassifieds: Classified[] = [
  { id: '1', title: 'Bridal Lehenga for Sale - Worn Once', description: 'Beautiful red bridal lehenga, designer piece, worn only for wedding ceremony. Size: M', category: 'Clothing', location: 'Mumbai, Andheri', price: '₹25,000', postedBy: 'Priya M.', postedAt: '2 hours ago', phone: '+91 98765 43210', image: '' },
  { id: '2', title: 'Wedding Venue Available - December 2026', description: 'Premium banquet hall available for wedding dates in December 2026. Capacity: 500 guests', category: 'Venues', location: 'Mumbai, Bandra', price: '₹5,00,000', postedBy: 'Royal Banquets', postedAt: '5 hours ago', phone: '+91 98765 43211', image: '' },
  { id: '3', title: 'Photography Package - Pre-Wedding Shoot', description: 'Professional pre-wedding photoshoot package including 2 locations, 500+ edited photos', category: 'Services', location: 'Mumbai, Juhu', price: '₹35,000', postedBy: 'Sharma Studios', postedAt: '1 day ago', phone: '+91 98765 43212', image: '' },
  { id: '4', title: 'Wedding Decor Items - Complete Set', description: 'Complete wedding decoration set including mandap, stage decor, lighting, and floral arrangements', category: 'Equipment', location: 'Mumbai, Powai', price: '₹75,000', postedBy: 'Decor Studio', postedAt: '2 days ago', phone: '+91 98765 43213', image: '' },
  { id: '5', title: 'Bridal Jewelry Set - Kundan Collection', description: 'Traditional Kundan bridal jewelry set with necklace, earrings, maang tikka, and bangles', category: 'Jewelry', location: 'Mumbai, Colaba', price: '₹1,50,000', postedBy: 'Gold Palace', postedAt: '3 days ago', phone: '+91 98765 43214', image: '' },
  { id: '6', title: 'Wedding Invitation Cards - Custom Design', description: 'Custom designed wedding invitation cards with premium printing. Minimum order: 100 cards', category: 'Services', location: 'Mumbai, Dadar', price: '₹50/card', postedBy: 'Print Craft', postedAt: '4 days ago', phone: '+91 98765 43215', image: '' },
];

const categories = ['All', 'Clothing', 'Venues', 'Services', 'Equipment', 'Jewelry'];

export default function MarketplaceClassifiedsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const filteredClassifieds = mockClassifieds.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
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
          <h1 className="text-2xl font-bold text-gray-900">Wedding Classifieds</h1>
          <p className="text-gray-500">Buy, sell, and exchange wedding items</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#2d5016] text-white rounded-lg hover:bg-[#1a3009] transition-colors">
          <Megaphone className="w-4 h-4" />
          Post Ad
        </button>
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
          placeholder="Search classifieds..."
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#2d5016] focus:border-transparent"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Classifieds List */}
      <div className="space-y-4">
        {filteredClassifieds.map((item) => (
          <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
            <div className="flex flex-col sm:flex-row">
              <div className="sm:w-48 h-48 sm:h-auto bg-gradient-to-br from-[#2d5016]/20 to-[#2d5016]/5 flex items-center justify-center">
                <Megaphone className="w-16 h-16 text-[#2d5016]/30" />
              </div>
              <div className="flex-1 p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">{item.title}</h3>
                    <span className="inline-block px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-full mt-1">
                      {item.category}
                    </span>
                  </div>
                  <button 
                    className="p-1 hover:bg-gray-100 rounded"
                    onClick={() => toggleFavorite(item.id)}
                  >
                    <Heart className={`w-5 h-5 ${favorites.has(item.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                  </button>
                </div>
                
                <p className="text-sm text-gray-600 mt-3">{item.description}</p>
                
                <div className="flex items-center gap-4 mt-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {item.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {item.postedAt}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <span className="text-xl font-bold text-[#2d5016]">{item.price}</span>
                  <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-3 py-2 bg-[#2d5016] text-white rounded-lg hover:bg-[#1a3009] transition-colors text-sm">
                      <Phone className="w-4 h-4" />
                      Call
                    </button>
                    <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                      <MessageCircle className="w-4 h-4" />
                      Message
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredClassifieds.length === 0 && (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
          <Megaphone className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No classifieds found</p>
        </div>
      )}
    </div>
  );
}
