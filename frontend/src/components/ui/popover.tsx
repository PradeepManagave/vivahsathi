'use client';

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

export interface PopoverProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: 'start' | 'center' | 'end';
  side?: 'bottom' | 'top' | 'left' | 'right';
  className?: string;
  contentClassName?: string;
}

export function Popover({ trigger, children, align = 'center', side = 'bottom', className, contentClassName }: PopoverProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    if (open) { document.addEventListener('mousedown', handleClick); return () => document.removeEventListener('mousedown', handleClick); }
  }, [open]);

  const alignClasses = { start: 'left-0', center: 'left-1/2 -translate-x-1/2', end: 'right-0' };
  const sideClasses = { bottom: 'top-full mt-2', top: 'bottom-full mb-2', left: 'right-full mr-2', right: 'left-full ml-2' };

  return (
    <div className={cn('relative inline-block', className)} ref={ref}>
      <div onClick={() => setOpen(o => !o)} className="cursor-pointer">{trigger}</div>
      {open && (
        <div className={cn('absolute z-50 min-w-[200px] bg-white border rounded-lg shadow-lg p-2', alignClasses[align], sideClasses[side], contentClassName)} onClick={() => setOpen(false)}>
          {children}
        </div>
      )}
    </div>
  );
}

