'use client';

import React from 'react';
import Link from 'next/link';
import { Bell, Settings, Search, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useNotificationStore } from '@/store/notification-store';

interface TopBarProps {
  title?: string;
  showSearch?: boolean;
  onMenuClick?: () => void;
  className?: string;
}

export function TopBar({ title, showSearch = true, onMenuClick, className }: TopBarProps) {
  const unreadCount = useNotificationStore(s => s.unreadCount);

  return (
    <header className={cn('sticky top-0 z-40 bg-white border-b border-gray-200', className)}>
      <div className="flex items-center justify-between h-16 px-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          {onMenuClick && (
            <button onClick={onMenuClick} className="p-2 -ml-2 hover:bg-gray-100 rounded-lg lg:hidden">
              <Menu className="w-5 h-5" />
            </button>
          )}
          <h1 className="text-lg font-semibold text-gray-900">{title || 'Dashboard'}</h1>
        </div>

        <div className="flex items-center gap-2">
          {showSearch && (
            <Link href="/search" className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600">
              <Search className="w-5 h-5" />
            </Link>
          )}
          <Link href="/notifications" className="relative p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600">
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>
          <Link href="/settings" className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600">
            <Settings className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
