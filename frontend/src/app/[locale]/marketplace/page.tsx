'use client';

import React from 'react';
import Link from 'next/link';
import { Store, Grid3X3, Megaphone, ArrowRight } from 'lucide-react';

const sections = [
  {
    title: 'Wedding Vendors',
    description: 'Browse trusted wedding service providers in your area',
    icon: <Store className="w-12 h-12" />,
    href: '/marketplace/vendors',
    color: 'bg-[#2d5016]',
    lightColor: 'bg-[#2d5016]/10 text-[#2d5016]'
  },
  {
    title: 'Service Categories',
    description: 'Explore wedding services organized by category',
    icon: <Grid3X3 className="w-12 h-12" />,
    href: '/marketplace/categories',
    color: 'bg-blue-600',
    lightColor: 'bg-blue-100 text-blue-600'
  },
  {
    title: 'Classifieds',
    description: 'Buy, sell, and exchange wedding items and services',
    icon: <Megaphone className="w-12 h-12" />,
    href: '/marketplace/classifieds',
    color: 'bg-purple-600',
    lightColor: 'bg-purple-100 text-purple-600'
  }
];

export default function MarketplacePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Wedding Marketplace</h1>
        <p className="text-gray-500 mt-2">Everything you need for your perfect wedding</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {sections.map((section) => (
          <Link
            key={section.title}
            href={section.href}
            className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-all hover:-translate-y-1 group"
          >
            <div className={`w-20 h-20 rounded-xl ${section.lightColor} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
              {section.icon}
            </div>
            <h2 className="text-xl font-semibold text-gray-900">{section.title}</h2>
            <p className="text-gray-600 mt-2">{section.description}</p>
            <div className="flex items-center gap-2 mt-4 text-sm font-medium text-gray-900">
              Explore
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>

      {/* Stats */}
      <div className="bg-gradient-to-r from-[#2d5016] to-[#1a3009] rounded-xl p-8 text-white">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <p className="text-3xl font-bold">250+</p>
            <p className="text-white/70 mt-1">Verified Vendors</p>
          </div>
          <div>
            <p className="text-3xl font-bold">12</p>
            <p className="text-white/70 mt-1">Service Categories</p>
          </div>
          <div>
            <p className="text-3xl font-bold">500+</p>
            <p className="text-white/70 mt-1">Active Listings</p>
          </div>
          <div>
            <p className="text-3xl font-bold">4.8</p>
            <p className="text-white/70 mt-1">Average Rating</p>
          </div>
        </div>
      </div>
    </div>
  );
}
