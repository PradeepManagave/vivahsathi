'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, UserPlus, Calendar, Bell,
  Menu, X, Users, Clock
} from 'lucide-react';

interface StaffLayoutProps {
  children: React.ReactNode;
}

const sidebarLinks = [
  { name: 'Dashboard', href: '/staff', icon: LayoutDashboard },
  { name: 'Registrations', href: '/staff/registrations', icon: UserPlus },
  { name: 'Appointments', href: '/staff/appointments', icon: Calendar },
  { name: 'My Tasks', href: '/staff/tasks', icon: Clock },
  { name: 'Members', href: '/staff/members', icon: Users },
];

export default function StaffLayout({ children }: StaffLayoutProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100">
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-gradient-to-b from-[#4a3f35] to-[#2d2620] text-white
        transform transition-transform duration-300
        lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#fdc34d] rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-[#4a3f35]" />
            </div>
            <div>
              <h1 className="font-bold text-lg">Staff Portal</h1>
              <p className="text-xs text-white/70">Mumbai - Andheri</p>
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
            const Icon = link.icon;
            const isActive = pathname === link.href || (link.href !== '/staff' && pathname?.startsWith(link.href));
            
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`
                  flex items-center gap-3 px-4 py-2.5 rounded-lg
                  transition-all duration-200
                  ${isActive 
                    ? 'bg-white/20 shadow-lg' 
                    : 'hover:bg-white/10'
                  }
                `}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-[#fdc34d]' : ''}`} />
                <span className={isActive ? 'font-medium' : ''}>{link.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-[#fdc34d] rounded-full flex items-center justify-center">
              <span className="text-[#4a3f35] text-sm font-medium">RS</span>
            </div>
            <div>
              <p className="text-sm font-medium">Rahul Sharma</p>
              <p className="text-xs text-white/60">rahul@centre.com</p>
            </div>
          </div>
          <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-white/10 transition-colors text-sm">
            Logout
          </button>
        </div>
      </aside>

      <div className="lg:ml-64">
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-4 lg:px-6 py-3">
            <button 
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold text-gray-900 hidden sm:block">
                {sidebarLinks.find(l => pathname === l.href || (l.href !== '/staff' && pathname?.startsWith(l.href)))?.name || 'Staff Portal'}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <button className="relative p-2 hover:bg-gray-100 rounded-lg">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#4a3f35] rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">RS</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
