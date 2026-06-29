'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Heart, Bookmark, MessageCircle, Verified, Award,
  Cake, MapPin, User, Briefcase, Church, Accessibility,
  Users, Baby, Home, Group, Flame, Download, Lock,
  Share, Globe, Trophy, CheckCircle, ArrowLeft,
  Bell, Settings, Menu, Phone, Video, MoreVertical,
  ChevronLeft, ChevronRight, Star
} from 'lucide-react';
import { useProfile } from '@/hooks/use-profile';

export default function MemberProfileDetailPage() {
  const params = useParams();
  const profileId = params.id as string;
  const { profile: apiProfile, loading, error } = useProfile(profileId);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [isShortlisted, setIsShortlisted] = useState(false);
  const [interestSent, setInterestSent] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse space-y-4">
          <div className="h-12 w-48 bg-stone-100 rounded" />
          <div className="h-4 w-32 bg-stone-100 rounded" />
        </div>
      </div>
    );
  }

  if (error || !apiProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-stone-900 mb-2">Profile Not Found</h1>
          <p className="text-stone-600 mb-4">{error || 'This profile may have been removed or is not available.'}</p>
          <Link href="/search" className="text-primary hover:underline">
            Browse other profiles
          </Link>
        </div>
      </div>
    );
  }

  const profile = {
    id: apiProfile.id,
    name: apiProfile.name,
    age: apiProfile.age,
    height: apiProfile.height || 'Not specified',
    weight: apiProfile.weight || 'Not specified',
    location: apiProfile.city && apiProfile.state
      ? `${apiProfile.city}, ${apiProfile.state}`
      : 'Location not specified',
    profession: apiProfile.profession || 'Not specified',
    education: apiProfile.education || 'Not specified',
    college: apiProfile.educationDetail || '',
    company: apiProfile.professionDetail || '',
    religion: apiProfile.religion || 'Not specified',
    caste: apiProfile.caste || 'Not specified',
    subCaste: apiProfile.subCaste || 'Not specified',
    gothra: apiProfile.horoscope?.gothra || 'Not specified',
    motherTongue: apiProfile.motherTongue || 'Not specified',
    dietaryHabits: apiProfile.physicalStatus || 'Not specified',
    smoking: 'Not specified',
    complexion: apiProfile.complexion || 'Not specified',
    rashi: apiProfile.horoscope?.raasi || 'Not specified',
    nakshatra: apiProfile.horoscope?.star || 'Not specified',
    manglik: apiProfile.horoscope?.manglik ? 'Yes' : 'No',
    dateOfBirth: new Date(apiProfile.dateOfBirth).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }),
    timeOfBirth: 'Not available',
    father: apiProfile.family?.fatherOccupation || 'Not specified',
    mother: apiProfile.family?.motherOccupation || 'Not specified',
    siblings: apiProfile.family
      ? `${apiProfile.family.brothers || 0} Brothers, ${apiProfile.family.sisters || 0} Sisters`
      : 'Not specified',
    nativePlace: 'Not specified',
    bio: apiProfile.aboutMe || 'No bio available.',
    compatibilityScore: apiProfile.partnerPreference ? 85 : 75,
    isVerified: apiProfile.isVerified,
    hasMedallion: apiProfile.isPremium,
    photos: apiProfile.photos.map(p => p.url || '')
  };

  const handleExpressInterest = () => {
    setInterestSent(true);
  };

  const handleShortlist = () => {
    setIsShortlisted(!isShortlisted);
  };

  return (
    <div className="min-h-screen bg-surface">
      <header className="fixed top-0 w-full z-50 bg-surface/70 backdrop-blur-md border-b border-stone-200/50">
        <div className="flex justify-between items-center w-full px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Link href="/matches" className="p-2 hover:bg-stone-100 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5 text-stone-600" />
            </Link>
            <span className="text-2xl font-bold text-primary font-headline">The Heritage</span>
          </div>
          <nav className="hidden md:flex space-x-8 items-center">
            <Link href="/matches" className="text-stone-600 font-medium hover:text-primary text-sm uppercase tracking-wider transition-colors">Matches</Link>
            <Link href="/search" className="text-primary font-bold border-b-2 border-amber-400 pb-1 text-sm uppercase tracking-wider">Search</Link>
            <Link href="/inbox" className="text-stone-600 font-medium hover:text-primary text-sm uppercase tracking-wider transition-colors">Inbox</Link>
            <Link href="/premium" className="text-stone-600 font-medium hover:text-primary text-sm uppercase tracking-wider transition-colors">Premium</Link>
          </nav>
          <div className="flex items-center space-x-4">
            <button className="p-2 hover:bg-stone-100 rounded-full transition-colors relative">
              <Bell className="w-5 h-5 text-stone-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <Link href="/settings" className="p-2 hover:bg-stone-100 rounded-full transition-colors">
              <Settings className="w-5 h-5 text-stone-600" />
            </Link>
            <div className="w-10 h-10 rounded-full overflow-hidden bg-stone-200 border border-stone-300">
              <div className="w-full h-full flex items-center justify-center">
                <User className="w-5 h-5 text-stone-500" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-20 max-w-7xl mx-auto px-6 md:px-10">
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-5 relative">
            <div className="aspect-[4/5] rounded-xl overflow-hidden bg-stone-200 shadow-sm group relative">
              {profile.photos[activePhotoIndex] ? (
                <img
                  src={profile.photos[activePhotoIndex]}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/10 to-amber-200/30 flex items-center justify-center">
                  <User className="w-32 h-32 text-primary/30" />
                </div>
              )}
              {profile.photos.length > 1 && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-4 left-4 right-4 flex justify-between">
                    <button
                      className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white"
                      onClick={() => setActivePhotoIndex(Math.max(0, activePhotoIndex - 1))}
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white"
                      onClick={() => setActivePhotoIndex(Math.min(profile.photos.length - 1, activePhotoIndex + 1))}
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              <div className="absolute top-6 left-6 flex flex-col gap-3">
                {profile.isVerified && (
                  <div className="bg-[rgba(233,226,211,0.7)] backdrop-blur-xl px-4 py-2 rounded-full flex items-center gap-2 border border-white/30">
                    <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center">
                      <Verified className="w-4 h-4 text-amber-600" />
                    </div>
                    <span className="text-xs font-bold text-stone-800 tracking-wide uppercase">Verified Member</span>
                  </div>
                )}
                {profile.hasMedallion && (
                  <div className="bg-[rgba(233,226,211,0.7)] backdrop-blur-xl px-4 py-2 rounded-full flex items-center gap-2 border border-white/30">
                    <Award className="w-5 h-5 text-amber-600" />
                    <span className="text-xs font-bold text-stone-800 tracking-wide uppercase">Heritage Medallion</span>
                  </div>
                )}
              </div>
            </div>

            {profile.photos.length > 0 && (
              <div className="mt-6 flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {profile.photos.slice(0, 4).map((photo, index) => (
                  <div
                    key={index}
                    onClick={() => setActivePhotoIndex(index)}
                    className={`w-20 h-24 rounded-lg overflow-hidden border-2 flex-shrink-0 cursor-pointer transition-all ${
                      activePhotoIndex === index ? 'border-primary' : 'border-transparent hover:opacity-80'
                    }`}
                  >
                    {photo ? (
                      <img src={photo} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-stone-200 flex items-center justify-center">
                        <User className="w-8 h-8 text-stone-400" />
                      </div>
                    )}
                  </div>
                ))}
                {profile.photos.length > 4 && (
                  <div className="w-20 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-stone-100 flex items-center justify-center text-stone-500 font-medium text-xs border-2 border-transparent hover:border-stone-300 cursor-pointer">
                    +{profile.photos.length - 4} Photos
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="lg:col-span-7 flex flex-col h-full justify-between pt-4">
            <div>
              <div className="flex flex-col gap-2 mb-8">
                <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary tracking-tight">{profile.name}</h1>
                <div className="flex items-center gap-4 text-stone-600">
                  <span className="flex items-center gap-1 font-medium">
                    <Cake className="w-4 h-4" /> {profile.age} yrs
                  </span>
                  <span className="w-1 h-1 rounded-full bg-stone-300"></span>
                  <span className="flex items-center gap-1 font-medium">
                    <MapPin className="w-4 h-4" /> {profile.location}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 mb-12">
                <button
                  onClick={handleExpressInterest}
                  disabled={interestSent}
                  className={`px-8 py-4 rounded-full font-bold shadow-md transition-all flex items-center gap-3 ${
                    interestSent
                      ? 'bg-green-500 text-white'
                      : 'bg-gradient-to-br from-[#570013] to-[#800020] text-white hover:scale-[1.02] active:scale-95'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${interestSent ? 'fill-white' : ''}`} />
                  {interestSent ? 'Interest Sent' : 'Express Interest'}
                </button>
                <button
                  onClick={handleShortlist}
                  className={`px-8 py-4 rounded-full border-2 font-bold transition-colors flex items-center gap-3 ${
                    isShortlisted
                      ? 'border-primary bg-primary text-white'
                      : 'border-stone-300 text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <Bookmark className={`w-5 h-5 ${isShortlisted ? 'fill-current' : ''}`} />
                  {isShortlisted ? 'Shortlisted' : 'Shortlist'}
                </button>
                <button className="px-8 py-4 rounded-full bg-amber-100 text-amber-700 font-bold hover:opacity-90 transition-colors flex items-center gap-3">
                  <MessageCircle className="w-5 h-5" />
                  Message
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-xl bg-stone-100 border-b-2 border-amber-200/30">
                  <p className="text-[10px] font-bold text-stone-500 uppercase mb-2">Education</p>
                  <p className="font-headline text-lg font-semibold text-primary">{profile.education}</p>
                </div>
                <div className="p-6 rounded-xl bg-stone-100 border-b-2 border-amber-200/30">
                  <p className="text-[10px] font-bold text-stone-500 uppercase mb-2">Profession</p>
                  <p className="font-headline text-lg font-semibold text-primary">{profile.profession}</p>
                </div>
                <div className="p-6 rounded-xl bg-stone-100 border-b-2 border-amber-200/30">
                  <p className="text-[10px] font-bold text-stone-500 uppercase mb-2">Community</p>
                  <p className="font-headline text-lg font-semibold text-primary">{profile.religion}, {profile.caste}</p>
                </div>
              </div>
            </div>

            {profile.isVerified && (
              <div className="mt-12 p-6 bg-stone-100 rounded-xl flex items-center gap-6">
                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-sm">
                  <Verified className="w-8 h-8 text-amber-600" />
                </div>
                <div>
                  <h4 className="font-headline font-bold text-stone-900">Background Verified</h4>
                  <p className="text-sm text-stone-600">This profile has passed our high-trust validation including identity and education checks.</p>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="mt-20 grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            <article>
              <h2 className="font-headline text-2xl font-bold text-primary mb-6 flex items-center gap-3">
                <User className="w-6 h-6" /> About
              </h2>
              <div className="bg-white p-8 rounded-xl border border-stone-200 shadow-sm">
                <p className="text-lg leading-relaxed text-stone-600 whitespace-pre-line">{profile.bio}</p>
              </div>
            </article>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-8 rounded-xl bg-stone-100">
                <h3 className="font-headline text-xl font-bold text-primary mb-6 flex items-center gap-3">
                  <Church className="w-5 h-5" /> Community
                </h3>
                <dl className="space-y-4">
                  {[
                    { label: 'Religion', value: profile.religion },
                    { label: 'Caste', value: profile.caste },
                    { label: 'Sub-Caste', value: profile.subCaste },
                    { label: 'Gothra', value: profile.gothra },
                    { label: 'Mother Tongue', value: profile.motherTongue }
                  ].map((item) => (
                    <div key={item.label} className="flex justify-between items-center">
                      <dt className="text-xs uppercase font-bold text-stone-500">{item.label}</dt>
                      <dd className="font-semibold text-stone-900">{item.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="p-8 rounded-xl bg-stone-50">
                <h3 className="font-headline text-xl font-bold text-primary mb-6 flex items-center gap-3">
                  <Accessibility className="w-5 h-5" /> Physical & Lifestyle
                </h3>
                <dl className="space-y-4">
                  {[
                    { label: 'Height', value: profile.height },
                    { label: 'Weight', value: profile.weight },
                    { label: 'Dietary Habits', value: profile.dietaryHabits },
                    { label: 'Complexion', value: profile.complexion }
                  ].map((item) => (
                    <div key={item.label} className="flex justify-between items-center">
                      <dt className="text-xs uppercase font-bold text-stone-500">{item.label}</dt>
                      <dd className="font-semibold text-stone-900">{item.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>

            <div className="p-8 rounded-xl bg-white border border-stone-200 shadow-sm">
              <h3 className="font-headline text-xl font-bold text-primary mb-8 flex items-center gap-3">
                <Briefcase className="w-5 h-5" /> Education & Career
              </h3>
              <div className="flex flex-col md:flex-row gap-10">
                <div className="flex-1">
                  <p className="text-xs uppercase font-bold text-stone-500 mb-4">Highest Qualification</p>
                  <p className="text-lg font-bold text-stone-900">{profile.education}</p>
                  {profile.college && <p className="text-stone-600">{profile.college}</p>}
                </div>
                <div className="flex-1 md:border-l md:pl-10 border-stone-200/30">
                  <p className="text-xs uppercase font-bold text-stone-500 mb-4">Current Employment</p>
                  <p className="text-lg font-bold text-stone-900">{profile.profession}</p>
                  {profile.company && <p className="text-stone-600">{profile.company}</p>}
                </div>
              </div>
            </div>

            <div className="p-8 rounded-xl bg-stone-100">
              <h3 className="font-headline text-xl font-bold text-primary mb-8 flex items-center gap-3">
                <Users className="w-5 h-5" /> Family Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex gap-4 items-start">
                    <Baby className="w-5 h-5 text-amber-600 mt-1" />
                    <div>
                      <p className="text-xs uppercase font-bold text-stone-500">Father</p>
                      <p className="font-bold text-stone-900">{profile.father}</p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-start">
                    <Home className="w-5 h-5 text-amber-600 mt-1" />
                    <div>
                      <p className="text-xs uppercase font-bold text-stone-500">Mother</p>
                      <p className="font-bold text-stone-900">{profile.mother}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex gap-4 items-start">
                    <Group className="w-5 h-5 text-amber-600 mt-1" />
                    <div>
                      <p className="text-xs uppercase font-bold text-stone-500">Siblings</p>
                      <p className="font-bold text-stone-900">{profile.siblings}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <aside className="space-y-8">
            <div className="bg-stone-100 p-8 rounded-xl border-t-4 border-amber-400">
              <h3 className="font-headline text-xl font-bold text-primary mb-6 flex items-center gap-3">
                <Flame className="w-5 h-5" /> Horoscope
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-stone-600">Rashi</span>
                  <span className="font-bold">{profile.rashi}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-600">Nakshatra</span>
                  <span className="font-bold">{profile.nakshatra}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-600">Manglik Status</span>
                  <span className="font-bold text-amber-600">{profile.manglik}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-600">Date of Birth</span>
                  <span className="font-bold">{profile.dateOfBirth}</span>
                </div>
              </div>
              <button className="w-full mt-6 py-3 px-4 border border-stone-300 text-primary font-bold rounded-lg hover:bg-white transition-colors flex items-center justify-center gap-2">
                <Download className="w-4 h-4" />
                Full Kundli PDF
              </button>
            </div>

            <div className="relative overflow-hidden p-8 rounded-xl bg-gradient-to-br from-[#570013] to-[#800020] text-white">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
              <h3 className="font-headline text-xl font-bold mb-6 flex items-center gap-3">
                <Share className="w-5 h-5 text-amber-300" /> Connect on Social
              </h3>
              <div className="flex gap-6 mb-8 blur-[3px] opacity-40 select-none">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <Trophy className="w-5 h-5" />
                </div>
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <Share className="w-5 h-5" />
                </div>
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <Globe className="w-5 h-5" />
                </div>
              </div>
              <div className="relative z-10 bg-white/10 backdrop-blur-md p-6 rounded-lg border border-white/20">
                <Lock className="w-5 h-5 text-amber-300 mb-2" />
                <p className="font-bold text-lg mb-2">Exclusive Content</p>
                <p className="text-xs mb-6 opacity-90 leading-relaxed">Social links are visible to Paid Members only. Upgrade to Royal Elite to view verified social profiles.</p>
                <button className="w-full py-3 bg-amber-400 text-stone-900 font-bold rounded-full hover:brightness-110 transition-all uppercase tracking-wider text-xs">
                  Upgrade to Royal Elite
                </button>
              </div>
            </div>

            <div className="p-8 rounded-xl border border-stone-200 bg-white">
              <h3 className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-4 text-center">Compatibility Score</h3>
              <div className="flex justify-center mb-6">
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle className="text-stone-100" cx="64" cy="64" fill="transparent" r="58" stroke="currentColor" strokeWidth="8"></circle>
                    <circle
                      className="text-amber-400"
                      cx="64"
                      cy="64"
                      fill="transparent"
                      r="58"
                      stroke="currentColor"
                      strokeDasharray="364.4"
                      strokeDashoffset={364.4 * (1 - profile.compatibilityScore / 100)}
                      strokeWidth="8"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-3xl font-bold text-primary">{profile.compatibilityScore}%</span>
                    <span className="text-[10px] text-stone-500 uppercase">Match</span>
                  </div>
                </div>
              </div>
              <p className="text-center text-sm text-stone-600 mb-6 italic">"Highly compatible based on education, community, and lifestyle preferences."</p>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Profession Match</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Caste Compatibility</span>
                </div>
              </div>
            </div>
          </aside>
        </section>
      </main>

      <footer className="bg-stone-100 w-full py-12 px-10 border-t border-stone-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:flex lg:justify-between items-start w-full max-w-7xl mx-auto gap-10">
          <div className="flex flex-col gap-4">
            <div className="text-lg font-bold text-primary font-headline uppercase tracking-tight">The Heritage</div>
            <p className="text-stone-600 text-sm max-w-xs leading-relaxed">Curating timeless matches through a blend of heritage values and modern elegance. Join our premium community of life partners.</p>
          </div>
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-12 gap-y-4">
              <Link href="/privacy" className="text-stone-600 hover:text-primary text-sm transition-opacity">Privacy Policy</Link>
              <Link href="/terms" className="text-stone-600 hover:text-primary text-sm transition-opacity">Terms of Service</Link>
              <Link href="/safety" className="text-stone-600 hover:text-primary text-sm transition-opacity">Safety Tips</Link>
              <Link href="/success-stories" className="text-stone-600 hover:text-primary text-sm transition-opacity">Success Stories</Link>
              <Link href="/contact" className="text-primary font-bold underline text-sm">Contact Us</Link>
            </div>
          </div>
          <div className="text-stone-600 text-sm mt-auto lg:mt-0">
            © 2024 The Heritage. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
