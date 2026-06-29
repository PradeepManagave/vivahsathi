'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Heart, X, MessageCircle, Calendar, Star, CheckCircle, ChevronRight } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export interface MatchCardProps {
  id: string;
  name: string;
  age: number;
  location: string;
  photo?: string;
  isVerified?: boolean;
  matchPercentage: number;
  compatibilityScore?: number;
  reason?: string;
  shortlisted?: boolean;
  interestSent?: boolean;
  interestReceived?: boolean;
  onAccept?: () => void;
  onDecline?: () => void;
  onSendMessage?: () => void;
  onScheduleCall?: () => void;
  className?: string;
}

export function MatchCard({
  id,
  name,
  age,
  location,
  photo,
  isVerified = false,
  matchPercentage,
  compatibilityScore,
  reason,
  shortlisted = false,
  interestSent = false,
  interestReceived = false,
  onAccept,
  onDecline,
  onSendMessage,
  onScheduleCall,
  className = ''
}: MatchCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getMatchColor = (percentage: number) => {
    if (percentage >= 80) return 'text-success';
    if (percentage >= 60) return 'text-warning';
    return 'text-stone-500';
  };

  const getMatchBg = (percentage: number) => {
    if (percentage >= 80) return 'bg-success/10 border-success/20';
    if (percentage >= 60) return 'bg-warning/10 border-warning/20';
    return 'bg-stone-100 border-stone-200';
  };

  return (
    <div className={`bg-white rounded-xl border border-stone-200 overflow-hidden hover:shadow-medium transition-all duration-300 ${className}`}>
      <div className="p-5">
        <div className="flex gap-4">
          <Link href={`/profile/${id}`} className="flex-shrink-0">
            <Avatar
              name={name}
              size="lg"
              src={photo}
              className="w-20 h-20"
            />
          </Link>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <Link href={`/profile/${id}`} className="inline-flex items-center gap-1 hover:text-primary transition-colors">
                  <h3 className="font-semibold text-stone-900 text-lg">
                    {name}, {age}
                  </h3>
                  {isVerified && (
                    <CheckCircle className="w-4 h-4 text-success" />
                  )}
                </Link>
                <p className="text-sm text-stone-500 mt-0.5">{location}</p>
              </div>

              <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full border ${getMatchBg(matchPercentage)}`}>
                <Star className={`w-4 h-4 ${getMatchColor(matchPercentage)}`} />
                <span className={`font-bold text-sm ${getMatchColor(matchPercentage)}`}>
                  {matchPercentage}%
                </span>
              </div>
            </div>

            {reason && (
              <p className="text-sm text-stone-600 mt-2 line-clamp-2">{reason}</p>
            )}

            {interestReceived && !interestSent && (
              <div className="mt-3 flex items-center gap-2">
                <Badge variant="primary">Interest Received</Badge>
              </div>
            )}

            {interestSent && !interestReceived && (
              <div className="mt-3 flex items-center gap-2">
                <Badge variant="outline">Interest Sent</Badge>
              </div>
            )}
          </div>
        </div>

        {isExpanded && compatibilityScore !== undefined && (
          <div className="mt-4 pt-4 border-t border-stone-100">
            <h4 className="text-sm font-medium text-stone-700 mb-3">Compatibility Breakdown</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-stone-500">Lifestyle</span>
                <div className="flex-1 mx-3 bg-stone-100 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${compatibilityScore}%` }}
                  />
                </div>
                <span className="font-medium text-stone-700">{compatibilityScore}%</span>
              </div>
            </div>
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-stone-100 flex items-center justify-between">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-sm text-stone-500 hover:text-primary transition-colors"
          >
            <ChevronRight className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
            {isExpanded ? 'Less' : 'More'} details
          </button>

          <div className="flex items-center gap-2">
            {interestReceived && !interestSent && onDecline && onAccept && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onDecline}
                  className="text-error hover:bg-error/5"
                >
                  <X className="w-4 h-4 mr-1" />
                  Decline
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={onAccept}
                >
                  <Heart className="w-4 h-4 mr-1" />
                  Accept
                </Button>
              </>
            )}

            {!interestReceived && (
              <>
                {!shortlisted && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-stone-600"
                  >
                    <Heart className="w-4 h-4 mr-1" />
                    Shortlist
                  </Button>
                )}
                {onSendMessage && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onSendMessage}
                    className="text-primary"
                  >
                    <MessageCircle className="w-4 h-4 mr-1" />
                    Message
                  </Button>
                )}
                {onScheduleCall && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onScheduleCall}
                  >
                    <Calendar className="w-4 h-4 mr-1" />
                    Call
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
