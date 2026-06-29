'use client';

import { cn } from '@/lib/utils';

export interface ProgressBarProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'success' | 'warning' | 'danger';
  showLabel?: boolean;
  label?: string;
  className?: string;
}

const sizeClasses = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' };
const variantClasses = {
  primary: 'bg-primary',
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
  danger: 'bg-red-500',
};

export function ProgressBar({ value, max = 100, size = 'md', variant = 'primary', showLabel = false, label, className }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className={cn('space-y-1', className)}>
      {(showLabel || label) && (
        <div className="flex justify-between text-sm">
          {label && <span className="text-gray-600">{label}</span>}
          {showLabel && <span className="text-gray-500 font-medium">{Math.round(pct)}%</span>}
        </div>
      )}
      <div className={cn('w-full bg-gray-200 rounded-full overflow-hidden', sizeClasses[size])}>
        <div
          className={cn('h-full rounded-full transition-all duration-500', variantClasses[variant])}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

