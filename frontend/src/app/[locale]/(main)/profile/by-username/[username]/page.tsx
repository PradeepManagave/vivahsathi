'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Heart, Bookmark, MessageCircle, Verified, MapPin, Briefcase, Loader2, ArrowLeft, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import Link from 'next/link';
import { apiClient } from '@/lib/api/client';
import { ProfileHeader } from '@/components/profile/profile-header';
import { HoroscopeCard } from '@/components/profile/horoscope-card';
import { FamilyInfo } from '@/components/profile/family-info';
import { PartnerPreferences } from '@/components/profile/partner-preferences';
import { CompatibilityScore } from '@/components/profile/compatibility-score';
import { Button } from '@/components/ui/button';

interface PublicProfile {
  id: string; firstName: string; lastName: string; username?: string;
  age: number; photo?: string; photos?: string[];
  profession?: string; education?: string; location?: string;
  religion?: string; caste?: string; maritalStatus?: string;
  about?: string; isVerified?: boolean; isPremium?: boolean;
  rashi?: string; nakshatra?: string; gotra?: string;
  fatherName?: string; motherName?: string; familyType?: string; familyValues?: string;
  partnerAgeRange?: string; partnerEducation?: string[]; partnerLocation?: string[];
  matchScore?: number;
}

export default function ProfileByUsernamePage() {
  const params = useParams();
  const username = params.username as string;
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get<PublicProfile>(`/profiles/by-username/${username}`);
        if (res.success && res.data) setProfile(res.data);
        else setError('Profile not found');
      } catch { setError('Profile not found'); }
      finally { setLoading(false); }
    };
    fetch();
  }, [username]);

  if (loading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>;
  if (error) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center"><h1 className="text-2xl font-bold mb-2">Profile Not Found</h1><p className="text-gray-500 mb-4">{error}</p><Link href="/search" className="text-primary hover:underline">Back to Search</Link></div>
    </div>
  );
  if (!profile) return null;

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <Link href="/search" className="flex items-center gap-2 text-gray-500 hover:text-primary text-sm"><ArrowLeft className="w-4 h-4" />Back to Search</Link>

        <ProfileHeader name={`${profile.firstName} ${profile.lastName}`} age={profile.age} location={profile.location || ''} profession={profile.profession} photo={profile.photo} isVerified={profile.isVerified} />

        <div className="grid md:grid-cols-2 gap-6">
          {profile.matchScore !== undefined && <CompatibilityScore score={profile.matchScore} />}
          {(profile.rashi || profile.nakshatra) && <HoroscopeCard rashi={profile.rashi} nakshatra={profile.nakshatra} gotra={profile.gotra} />}
        </div>

        {(profile.fatherName || profile.motherName) && <FamilyInfo fatherName={profile.fatherName} motherName={profile.motherName} familyType={profile.familyType} familyValues={profile.familyValues} />}

        {(profile.partnerAgeRange || profile.partnerEducation) && <PartnerPreferences ageRange={profile.partnerAgeRange ? (() => { const [f, t] = profile.partnerAgeRange!.split('-').map(Number); return { from: f, to: t }; })() : undefined} education={profile.partnerEducation} location={profile.partnerLocation} />}

        <div className="flex gap-3 justify-center pt-4 pb-8">
          <Button><Heart className="w-4 h-4 mr-2" />Send Interest</Button>
          <Button variant="outline"><MessageCircle className="w-4 h-4 mr-2" />Message</Button>
          <Button variant="outline"><Bookmark className="w-4 h-4" /></Button>
        </div>
      </div>
    </div>
  );
}
