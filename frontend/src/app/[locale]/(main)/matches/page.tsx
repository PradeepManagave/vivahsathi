'use client';

import { useState } from 'react';
import { 
  Heart, Star, Filter, Search, Grid, List, SlidersHorizontal,
  MapPin, Calendar, GraduationCap, Briefcase, ChevronRight,
  Video, Phone, Share2, MoreVertical, X, Sparkles,
  TrendingUp, Clock, CheckCircle, AlertCircle, Loader2
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
  income: string;
  photo: string;
  compatibility: {
    overall: number;
    personality: number;
    values: number;
    lifestyle: number;
  };
  isPremium: boolean;
  isVerified: boolean;
  isMutualMatch: boolean;
  lastActive: string;
  bio: string;
  tags: string[];
}

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
    income: '20-25 LPA',
    photo: '',
    compatibility: { overall: 94, personality: 96, values: 92, lifestyle: 89 },
    isPremium: true,
    isVerified: true,
    isMutualMatch: true,
    lastActive: '2 hours ago',
    bio: 'Looking for a compatible partner who values family and career equally.',
    tags: ['Tech-savvy', 'Family-oriented', 'Travel lover']
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
    income: '12-15 LPA',
    photo: '',
    compatibility: { overall: 89, personality: 88, values: 91, lifestyle: 85 },
    isPremium: false,
    isVerified: true,
    isMutualMatch: false,
    lastActive: '5 hours ago',
    bio: 'Ambitious professional looking for someone with similar goals.',
    tags: ['Career-focused', 'Fitness enthusiast', 'Book worm']
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
    income: '30-35 LPA',
    photo: '',
    compatibility: { overall: 87, personality: 85, values: 89, lifestyle: 88 },
    isPremium: true,
    isVerified: true,
    isMutualMatch: true,
    lastActive: '1 day ago',
    bio: 'Dedicated doctor seeking a life partner who understands the demands of the medical profession.',
    tags: ['Medical professional', 'Caring', 'Work-life balance']
  },
  {
    id: '4',
    name: 'Sneha Kulkarni',
    age: 27,
    height: '5\'2"',
    religion: 'Hindu',
    caste: 'Kulkarni',
    location: 'Kolhapur, Maharashtra',
    education: 'CA',
    occupation: 'Chartered Accountant',
    income: '15-18 LPA',
    photo: '',
    compatibility: { overall: 85, personality: 87, values: 83, lifestyle: 90 },
    isPremium: false,
    isVerified: true,
    isMutualMatch: false,
    lastActive: '3 days ago',
    bio: 'Numbers are my thing, but looking for someone who makes my heart skip a beat!',
    tags: ['Financially stable', 'Responsible', 'Home chef']
  },
  {
    id: '5',
    name: 'Rutuja Patil',
    age: 29,
    height: '5\'4"',
    religion: 'Hindu',
    caste: 'Patil',
    location: 'Sangli, Maharashtra',
    education: 'PhD, Pune University',
    occupation: 'Research Scientist',
    income: '18-20 LPA',
    photo: '',
    compatibility: { overall: 82, personality: 80, values: 85, lifestyle: 78 },
    isPremium: true,
    isVerified: true,
    isMutualMatch: false,
    lastActive: '1 week ago',
    bio: 'Science enthusiast seeking a partner who appreciates curiosity and learning.',
    tags: ['Intellectual', 'Curious', 'Nature lover']
  }
];

const colorClasses = {
  maroon: 'bg-[#570013]/10 text-[#570013]',
  green: 'bg-green-100 text-green-600',
  yellow: 'bg-yellow-100 text-yellow-600',
  blue: 'bg-blue-100 text-blue-600'
};

export default function MatchRecommendationsPage() {
  const [matches, setMatches] = useState<Match[]>(mockMatches);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [filters, setFilters] = useState({
    religion: '',
    caste: '',
    education: '',
    occupation: '',
    minAge: 18,
    maxAge: 45,
    location: ''
  });
  const [sortBy, setSortBy] = useState<'compatibility' | 'recent' | 'age'>('compatibility');

  const handleInterest = async (matchId: string) => {
    setMatches(matches.map(m => 
      m.id === matchId ? { ...m, isMutualMatch: true } : m
    ));
  };

  const getCompatibilityColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredMatches = matches
    .filter(m => 
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.location.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'compatibility') return b.compatibility.overall - a.compatibility.overall;
      if (sortBy === 'age') return a.age - b.age;
      return 0;
    });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#fdc34d]" />
                AI Match Recommendations
              </h1>
              <p className="text-sm text-gray-500">Personalized matches based on your preferences</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name or location..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-64 focus:ring-2 focus:ring-[#570013] focus:border-transparent"
                />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#570013]"
              >
                <option value="compatibility">Best Match</option>
                <option value="recent">Recently Active</option>
                <option value="age">Age: Low to High</option>
              </select>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-lg ${showFilters ? 'bg-[#570013] text-white' : 'border border-gray-300'}`}
              >
                <SlidersHorizontal className="w-5 h-5" />
              </button>
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-[#570013] text-white' : 'hover:bg-gray-50'}`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-[#570013] text-white' : 'hover:bg-gray-50'}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Filters</h3>
              <button onClick={() => setShowFilters(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Religion</label>
                <select
                  value={filters.religion}
                  onChange={(e) => setFilters({ ...filters, religion: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Any</option>
                  <option value="hindu">Hindu</option>
                  <option value="muslim">Muslim</option>
                  <option value="christian">Christian</option>
                  <option value="buddhist">Buddhist</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Caste</label>
                <select
                  value={filters.caste}
                  onChange={(e) => setFilters({ ...filters, caste: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Any</option>
                  <option value="brahmin">Brahmin</option>
                  <option value="maratha">Maratha</option>
                  <option value="deshmukh">Deshmukh</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Age Range</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={filters.minAge}
                    onChange={(e) => setFilters({ ...filters, minAge: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    min="18"
                    max="70"
                  />
                  <span className="text-gray-400">-</span>
                  <input
                    type="number"
                    value={filters.maxAge}
                    onChange={(e) => setFilters({ ...filters, maxAge: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    min="18"
                    max="70"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={filters.location}
                  onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                  placeholder="City or State"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          </div>
        )}

        {/* Results Count */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-gray-600">
            Showing <span className="font-medium">{filteredMatches.length}</span> matches
          </p>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">AI Accuracy:</span>
            <div className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="font-medium text-green-600">94%</span>
            </div>
          </div>
        </div>

        {/* Grid View */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMatches.map((match) => (
              <div key={match.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                {/* Photo Area */}
                <div className="relative aspect-[4/5] bg-gradient-to-br from-[#570013]/10 to-[#fdc34d]/10">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full bg-[#570013]/20 flex items-center justify-center">
                      <span className="text-4xl font-bold text-[#570013]">
                        {match.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                  </div>
                  
                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {match.isVerified && (
                      <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full font-medium flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Verified
                      </span>
                    )}
                    {match.isMutualMatch && (
                      <span className="px-2 py-1 bg-[#570013] text-white text-xs rounded-full font-medium flex items-center gap-1">
                        <Heart className="w-3 h-3" /> Mutual Match
                      </span>
                    )}
                  </div>

                  {/* Compatibility Score */}
                  <div className="absolute top-3 right-3 bg-white rounded-lg px-3 py-2 shadow-lg">
                    <div className="text-center">
                      <p className={`text-xl font-bold ${getCompatibilityColor(match.compatibility.overall)}`}>
                        {match.compatibility.overall}%
                      </p>
                      <p className="text-xs text-gray-500">Match</p>
                    </div>
                  </div>

                  {/* Premium Badge */}
                  {match.isPremium && (
                    <div className="absolute bottom-20 right-3">
                      <span className="px-2 py-1 bg-[#fdc34d] text-[#570013] text-xs rounded-full font-medium flex items-center gap-1">
                        <Star className="w-3 h-3" /> Premium
                      </span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-lg">{match.name}, {match.age}</h3>
                      <p className="text-sm text-gray-500">{match.height} • {match.caste}</p>
                    </div>
                    <div className="flex items-center gap-1 text-gray-400 text-sm">
                      <Clock className="w-4 h-4" />
                      {match.lastActive}
                    </div>
                  </div>

                  <div className="space-y-1 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      {match.location}
                    </div>
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-gray-400" />
                      {match.education}
                    </div>
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-gray-400" />
                      {match.occupation}
                    </div>
                  </div>

                  {/* Compatibility Breakdown */}
                  <div className="grid grid-cols-3 gap-2 mb-3 p-2 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <p className={`text-sm font-bold ${getCompatibilityColor(match.compatibility.personality)}`}>
                        {match.compatibility.personality}%
                      </p>
                      <p className="text-xs text-gray-500">Personality</p>
                    </div>
                    <div className="text-center">
                      <p className={`text-sm font-bold ${getCompatibilityColor(match.compatibility.values)}`}>
                        {match.compatibility.values}%
                      </p>
                      <p className="text-xs text-gray-500">Values</p>
                    </div>
                    <div className="text-center">
                      <p className={`text-sm font-bold ${getCompatibilityColor(match.compatibility.lifestyle)}`}>
                        {match.compatibility.lifestyle}%
                      </p>
                      <p className="text-xs text-gray-500">Lifestyle</p>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {match.tags.map((tag) => (
                      <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleInterest(match.id)}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-medium ${
                        match.isMutualMatch
                          ? 'bg-green-500 text-white hover:bg-green-600'
                          : 'bg-[#570013] text-white hover:bg-[#450010]'
                      }`}
                    >
                      <Heart className="w-4 h-4" />
                      {match.isMutualMatch ? 'Accepted!' : 'Interest'}
                    </button>
                    <a
                      href={`/profile/view/${match.id}`}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      View
                    </a>
                    <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* List View */}
        {viewMode === 'list' && (
          <div className="space-y-4">
            {filteredMatches.map((match) => (
              <div key={match.id} className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow">
                <div className="flex gap-4">
                  {/* Avatar */}
                  <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-[#570013]/10 to-[#fdc34d]/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl font-bold text-[#570013]">
                      {match.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">{match.name}, {match.age}</h3>
                          {match.isVerified && <CheckCircle className="w-4 h-4 text-green-500" />}
                          {match.isMutualMatch && (
                            <span className="px-2 py-0.5 bg-green-500 text-white text-xs rounded-full">Mutual Match</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{match.height} • {match.religion} • {match.caste}</p>
                      </div>
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${getCompatibilityColor(match.compatibility.overall)}`}>
                          {match.compatibility.overall}%
                        </div>
                        <p className="text-xs text-gray-500">Compatibility</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4 mt-3 text-sm">
                      <div className="flex items-center gap-1 text-gray-600">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        {match.location}
                      </div>
                      <div className="flex items-center gap-1 text-gray-600">
                        <GraduationCap className="w-4 h-4 text-gray-400" />
                        {match.education}
                      </div>
                      <div className="flex items-center gap-1 text-gray-600">
                        <Briefcase className="w-4 h-4 text-gray-400" />
                        {match.occupation}
                      </div>
                      <div className="flex items-center gap-1 text-gray-600">
                        <Clock className="w-4 h-4 text-gray-400" />
                        {match.lastActive}
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mt-2 line-clamp-1">{match.bio}</p>

                    <div className="flex items-center gap-2 mt-3">
                      {match.tags.map((tag) => (
                        <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleInterest(match.id)}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium ${
                        match.isMutualMatch
                          ? 'bg-green-500 text-white hover:bg-green-600'
                          : 'bg-[#570013] text-white hover:bg-[#450010]'
                      }`}
                    >
                      <Heart className="w-4 h-4" />
                    </button>
                    <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                      <Video className="w-4 h-4 text-gray-600" />
                    </button>
                    <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                      <MoreVertical className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {filteredMatches.length === 0 && (
          <div className="text-center py-12">
            <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No matches found</h3>
            <p className="text-gray-500">Try adjusting your filters or search criteria</p>
          </div>
        )}
      </main>

      {/* Profile Detail Modal */}
      {selectedMatch && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="relative">
              <div className="h-48 bg-gradient-to-br from-[#570013] to-[#3a000d]">
                <button
                  onClick={() => setSelectedMatch(null)}
                  className="absolute top-4 right-4 p-2 bg-white/20 rounded-full hover:bg-white/30"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
              <div className="absolute bottom-0 left-6 transform translate-y-1/2">
                <div className="w-32 h-32 rounded-xl bg-white p-2 shadow-lg">
                  <div className="w-full h-full rounded-lg bg-[#570013]/10 flex items-center justify-center">
                    <span className="text-3xl font-bold text-[#570013]">
                      {selectedMatch.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="pt-20 px-6 pb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold">{selectedMatch.name}, {selectedMatch.age}</h2>
                  <p className="text-gray-500">{selectedMatch.height} • {selectedMatch.religion} • {selectedMatch.caste}</p>
                </div>
                <div className="text-right">
                  <p className={`text-3xl font-bold ${getCompatibilityColor(selectedMatch.compatibility.overall)}`}>
                    {selectedMatch.compatibility.overall}%
                  </p>
                  <p className="text-sm text-gray-500">Overall Match</p>
                </div>
              </div>
              <p className="text-gray-600 mb-6">{selectedMatch.bio}</p>
              {/* Full details would go here */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
