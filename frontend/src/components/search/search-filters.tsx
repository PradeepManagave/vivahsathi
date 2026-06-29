'use client';

import { useState } from 'react';
import { SlidersHorizontal, ChevronDown, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FilterOption {
  label: string; value: string;
}

interface FilterSection {
  id: string; label: string; options: FilterOption[]; type?: 'single' | 'multiple';
}

interface SearchFiltersProps {
  sections: FilterSection[];
  values: Record<string, string[]>;
  onChange: (sectionId: string, values: string[]) => void;
  onReset?: () => void;
  onApply?: () => void;
  className?: string;
}

export function SearchFilters({ sections, values, onChange, onReset, onApply, className = '' }: SearchFiltersProps) {
  const [expanded, setExpanded] = useState<string[]>(sections.slice(0, 3).map(s => s.id));

  const toggle = (id: string) => setExpanded(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const handleSelect = (sectionId: string, optionValue: string, type?: string) => {
    const current = values[sectionId] || [];
    if (type === 'single') {
      onChange(sectionId, current.includes(optionValue) ? [] : [optionValue]);
    } else {
      onChange(sectionId, current.includes(optionValue) ? current.filter(v => v !== optionValue) : [...current, optionValue]);
    }
  };

  return (
    <div className={`space-y-1 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-sm font-medium"><SlidersHorizontal className="w-4 h-4" />Filters</div>
        {onReset && <button onClick={onReset} className="text-xs text-primary hover:underline flex items-center gap-1"><RotateCcw className="w-3 h-3" />Reset</button>}
      </div>

      {sections.map((section) => (
        <div key={section.id} className="border border-gray-200 rounded-xl overflow-hidden">
          <button onClick={() => toggle(section.id)} className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium bg-gray-50 hover:bg-gray-100">
            {section.label}
            <ChevronDown className={`w-4 h-4 transition-transform ${expanded.includes(section.id) ? 'rotate-180' : ''}`} />
          </button>
          {expanded.includes(section.id) && (
            <div className="px-4 py-2 space-y-1">
              {section.options.map((opt) => {
                const checked = (values[section.id] || []).includes(opt.value);
                return (
                  <label key={opt.value} className="flex items-center gap-2 py-1 cursor-pointer text-sm hover:text-primary">
                    <input type={section.type === 'single' ? 'radio' : 'checkbox'} checked={checked} onChange={() => handleSelect(section.id, opt.value, section.type)} className="accent-primary" />
                    {opt.label}
                  </label>
                );
              })}
            </div>
          )}
        </div>
      ))}

      {onApply && <Button className="w-full mt-3" size="sm" onClick={onApply}>Apply Filters</Button>}
    </div>
  );
}
