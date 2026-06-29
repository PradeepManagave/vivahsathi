'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Heart,
  BarChart3,
  Settings,
  FileText,
  Shield,
  MapPin,
  Image,
  MessageSquare,
  Video,
  CreditCard,
  ChevronRight,
  LogOut,
} from 'lucide-react';

interface SidebarItem {
  href: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
  children?: SidebarItem[];
}

interface SidebarProps {
  variant?: 'admin' | 'centre';
  className?: string;
}

const adminSidebarItems: SidebarItem[] = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  {
    href: '/admin/members',
    label: 'Members',
    icon: Users,
    children: [
      { href: '/admin/members', label: 'All Members', icon: Users },
      { href: '/admin/members/pending', label: 'Pending Approval', icon: Shield },
      { href: '/admin/members/banned', label: 'Banned Members', icon: Shield },
    ],
  },
  { href: '/admin/franchises', label: 'Franchises', icon: MapPin },
  { href: '/admin/approvals', label: 'Photo Approvals', icon: Image, badge: 12 },
  { href: '/admin/reports', label: 'Reports', icon: BarChart3 },
  { href: '/admin/geo', label: 'Geo Data', icon: MapPin },
  { href: '/admin/cms/banners', label: 'Banners', icon: Image },
  { href: '/admin/cms/pages', label: 'CMS Pages', icon: FileText },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

const centreSidebarItems: SidebarItem[] = [
  { href: '/centre', label: 'Dashboard', icon: LayoutDashboard },
  {
    href: '/centre/members',
    label: 'Members',
    icon: Users,
    children: [
      { href: '/centre/members', label: 'All Members', icon: Users },
      { href: '/centre/members/register', label: 'Walk-in Registration', icon: Users },
    ],
  },
  { href: '/centre/appointments', label: 'Appointments', icon: Calendar, badge: 5 },
  { href: '/centre/approvals', label: 'Approvals', icon: Shield },
  { href: '/centre/staff', label: 'Staff', icon: Users },
  { href: '/centre/kyc/live', label: 'Live KYC', icon: Video },
  { href: '/centre/reports', label: 'Reports', icon: BarChart3 },
];

const Sidebar: React.FC<SidebarProps> = ({ variant = 'admin', className = '' }) => {
  const pathname = usePathname();
  const items = variant === 'centre' ? centreSidebarItems : adminSidebarItems;

  const isActive = (href: string) => pathname === href || pathname?.startsWith(`${href}/`);

  return (
    <aside className={`w-64 bg-white border-r border-surface-200 h-full overflow-y-auto ${className}`}>
      <nav className="p-4 space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <div key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-primary-50 text-primary'
                    : 'text-stone-600 hover:bg-surface-100 hover:text-stone-900'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="px-2 py-0.5 text-xs font-semibold bg-primary text-white rounded-full">
                    {item.badge}
                  </span>
                )}
                {item.children && (
                  <ChevronRight className="w-4 h-4 text-stone-400" />
                )}
              </Link>
              {item.children && active && (
                <div className="ml-8 mt-1 space-y-1">
                  {item.children.map((child) => {
                    const ChildIcon = child.icon;
                    const childActive = isActive(child.href);
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                          childActive
                            ? 'text-primary bg-primary-50/50'
                            : 'text-stone-500 hover:text-stone-700 hover:bg-surface-50'
                        }`}
                      >
                        <ChildIcon className="w-4 h-4" />
                        {child.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
};

export { Sidebar };
