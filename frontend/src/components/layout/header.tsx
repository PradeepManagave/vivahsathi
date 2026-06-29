'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  X,
  Bell,
  MessageSquare,
  Search,
  User,
  ChevronDown,
  LogOut,
  Settings,
  Crown,
  LayoutDashboard,
  Heart,
  Users,
  Video,
  Calendar,
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const memberNavItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/matches', label: 'Matches', icon: Heart },
  { href: '/search', label: 'Search', icon: Search },
  { href: '/inbox', label: 'Inbox', icon: MessageSquare },
  { href: '/video-chat', label: 'Video Chat', icon: Video },
  { href: '/membership', label: 'Membership', icon: Crown },
];

const adminNavItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/members', label: 'Members', icon: Users },
  { href: '/admin/franchises', label: 'Franchises', icon: Users },
  { href: '/admin/reports', label: 'Reports', icon: Calendar },
];

const centreNavItems = [
  { href: '/centre', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/centre/members', label: 'Members', icon: Users },
  { href: '/centre/appointments', label: 'Appointments', icon: Calendar },
  { href: '/centre/approvals', label: 'Approvals', icon: Heart },
];

interface HeaderProps {
  variant?: 'public' | 'member' | 'admin' | 'centre';
}

const Header: React.FC<HeaderProps> = ({ variant = 'public' }) => {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const navItems =
    variant === 'admin'
      ? adminNavItems
      : variant === 'centre'
      ? centreNavItems
      : memberNavItems;

  const isActive = (href: string) => pathname?.includes(href);

  return (
    <header className="sticky top-0 z-sticky bg-white border-b border-surface-200 shadow-sm">
      <div className="container-page">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">M+</span>
            </div>
            <span className="font-headline font-bold text-xl text-primary hidden sm:block">
              M-Plus
            </span>
          </Link>

          {/* Desktop Navigation */}
          {variant !== 'public' && (
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive(item.href)
                        ? 'bg-primary-50 text-primary'
                        : 'text-stone-600 hover:bg-surface-100 hover:text-stone-900'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {variant !== 'public' && (
              <>
                {/* Notifications */}
                <button className="relative p-2 text-stone-500 hover:bg-surface-100 rounded-full transition-colors">
                  <Bell className="w-5 h-5" />
                  <Badge
                    variant="error"
                    className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 text-[10px] flex items-center justify-center"
                  >
                    3
                  </Badge>
                </button>

                {/* Messages */}
                <button className="relative p-2 text-stone-500 hover:bg-surface-100 rounded-full transition-colors">
                  <MessageSquare className="w-5 h-5" />
                  <Badge
                    variant="primary"
                    className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 text-[10px] flex items-center justify-center"
                  >
                    5
                  </Badge>
                </button>
              </>
            )}

            {/* User Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1 rounded-full hover:bg-surface-100 transition-colors"
                >
                  <Avatar
                    src={undefined}
                    name={user.profile?.firstName || user.email}
                    size="sm"
                  />
                  <ChevronDown className="w-4 h-4 text-stone-500 hidden sm:block" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-surface-200 py-2 animate-fade-in">
                    <div className="px-4 py-3 border-b border-surface-200">
                      <p className="font-semibold text-stone-900">
                        {user.profile?.firstName} {user.profile?.lastName}
                      </p>
                      <p className="text-sm text-stone-500">{user.email}</p>
                      <Badge variant="gold" className="mt-2">
                        {user.role.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="py-1">
                      <Link
                        href="/profile/edit"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-stone-700 hover:bg-surface-100"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <User className="w-4 h-4" />
                        My Profile
                      </Link>
                      <Link
                        href="/settings"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-stone-700 hover:bg-surface-100"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Settings className="w-4 h-4" />
                        Settings
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          setUserMenuOpen(false);
                        }}
                        className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="primary" size="sm">
                    Register Free
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            {variant !== 'public' && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-stone-500 hover:bg-surface-100 rounded-full"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && variant !== 'public' && (
          <nav className="lg:hidden py-4 border-t border-surface-200">
            <div className="flex flex-col gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive(item.href)
                        ? 'bg-primary-50 text-primary'
                        : 'text-stone-600 hover:bg-surface-100'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export { Header };
