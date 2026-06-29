'use client';

import { Percent } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CompatibilityScoreProps {
  score: number;
  details?: { label: string; score: number }[];
  className?: string;
}

function getColor(score: number) {
  if (score >= 80) return 'text-green-600 border-green-500 bg-green-50';
  if (score >= 60) return 'text-yellow-600 border-yellow-500 bg-yellow-50';
  return 'text-red-600 border-red-500 bg-red-50';
}

function getBarColor(score: number) {
  if (score >= 80) return 'bg-green-500';
  if (score >= 60) return 'bg-yellow-500';
  return 'bg-red-500';
}

export function CompatibilityScore({ score, details, className }: CompatibilityScoreProps) {
  return (
    <div className={cn('p-5 rounded-xl border-2', getColor(score), className)}>
      <div className="flex items-center gap-2 mb-3">
        <Percent className="w-5 h-5" />
        <h3 className="font-semibold">Compatibility Score</h3>
      </div>
      <div className="text-center mb-4">
        <span className="text-4xl font-bold">{score}%</span>
        <p className="text-sm mt-1 opacity-80">{score >= 80 ? 'Excellent Match' : score >= 60 ? 'Good Match' : 'Average Match'}</p>
      </div>
      {details && details.length > 0 && (
        <div className="space-y-2">
          {details.map((d, i) => (
            <div key={i}>
              <div className="flex justify-between text-sm mb-1">
                <span>{d.label}</span><span>{d.score}%</span>
              </div>
              <div className="h-1.5 bg-white/50 rounded-full overflow-hidden">
                <div className={cn('h-full rounded-full', getBarColor(d.score))} style={{ width: `${d.score}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
