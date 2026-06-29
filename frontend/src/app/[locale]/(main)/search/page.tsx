'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Filter, X, Heart, MapPin, Briefcase, GraduationCap, Star, ChevronDown } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Pagination } from '@/components/ui/pagination';
import { SkeletonCard } from '@/components/ui/skeleton';
import { searchService, SearchFilters } from '@/lib/api/services/search.service';
import { Profile } from '@/types';
import { toast } from 'sonner';

interface ProfileResult extends Profile {
  compatibilityScore?: number;
}

export default function SearchPage() {
  const router = useRouter();
  const [results, setResults] = useState<ProfileResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    gender: '',
    ageMin: 18,
    ageMax: 35,
    religion: '',
    caste: '',
    motherTongue: '',
    education: '',
    occupation: '',
    incomeMin: 0,
    incomeMax: 0,
    maritalStatus: '',
    diet: '',
    city: '',
    state: '',
    sortBy: 'recent',
    page: 1,
    limit: 20,
  });

  useEffect(() => {
    handleSearch();
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const result = await searchService.searchProfiles({ ...filters, page });
      setResults(result.data || []);
      setTotalPages(result.meta?.totalPages || 1);
    } catch {
      toast.error('Failed to search profiles');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      gender: '',
      ageMin: 18,
      ageMax: 35,
      religion: '',
      caste: '',
      motherTongue: '',
      education: '',
      occupation: '',
      incomeMin: 0,
      incomeMax: 0,
      maritalStatus: '',
      diet: '',
      city: '',
      state: '',
      sortBy: 'recent',
      page: 1,
      limit: 20,
    });
  };

  const activeFilterCount = Object.values(filters).filter(
    (v) => v !== '' && v !== 0 && v !== 'recent' && v !== 18 && v !== 35 && v !== 20
  ).length;

  return (
    <div className="min-h-screen bg-surface">
      <Header variant="member" />

      {/* Search Bar */}
      <div className="bg-white border-b border-surface-200 py-4">
        <div className="container-page">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
              <Input
                placeholder="Search by name, religion, caste, occupation..."
                className="pl-10"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button
              variant={showFilters ? 'primary' : 'outline'}
              leftIcon={<Filter className="w-4 h-4" />}
              rightIcon={
                activeFilterCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 text-xs bg-white/20 rounded-full">
                    {activeFilterCount}
                  </span>
                )
              }
              onClick={() => setShowFilters(!showFilters)}
            >
              Filters
            </Button>
            <Button variant="primary" onClick={handleSearch} loading={loading}>
              Search
            </Button>
          </div>
        </div>
      </div>

      <div className="container-page py-6">
        <div className="flex gap-6">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="w-72 flex-shrink-0">
              <Card className="sticky top-24 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-stone-900">Filters</h3>
                  <button onClick={clearFilters} className="text-sm text-primary hover:underline">
                    Clear All
                  </button>
                </div>

                <div className="space-y-4">
                  <NativeSelect
                    label="Gender"
                    options={[
                      { value: '', label: 'Any' },
                      { value: 'male', label: 'Male' },
                      { value: 'female', label: 'Female' },
                    ]}
                    value={filters.gender || ''}
                    onChange={(e) => handleFilterChange('gender', e.target.value)}
                  />

                  <div>
                    <label className="label">Age Range</label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        value={filters.ageMin?.toString() || '18'}
                        onChange={(e) => handleFilterChange('ageMin', Number(e.target.value))}
                        className="text-sm"
                      />
                      <span className="text-stone-400 self-center">to</span>
                      <Input
                        type="number"
                        value={filters.ageMax?.toString() || '35'}
                        onChange={(e) => handleFilterChange('ageMax', Number(e.target.value))}
                        className="text-sm"
                      />
                    </div>
                  </div>

                  <NativeSelect
                    label="Religion"
                    options={[
                      { value: '', label: 'Any' },
                      { value: 'Hindu', label: 'Hindu' },
                      { value: 'Muslim', label: 'Muslim' },
                      { value: 'Christian', label: 'Christian' },
                      { value: 'Sikh', label: 'Sikh' },
                    ]}
                    value={filters.religion || ''}
                    onChange={(e) => handleFilterChange('religion', e.target.value)}
                  />

                  <NativeSelect
                    label="Marital Status"
                    options={[
                      { value: '', label: 'Any' },
                      { value: 'Never Married', label: 'Never Married' },
                      { value: 'Divorced', label: 'Divorced' },
                      { value: 'Widowed', label: 'Widowed' },
                    ]}
                    value={filters.maritalStatus || ''}
                    onChange={(e) => handleFilterChange('maritalStatus', e.target.value)}
                  />

                  <NativeSelect
                    label="Diet"
                    options={[
                      { value: '', label: 'Any' },
                      { value: 'Vegetarian', label: 'Vegetarian' },
                      { value: 'Non-Vegetarian', label: 'Non-Vegetarian' },
                    ]}
                    value={filters.diet || ''}
                    onChange={(e) => handleFilterChange('diet', e.target.value)}
                  />

                  <NativeSelect
                    label="Sort By"
                    options={[
                      { value: 'recent', label: 'Recently Joined' },
                      { value: 'compatibility', label: 'Compatibility' },
                      { value: 'age', label: 'Age' },
                    ]}
                    value={filters.sortBy || 'recent'}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  />
                </div>
              </Card>
            </div>
          )}

          {/* Results */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-stone-500">
                {results.length} profiles found
              </p>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonCard key={i} showAvatar showImage />
                ))}
              </div>
            ) : results.length === 0 ? (
              <Card className="text-center py-12">
                <Search className="w-12 h-12 text-stone-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-stone-900 mb-2">No profiles found</h3>
                <p className="text-stone-500 mb-4">Try adjusting your search filters</p>
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </Card>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {results.map((profile) => (
                    <ProfileCard key={profile.id} profile={profile} />
                  ))}
                </div>
                <div className="mt-8">
                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={(p) => {
                      setPage(p);
                      setFilters((prev) => ({ ...prev, page: p }));
                      handleSearch();
                    }}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface ProfileCardProps {
  profile: ProfileResult;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ profile }) => {
  const router = useRouter();

  return (
    <Card
      variant="hover"
      className="cursor-pointer"
      onClick={() => router.push(`/profile/${profile.id}`)}
    >
      <div className="flex gap-4">
        <div className="relative">
          <Avatar
            src={undefined}
            name={`${profile.firstName} ${profile.lastName}`}
            size="lg"
          />
          {profile.isOnline && (
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-stone-900">
                {profile.firstName}, {profile.age || 'N/A'}
              </h3>
              <div className="flex items-center gap-1 text-sm text-stone-500 mt-1">
                <MapPin className="w-3.5 h-3.5" />
                {profile.workLocation || 'Location not specified'}
              </div>
            </div>
            {profile.isVerified && (
              <Badge variant="gold" className="flex-shrink-0">
                Verified
              </Badge>
            )}
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {profile.highestEducation && (
              <span className="inline-flex items-center gap-1 text-xs text-stone-600 bg-surface-100 px-2 py-1 rounded">
                <GraduationCap className="w-3 h-3" />
                {profile.highestEducation}
              </span>
            )}
            {profile.occupation && (
              <span className="inline-flex items-center gap-1 text-xs text-stone-600 bg-surface-100 px-2 py-1 rounded">
                <Briefcase className="w-3 h-3" />
                {profile.occupation}
              </span>
            )}
          </div>
          {profile.compatibilityScore && (
            <div className="flex items-center gap-1 mt-2">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span className="text-sm font-medium text-stone-700">
                {profile.compatibilityScore}% Match
              </span>
            </div>
          )}
        </div>
        <button
          className="flex-shrink-0 p-2 text-stone-400 hover:text-primary transition-colors"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <Heart className="w-5 h-5" />
        </button>
      </div>
    </Card>
  );
};




