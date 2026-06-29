'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Heart, User, MessageSquare, Star, Bell, Settings,
  Crown, Shield, Video, Phone, MapPin, Calendar,
  ChevronRight, ChevronLeft, Loader2, Share2, 
  CreditCard, Edit3, Eye, MoreVertical, Filter,
  TrendingUp, Users, Clock, CheckCircle, AlertCircle
} from 'lucide-react';
import { apiClient } from '@/lib/api/client';

interface Match {
  id: string;
  name: string;
  age: number;
  height: string;
  religion: string;
  caste: string;
  location: string;
  education: string;
  occupation: string;
  photo: string;
  compatibility: number;
  isPremium: boolean;
  isVerified: boolean;
  lastActive: string;
}

interface MemberStats {
  profileViews: number;
  interestsReceived: number;
  interestsSent: number;
  matches: number;
  messages: number;
  profileCompleteness: number;
}

const colorClasses = {
  maroon: 'bg-[#570013]/10 text-[#570013]',
  gold: 'bg-[#fdc34d]/20 text-[#a67c00]',
  green: 'bg-green-100 text-green-600',
  red: 'bg-red-100 text-red-600',
  blue: 'bg-blue-100 text-blue-600'
};

const mockMatches: Match[] = [
  {
    id: '1',
    name: 'Priya Sharma',
    age: 28,
    height: '5\'4"',
    religion: 'Hindu',
    caste: 'Brahmin',
    location: 'Mumbai, Maharashtra',
    education: 'M.Tech, IIT Bombay',
    occupation: 'Software Engineer',
    photo: '',
    compatibility: 94,
    isPremium: true,
    isVerified: true,
    lastActive: '2 hours ago'
  },
  {
    id: '2',
    name: 'Anjali Deshmukh',
    age: 26,
    height: '5\'3"',
    religion: 'Hindu',
    caste: 'Maratha',
    location: 'Pune, Maharashtra',
    education: 'MBA, Symbiosis',
    occupation: 'Marketing Manager',
    photo: '',
    compatibility: 89,
    isPremium: false,
    isVerified: true,
    lastActive: '5 hours ago'
  },
  {
    id: '3',
    name: 'Kavita Joshi',
    age: 30,
    height: '5\'5"',
    religion: 'Hindu',
    caste: 'Deshmukh',
    location: 'Nashik, Maharashtra',
    education: 'MD, GMC',
    occupation: 'Doctor',
    photo: '',
    compatibility: 87,
    isPremium: true,
    isVerified: true,
    lastActive: '1 day ago'
  }
];

const mockStats: MemberStats = {
  profileViews: 245,
  interestsReceived: 18,
  interestsSent: 42,
  matches: 8,
  messages: 12,
  profileCompleteness: 78
};

export default function MemberDashboardPage() {
  const [matches, setMatches] = useState<Match[]>(mockMatches);
  const [stats, setStats] = useState<MemberStats>(mockStats);
  const [loading, setLoading] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const carouselRef = React.useRef<HTMLDivElement>(null);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % matches.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + matches.length) % matches.length);
  };

  const handleInterest = async (matchId: string) => {
    try {
      await apiClient.post(`/interests/${matchId}`);
      setMatches(matches.map(m => 
        m.id === matchId ? m : m
      ));
    } catch {
      // Handle error
    }
  };

  const shareOnWhatsApp = (match: Match) => {
    const message = `Check out ${match.name}'s profile on M-Plus Matrimony - The Heritage!`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[#570013] flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-[#570013]">The Heritage</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="/dashboard" className="text-[#570013] font-medium">Home</a>
            <a href="/matches" className="text-gray-600 hover:text-[#570013]">Matches</a>
            <a href="/messages" className="text-gray-600 hover:text-[#570013]">Messages</a>
            <a href="/profile" className="text-gray-600 hover:text-[#570013]">Profile</a>
          </nav>
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-100 rounded-full relative">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <Settings className="w-5 h-5 text-gray-600" />
            </button>
            <div className="w-10 h-10 rounded-full bg-[#570013]/10 flex items-center justify-center">
              <User className="w-5 h-5 text-[#570013]" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-[#570013] to-[#3a000d] rounded-2xl p-6 text-white mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-1">Welcome back!</h1>
              <p className="text-white/80">Find your perfect match today</p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowUpgradeModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#fdc34d] text-[#570013] rounded-lg font-medium hover:bg-[#fdc34d]/90"
              >
                <Crown className="w-4 h-4" />
                Upgrade to Premium
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${colorClasses.maroon}`}>
                <Eye className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.profileViews}</p>
                <p className="text-sm text-gray-500">Profile Views</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${colorClasses.green}`}>
                <Heart className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.interestsReceived}</p>
                <p className="text-sm text-gray-500">Interests Received</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${colorClasses.gold}`}>
                <Star className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.matches}</p>
                <p className="text-sm text-gray-500">Matches</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${colorClasses.blue}`}>
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.messages}</p>
                <p className="text-sm text-gray-500">New Messages</p>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Completeness */}
        <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Profile Completeness</h3>
            <span className="text-[#570013] font-medium">{stats.profileCompleteness}%</span>
          </div>
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#570013] to-[#fdc34d] rounded-full transition-all"
              style={{ width: `${stats.profileCompleteness}%` }}
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Complete your profile to get 3x more matches
          </p>
        </div>

        {/* Match Carousel */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-[#570013]" />
              <h2 className="font-semibold">Recommended Matches</h2>
              <span className="px-2 py-0.5 bg-[#570013]/10 text-[#570013] text-xs rounded-full">
                AI Powered
              </span>
            </div>
            <a href="/matches" className="text-sm text-[#570013] hover:underline flex items-center gap-1">
              View All <ChevronRight className="w-4 h-4" />
            </a>
          </div>

          {/* Carousel */}
          <div className="relative">
            <div 
              ref={carouselRef}
              className="flex transition-transform duration-300"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {matches.map((match) => (
                <div key={match.id} className="w-full flex-shrink-0 p-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Profile Card */}
                    <div className="relative">
                      <div className="aspect-[4/5] rounded-xl bg-gradient-to-br from-[#570013]/20 to-[#fdc34d]/20 overflow-hidden">
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="w-24 h-24 text-[#570013]/30" />
                        </div>
                        {match.isPremium && (
                          <div className="absolute top-4 right-4 px-3 py-1 bg-[#fdc34d] text-[#570013] rounded-full text-sm font-medium flex items-center gap-1">
                            <Crown className="w-3 h-3" /> Premium
                          </div>
                        )}
                        {match.isVerified && (
                          <div className="absolute top-4 left-4 px-2 py-1 bg-green-500 text-white rounded-full text-xs font-medium flex items-center gap-1">
                            <Shield className="w-3 h-3" /> Verified
                          </div>
                        )}
                        <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3">
                          <div className="flex items-end justify-between">
                            <div>
                              <h3 className="font-semibold text-lg">{match.name}</h3>
                              <p className="text-sm text-gray-600">{match.age} yrs, {match.height}</p>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-1 text-[#570013]">
                                <TrendingUp className="w-4 h-4" />
                                <span className="font-bold">{match.compatibility}%</span>
                              </div>
                              <p className="text-xs text-gray-500">Match</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold text-lg mb-3">{match.name}, {match.age}</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <MapPin className="w-4 h-4" />
                            {match.location}
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Shield className="w-4 h-4" />
                            {match.religion} • {match.caste}
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Star className="w-4 h-4" />
                            {match.education}
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Users className="w-4 h-4" />
                            {match.occupation}
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Clock className="w-4 h-4" />
                            Last active: {match.lastActive}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-3 pt-4">
                        <button
                          onClick={() => handleInterest(match.id)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#570013] text-white rounded-lg font-medium hover:bg-[#450010]"
                        >
                          <Heart className="w-5 h-5" />
                          Send Interest
                        </button>
                        <button
                          onClick={() => shareOnWhatsApp(match)}
                          className="flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600"
                        >
                          <Share2 className="w-5 h-5" />
                          Share
                        </button>
                        <button className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                          <Phone className="w-5 h-5 text-gray-600" />
                        </button>
                        <button className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                          <Video className="w-5 h-5 text-gray-600" />
                        </button>
                      </div>

                      <a 
                        href={`/profile/view/${match.id}`}
                        className="block w-full text-center py-2 border border-[#570013] text-[#570013] rounded-lg font-medium hover:bg-[#570013]/5"
                      >
                        View Full Profile
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation */}
            <button
              onClick={prevSlide}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-gray-50"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-gray-50"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Dots */}
            <div className="flex justify-center gap-2 p-4">
              {matches.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    currentSlide === index ? 'bg-[#570013]' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <a href="/profile/edit" className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow text-center group">
            <div className="w-12 h-12 rounded-full bg-[#570013]/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-[#570013] transition-colors">
              <Edit3 className="w-6 h-6 text-[#570013] group-hover:text-white transition-colors" />
            </div>
            <p className="font-medium">Edit Profile</p>
          </a>
          <a href="/kyc/schedule" className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow text-center group">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3 group-hover:bg-green-500 transition-colors">
              <Shield className="w-6 h-6 text-green-600 group-hover:text-white transition-colors" />
            </div>
            <p className="font-medium">Complete KYC</p>
          </a>
          <a href="/membership" className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow text-center group">
            <div className="w-12 h-12 rounded-full bg-[#fdc34d]/20 flex items-center justify-center mx-auto mb-3 group-hover:bg-[#fdc34d] transition-colors">
              <Crown className="w-6 h-6 text-[#a67c00] group-hover:text-[#570013] transition-colors" />
            </div>
            <p className="font-medium">Upgrade Plan</p>
          </a>
          <a href="/search" className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow text-center group">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-500 transition-colors">
              <Filter className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
            </div>
            <p className="font-medium">Search Profiles</p>
          </a>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-4 border-b">
            <h2 className="font-semibold">Recent Activity</h2>
          </div>
          <div className="divide-y">
            <div className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <Heart className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium">New Interest Received</p>
                <p className="text-sm text-gray-500">Rajesh Kumar showed interest in your profile</p>
              </div>
              <span className="text-sm text-gray-400">2 hours ago</span>
            </div>
            <div className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Eye className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Profile Viewed</p>
                <p className="text-sm text-gray-500">Priya Sharma viewed your profile</p>
              </div>
              <span className="text-sm text-gray-400">5 hours ago</span>
            </div>
            <div className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#fdc34d]/20 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-[#a67c00]" />
              </div>
              <div className="flex-1">
                <p className="font-medium">New Message</p>
                <p className="text-sm text-gray-500">You have 3 unread messages</p>
              </div>
              <span className="text-sm text-gray-400">1 day ago</span>
            </div>
          </div>
        </div>
      </main>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#fdc34d] flex items-center justify-center">
                    <Crown className="w-6 h-6 text-[#570013]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Upgrade to Premium</h3>
                    <p className="text-sm text-gray-500">Unlock all features</p>
                  </div>
                </div>
                <button onClick={() => setShowUpgradeModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  ×
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>View contact details of all members</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>Send unlimited interests</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>Chat with premium matches</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>Video call with matches</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>Verified badge on profile</span>
              </div>
            </div>
            <div className="p-6 border-t flex gap-3">
              <button 
                onClick={() => setShowUpgradeModal(false)}
                className="flex-1 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
              >
                Maybe Later
              </button>
              <a 
                href="/membership"
                className="flex-1 py-3 bg-[#570013] text-white rounded-lg font-medium text-center hover:bg-[#450010]"
              >
                View Plans
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
