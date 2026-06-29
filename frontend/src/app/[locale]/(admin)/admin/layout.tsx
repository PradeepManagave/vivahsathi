'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Users, Building2, MapPin, BarChart3, 
  FileText, Image, Settings, LogOut, Menu, X, Bell,
  ChevronDown, Activity, Shield
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const sidebarLinks = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Members', href: '/admin/members', icon: Users },
  { name: 'Franchises', href: '/admin/franchises', icon: Building2 },
  { name: 'Geo Data', href: '/admin/geo', icon: MapPin },
  { name: 'Reports', href: '/admin/reports', icon: BarChart3 },
  { name: 'CMS', href: '/admin/cms/pages', icon: FileText, children: [
    { name: 'Pages', href: '/admin/cms/pages' },
    { name: 'Banners', href: '/admin/cms/banners' },
    { name: 'Settings', href: '/admin/cms/settings' }
  ]},
  { name: 'Activity Log', href: '/admin/activity-log', icon: Activity },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cmsExpanded, setCmsExpanded] = useState(pathname?.startsWith('/admin/cms'));

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-[#570013] text-white
        transform transition-transform duration-300
        lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-[#fdc34d]" />
            <div>
              <h1 className="font-bold text-lg">Heritage</h1>
              <p className="text-xs text-white/70">Admin Panel</p>
            </div>
          </div>
          <button 
            className="lg:hidden p-2 hover:bg-white/10 rounded"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {sidebarLinks.map((link) => {
            const Icon = link.icon || FileText;
            const isActive = pathname === link.href || pathname?.startsWith(link.href + '/');
            
            if (link.children) {
              return (
                <div key={link.name}>
                  <button
                    onClick={() => setCmsExpanded(!cmsExpanded)}
                    className={`
                      w-full flex items-center justify-between px-4 py-2.5 rounded-lg
                      transition-colors
                      ${isActive ? 'bg-white/20' : 'hover:bg-white/10'}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5" />
                      <span>{link.name}</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 transition-transform ${cmsExpanded ? 'rotate-180' : ''}`} />
                  </button>
                  {cmsExpanded && (
                    <div className="ml-6 mt-1 space-y-1">
                      {link.children.map((child) => (
                        <Link
                          key={child.name}
                          href={child.href}
                          className={`
                            block px-4 py-2 rounded-lg text-sm
                            ${pathname === child.href ? 'bg-white/20' : 'hover:bg-white/10'}
                          `}
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={link.name}
                href={link.href}
                className={`
                  flex items-center gap-3 px-4 py-2.5 rounded-lg
                  transition-colors
                  ${isActive ? 'bg-white/20' : 'hover:bg-white/10'}
                `}
              >
                <Icon className="w-5 h-5" />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-white/10 transition-colors">
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-3">
            <button 
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-4">
              <div className="hidden sm:block">
                <h2 className="text-lg font-semibold text-gray-900">Super Admin</h2>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="relative p-2 hover:bg-gray-100 rounded-lg">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#570013] rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">SA</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
