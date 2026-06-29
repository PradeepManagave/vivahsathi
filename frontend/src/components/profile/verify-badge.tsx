'use client';

import { ShieldCheck, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VerifyBadgeProps {
  status: 'verified' | 'pending' | 'unverified';
  type?: 'photo' | 'phone' | 'email' | 'document' | 'profile';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = { sm: 'text-xs px-1.5 py-0.5 gap-1', md: 'text-sm px-2 py-1 gap-1.5', lg: 'text-base px-3 py-1.5 gap-2' };
const iconSizes = { sm: 12, md: 14, lg: 18 };

const statusConfig = {
  verified: { icon: ShieldCheck, class: 'bg-green-100 text-green-700 border-green-300' },
  pending: { icon: ShieldAlert, class: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
  unverified: { icon: ShieldAlert, class: 'bg-gray-100 text-gray-500 border-gray-300' },
};

export function VerifyBadge({ status, type, size = 'sm', className }: VerifyBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;
  return (
    <span className={cn('inline-flex items-center border rounded-full font-medium', sizeClasses[size], config.class, className)}>
      <Icon size={iconSizes[size]} />
      {status === 'verified' ? 'Verified' : status === 'pending' ? 'Pending' : 'Unverified'}
      {type && <span className="opacity-75 ml-0.5">{type}</span>}
    </span>
  );
}
