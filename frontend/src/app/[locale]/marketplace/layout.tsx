'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Store, Grid3X3, Megaphone, Menu, X,
  Search, Bell, Home
} from 'lucide-react';

interface MarketplaceLayoutProps {
  children: React.ReactNode;
}

const sidebarLinks = [
  { name: 'Vendors', href: '/marketplace/vendors', icon: Store },
  { name: 'Categories', href: '/marketplace/categories', icon: Grid3X3 },
  { name: 'Classifieds', href: '/marketplace/classifieds', icon: Megaphone },
];

export default function MarketplaceLayout({ children }: MarketplaceLayoutProps) {
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
        fixed top-0 left-0 z-50 h-full w-64 bg-gradient-to-b from-[#2d5016] to-[#1a3009] text-white
        transform transition-transform duration-300
        lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#fdc34d] rounded-lg flex items-center justify-center">
              <Store className="w-6 h-6 text-[#2d5016]" />
            </div>
            <div>
              <h1 className="font-bold text-lg">Marketplace</h1>
              <p className="text-xs text-white/70">Wedding Services</p>
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
            const isActive = pathname === link.href || (link.href !== '/marketplace' && pathname?.startsWith(link.href));
            
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
          <Link href="/" className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-white/10 transition-colors text-sm">
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
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

            <div className="flex items-center gap-4 flex-1 max-w-xl">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search vendors, services..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d5016] focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="relative p-2 hover:bg-gray-100 rounded-lg">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>
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
