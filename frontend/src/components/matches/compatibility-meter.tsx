'use client';

import { cn } from '@/lib/utils';

interface CompatibilityMeterProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const sizeConfig = {
  sm: { dimension: 80, strokeWidth: 6, fontSize: 'text-lg', labelSize: 'text-[10px]' },
  md: { dimension: 120, strokeWidth: 8, fontSize: 'text-2xl', labelSize: 'text-xs' },
  lg: { dimension: 160, strokeWidth: 10, fontSize: 'text-3xl', labelSize: 'text-sm' },
};

function getScoreColor(score: number) {
  if (score > 70) return { stroke: '#22c55e', text: 'text-green-600' };
  if (score >= 40) return { stroke: '#eab308', text: 'text-yellow-600' };
  return { stroke: '#ef4444', text: 'text-red-600' };
}

function getScoreLabel(score: number) {
  if (score > 70) return 'Great Match';
  if (score >= 40) return 'Good Match';
  return 'Low Match';
}

export function CompatibilityMeter({ score, size = 'md', showLabel = true }: CompatibilityMeterProps) {
  const { dimension, strokeWidth, fontSize, labelSize } = sizeConfig[size];
  const radius = (dimension - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(Math.max(score, 0), 100) / 100) * circumference;
  const color = getScoreColor(score);
  const center = dimension / 2;

  return (
    <div className="flex flex-col items-center gap-1.5">
      <svg width={dimension} height={dimension} className="transform -rotate-90">
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color.stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div
        className="absolute flex flex-col items-center justify-center"
        style={{ width: dimension, height: dimension }}
      >
        <span className={cn('font-bold', fontSize, color.text)}>
          {Math.min(Math.max(score, 0), 100)}%
        </span>
      </div>
      {showLabel && (
        <span className={cn('font-medium text-stone-500', labelSize)}>
          {getScoreLabel(score)}
        </span>
      )}
    </div>
  );
}
