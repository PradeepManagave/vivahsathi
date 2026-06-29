'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, MapPin, Briefcase, GraduationCap, CheckCircle, Star, Eye, Send } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export interface ProfileCardProps {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  location: string;
  profession?: string;
  education?: string;
  photo?: string;
  isVerified?: boolean;
  isPremium?: boolean;
  matchPercentage?: number;
  isShortlisted?: boolean;
  onShortlist?: () => void;
  onSendInterest?: () => void;
  onViewProfile?: () => void;
  className?: string;
}

export function ProfileCard({
  id,
  name,
  age,
  gender,
  location,
  profession,
  education,
  photo,
  isVerified = false,
  isPremium = false,
  matchPercentage,
  isShortlisted = false,
  onShortlist,
  onSendInterest,
  onViewProfile,
  className = ''
}: ProfileCardProps) {
  return (
    <div className={`group bg-white rounded-xl border border-stone-200 overflow-hidden hover:shadow-medium transition-all duration-300 hover:-translate-y-1 ${className}`}>
      <Link href={`/profile/${id}`} className="block">
          <div className="relative aspect-[3/4] bg-stone-100">
          {photo ? (
            <img
              src={photo}
              alt={name}
              className="w-full h-full object-cover"
            />
          ) : (
            <Avatar
              name={name}
              size="xl"
              className="w-full h-full rounded-none"
            />
          )}
          
          {matchPercentage !== undefined && (
            <div className="absolute top-3 left-3">
              <Badge variant="success" className="shadow-sm">
                <Star className="w-3 h-3 mr-1" />
                {matchPercentage}% Match
              </Badge>
            </div>
          )}

          {isPremium && (
            <div className="absolute top-3 right-3">
              <Badge variant="gold" className="shadow-sm">Premium</Badge>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute bottom-3 left-3 right-3 flex gap-2">
              {onViewProfile && (
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1 bg-white/90 hover:bg-white text-stone-900"
                  onClick={(e) => { e.preventDefault(); onViewProfile(); }}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </Button>
              )}
              {onSendInterest && (
                <Button
                  variant="primary"
                  size="sm"
                  className="flex-1"
                  onClick={(e) => { e.preventDefault(); onSendInterest(); }}
                >
                  <Send className="w-4 h-4 mr-1" />
                  Interest
                </Button>
              )}
            </div>
          </div>
        </div>
      </Link>

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <Link href={`/profile/${id}`} className="flex-1">
            <div className="flex items-center gap-1">
              <h3 className="font-semibold text-stone-900 group-hover:text-primary transition-colors truncate">
                {name}, {age}
              </h3>
              {isVerified && (
                <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
              )}
            </div>
          </Link>
          {onShortlist && (
            <button
              onClick={onShortlist}
              className={`p-1 rounded-full transition-colors ${
                isShortlisted
                  ? 'text-error hover:bg-error/5'
                  : 'text-stone-400 hover:text-error hover:bg-error/5'
              }`}
            >
              <Heart className={`w-4 h-4 ${isShortlisted ? 'fill-error' : ''}`} />
            </button>
          )}
        </div>

        <div className="space-y-1.5">
          {location && (
            <div className="flex items-center gap-1.5 text-sm text-stone-500">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{location}</span>
            </div>
          )}
          {profession && (
            <div className="flex items-center gap-1.5 text-sm text-stone-500">
              <Briefcase className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{profession}</span>
            </div>
          )}
          {education && (
            <div className="flex items-center gap-1.5 text-sm text-stone-500">
              <GraduationCap className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{education}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
