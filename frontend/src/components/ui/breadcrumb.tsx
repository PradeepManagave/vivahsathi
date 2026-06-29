import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  homeHref?: string;
  className?: string;
}

export function Breadcrumb({ items, homeHref = '/', className }: BreadcrumbProps) {
  return (
    <nav className={cn('flex items-center gap-1 text-sm text-gray-500', className)} aria-label="Breadcrumb">
      <Link href={homeHref} className="hover:text-gray-700 transition-colors"><Home className="w-4 h-4" /></Link>
      {items.map((item, i) => (
        <React.Fragment key={i}>
          <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
          {item.href ? (
            <Link href={item.href} className="hover:text-gray-700 transition-colors">{item.label}</Link>
          ) : (
            <span className="text-gray-900 font-medium truncate max-w-[200px]">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

