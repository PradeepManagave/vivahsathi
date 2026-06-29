'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard, Store, MessageCircle, User,
  Bell, Menu, PlusCircle, MessageSquare, Star,
  PlayCircle, TrendingUp, Eye, Users,
  Calendar, Video, ChevronRight
} from 'lucide-react';

interface Inquiry {
  id: string;
  name: string;
  date: string;
  service: string;
  status: 'urgent' | 'follow-up' | 'new';
  avatar?: string;
}

interface VirtualTour {
  id: string;
  client: string;
  title: string;
  date: string;
  time: string;
  status: 'upcoming' | 'pending';
}

interface Metric {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'stable' | 'down';
}

const mockMetrics: Metric[] = [
  { label: 'Total Views', value: '12.4k', change: '+12%', trend: 'up' },
  { label: 'Active Leads', value: '84', change: 'Stable', trend: 'stable' },
  { label: 'Inquiries', value: '31', change: '+5%', trend: 'up' },
  { label: 'Rating', value: '4.9', change: '', trend: 'stable' }
];

const mockInquiries: Inquiry[] = [
  { id: '1', name: 'Anjali G.', date: 'Dec 12, 2023', service: 'Palace Wedding', status: 'urgent' },
  { id: '2', name: 'Rahul K.', date: 'Jan 05, 2024', service: 'Pre-wedding Shoot', status: 'follow-up' },
  { id: '3', name: 'Meera S.', date: 'Jan 08, 2024', service: 'Catering Review', status: 'new' }
];

const mockTours: VirtualTour[] = [
  { id: '1', client: 'Deshmukh Family', title: 'Palace Grounds Tour', date: 'Today', time: '14:30 PM', status: 'upcoming' },
  { id: '2', client: 'Meera S.', title: 'Catering Review (KYC Verified)', date: 'Tomorrow', time: '11:00 AM', status: 'pending' }
];

const chartData = [40, 65, 55, 90, 70, 45, 85];
const chartLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function VendorDashboardPage() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="min-h-screen bg-surface">
      <header className="fixed top-0 w-full z-50 bg-surface shadow-sm">
        <div className="flex justify-between items-center px-6 h-16 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center">
              <User className="w-5 h-5 text-stone-500" />
            </div>
            <div className="hidden md:block">
              <p className="text-xl font-bold text-primary font-headline tracking-tight">Heritage Vendor</p>
              <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">The Peshwa Heritage Palace</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-stone-100 rounded-full text-primary transition-colors relative">
              <Bell className="w-6 h-6" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button className="md:hidden p-2 hover:bg-stone-100 rounded-full text-primary">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-32 px-4 md:px-8 max-w-7xl mx-auto">
        <section className="mb-10">
          <h1 className="text-3xl font-extrabold text-primary mb-2 font-headline">The Peshwa Heritage Palace</h1>
          <p className="text-stone-600 font-medium">
            Welcome back to your dashboard. You have <span className="text-primary font-bold">12 new inquiries</span> today.
          </p>
        </section>

        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {mockMetrics.map((metric) => (
            <div key={metric.label} className="bg-white p-6 rounded-xl border border-stone-200/10">
              <p className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-2">{metric.label}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-primary">{metric.value}</span>
                {metric.change && (
                  <span className={`text-xs font-bold ${metric.trend === 'up' ? 'text-amber-600' : 'text-stone-500'}`}>
                    {metric.change}
                  </span>
                )}
                {metric.trend === 'stable' && !metric.change && (
                  <Star className="w-4 h-4 text-amber-400" fill="currentColor" />
                )}
              </div>
            </div>
          ))}
        </section>

        <div className="grid md:grid-cols-3 gap-8 mb-10">
          <div className="md:col-span-2 bg-stone-100 p-8 rounded-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-stone-700">Listing Performance</h2>
              <span className="text-xs font-bold text-stone-500 uppercase tracking-widest">Last 7 Days</span>
            </div>
            <div className="h-48 flex items-end justify-between gap-2 px-2">
              {chartData.map((value, index) => (
                <div key={index} className="w-full bg-primary/10 rounded-t-lg relative group h-full flex items-end">
                  <div 
                    className="absolute inset-x-0 bottom-0 bg-primary/40 rounded-t-lg transition-all group-hover:bg-primary"
                    style={{ height: `${value}%` }}
                  ></div>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-4 px-2 text-[10px] font-bold text-stone-400 uppercase">
              {chartLabels.map((label) => (
                <span key={label}>{label}</span>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-bold text-stone-700 mb-2">Quick Actions</h2>
            <button className="bg-gradient-to-br from-[#570013] to-[#800020] text-white w-full py-4 rounded-full font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/20 active:scale-95 transition-all">
              <PlusCircle className="w-5 h-5" />
              Add New Listing
            </button>
            <button className="bg-white border border-primary text-primary w-full py-4 rounded-full font-bold text-sm flex items-center justify-center gap-2 hover:bg-primary/5 active:scale-95 transition-all">
              <MessageSquare className="w-5 h-5" />
              Respond to Leads
            </button>
            <div className="mt-4 p-6 bg-amber-100 rounded-xl border border-amber-200">
              <p className="text-[10px] font-bold text-amber-700 uppercase tracking-widest mb-2">Premium Status</p>
              <p className="text-sm font-bold text-amber-900">Your heritage badge expires in 14 days.</p>
              <button className="mt-4 text-xs font-extrabold text-amber-700 underline decoration-2 underline-offset-4">RENEW NOW</button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <section className="bg-stone-100 p-8 rounded-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-primary">Recent Inquiries</h2>
              <button className="text-xs font-bold text-amber-600 uppercase tracking-widest">View All</button>
            </div>
            <div className="space-y-4">
              {mockInquiries.map((inquiry) => (
                <div key={inquiry.id} className="bg-white p-4 rounded-xl flex items-center justify-between border border-stone-200/5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-stone-200 flex items-center justify-center">
                      <User className="w-6 h-6 text-stone-500" />
                    </div>
                    <div>
                      <h3 className="font-bold text-stone-900">{inquiry.name}</h3>
                      <p className="text-xs text-stone-500">{inquiry.date} • {inquiry.service}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 text-[10px] font-bold rounded-full uppercase ${
                    inquiry.status === 'urgent' 
                      ? 'bg-red-100 text-red-600' 
                      : inquiry.status === 'follow-up'
                        ? 'bg-amber-100 text-amber-600'
                        : 'bg-green-100 text-green-600'
                  }`}>
                    {inquiry.status}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-stone-100 p-8 rounded-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-primary">Virtual Tours</h2>
              <Video className="w-5 h-5 text-amber-600" />
            </div>
            <div className="space-y-4">
              {mockTours.map((tour) => (
                <div 
                  key={tour.id} 
                  className={`p-5 bg-white rounded-r-xl border-l-4 ${
                    tour.status === 'upcoming' ? 'border-amber-400' : 'border-stone-300 opacity-80'
                  }`}
                >
                  <p className="text-[10px] font-bold text-stone-500 uppercase mb-1">{tour.date} • {tour.time}</p>
                  <h3 className="font-bold text-stone-900 mb-2">{tour.title}</h3>
                  <p className="text-xs text-stone-500 mb-2">Client: {tour.client}</p>
                  {tour.status === 'upcoming' ? (
                    <button className="text-xs font-bold text-primary flex items-center gap-1">
                      <PlayCircle className="w-4 h-4" />
                      JOIN ROOM
                    </button>
                  ) : (
                    <span className="text-xs text-stone-400 font-medium">Awaiting confirmation</span>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      <nav className="fixed bottom-0 w-full z-50 rounded-t-xl bg-surface border-t border-stone-200/20 shadow-[0_-4px_20px_0_rgba(30,27,19,0.04)] h-20 px-4 flex justify-around items-center">
        <Link href="/vendor" className="flex flex-col items-center justify-center bg-amber-100 text-primary rounded-xl px-3 py-1 transition-opacity">
          <LayoutDashboard className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-wider mt-1">Dashboard</span>
        </Link>
        <Link href="/vendor/listings" className="flex flex-col items-center justify-center text-stone-500 opacity-70 hover:opacity-100 transition-opacity">
          <Store className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-wider mt-1">Listings</span>
        </Link>
        <Link href="/vendor/inquiries" className="flex flex-col items-center justify-center text-stone-500 opacity-70 hover:opacity-100 transition-opacity">
          <MessageCircle className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-wider mt-1">Inquiries</span>
        </Link>
        <Link href="/vendor/account" className="flex flex-col items-center justify-center text-stone-500 opacity-70 hover:opacity-100 transition-opacity">
          <User className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-wider mt-1">Account</span>
        </Link>
      </nav>
    </div>
  );
}
