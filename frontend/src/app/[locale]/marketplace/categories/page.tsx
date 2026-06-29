'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Camera, Utensils, Palette, Music, 
  Flower2, ShoppingCart, Cake, Gem,
  Car, Video, Shirt, Users
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
  count: number;
  color: string;
}

const categories: Category[] = [
  { id: '1', name: 'Photography', icon: <Camera className="w-8 h-8" />, count: 45, color: 'bg-blue-100 text-blue-600' },
  { id: '2', name: 'Catering', icon: <Utensils className="w-8 h-8" />, count: 38, color: 'bg-orange-100 text-orange-600' },
  { id: '3', name: 'Decoration', icon: <Palette className="w-8 h-8" />, count: 52, color: 'bg-purple-100 text-purple-600' },
  { id: '4', name: 'Music & DJ', icon: <Music className="w-8 h-8" />, count: 28, color: 'bg-pink-100 text-pink-600' },
  { id: '5', name: 'Floral Design', icon: <Flower2 className="w-8 h-8" />, count: 34, color: 'bg-green-100 text-green-600' },
  { id: '6', name: 'Wedding Planning', icon: <ShoppingCart className="w-8 h-8" />, count: 22, color: 'bg-indigo-100 text-indigo-600' },
  { id: '7', name: 'Cakes & Sweets', icon: <Cake className="w-8 h-8" />, count: 41, color: 'bg-yellow-100 text-yellow-600' },
  { id: '8', name: 'Jewelry', icon: <Gem className="w-8 h-8" />, count: 19, color: 'bg-red-100 text-red-600' },
  { id: '9', name: 'Transportation', icon: <Car className="w-8 h-8" />, count: 15, color: 'bg-gray-100 text-gray-600' },
  { id: '10', name: 'Videography', icon: <Video className="w-8 h-8" />, count: 31, color: 'bg-teal-100 text-teal-600' },
  { id: '11', name: 'Bridal Wear', icon: <Shirt className="w-8 h-8" />, count: 47, color: 'bg-rose-100 text-rose-600' },
  { id: '12', name: 'Makeup & Beauty', icon: <Users className="w-8 h-8" />, count: 56, color: 'bg-fuchsia-100 text-fuchsia-600' },
];

export default function MarketplaceCategoriesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Service Categories</h1>
        <p className="text-gray-500">Browse wedding services by category</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/marketplace/vendors?category=${category.name}`}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all hover:-translate-y-1 cursor-pointer group"
          >
            <div className={`w-16 h-16 rounded-xl ${category.color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
              {category.icon}
            </div>
            <h3 className="font-semibold text-gray-900 text-center">{category.name}</h3>
            <p className="text-sm text-gray-500 text-center mt-1">{category.count} vendors</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
