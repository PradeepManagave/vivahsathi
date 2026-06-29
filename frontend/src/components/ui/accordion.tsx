'use client';

import { useState, ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

interface AccordionItemProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

interface AccordionProps {
  children: ReactNode;
  type?: 'single' | 'multiple';
  className?: string;
}

function AccordionItem({ title, children, defaultOpen = false }: AccordionItemProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-200">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between py-4 text-left font-medium hover:text-primary transition-colors">
        {title}
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="pb-4 text-sm text-gray-600">{children}</div>}
    </div>
  );
}

export function Accordion({ children, type = 'single', className = '' }: AccordionProps) {
  return <div className={`divide-y divide-gray-200 ${className}`}>{children}</div>;
}

Accordion.Item = AccordionItem;
