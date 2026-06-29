'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Heart, MessageCircle, User, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/search', label: 'Search', icon: Search },
  { href: '/matches', label: 'Matches', icon: Heart },
  { href: '/inbox', label: 'Inbox', icon: MessageCircle },
  { href: '/profile/edit', label: 'Profile', icon: User },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 md:hidden safe-area-bottom">
      <div className="flex items-center justify-around h-16">
        {navItems.map(item => {
          const isActive = (pathname ?? '').startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center px-3 py-1 min-w-[64px] transition-colors',
                isActive ? 'text-primary' : 'text-gray-400 hover:text-gray-600'
              )}
            >
              <item.icon className={cn('w-5 h-5', isActive && 'fill-current')} />
              <span className="text-[10px] font-medium mt-0.5">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
