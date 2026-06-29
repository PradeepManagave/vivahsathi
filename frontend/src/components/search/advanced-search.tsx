'use client';

import { useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface FilterField {
  name: string;
  label: string;
  type: 'text' | 'select' | 'range';
  options?: { label: string; value: string }[];
  placeholder?: string;
}

interface AdvancedSearchProps {
  fields: FilterField[];
  onSearch: (values: Record<string, string>) => void;
  className?: string;
}

export function AdvancedSearch({ fields, onSearch, className }: AdvancedSearchProps) {
  const [expanded, setExpanded] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});

  const handleSearch = () => { onSearch(values); };
  const handleClear = () => { setValues({}); onSearch({}); };

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search members..." className="pl-9" value={values.keyword || ''} onChange={e => setValues(v => ({ ...v, keyword: e.target.value }))} onKeyDown={e => e.key === 'Enter' && handleSearch()} />
        </div>
        <Button variant="outline" size="icon" onClick={() => setExpanded(e => !e)} className={cn(expanded && 'bg-primary/10 border-primary')}>
          <SlidersHorizontal className="w-4 h-4" />
        </Button>
        <Button onClick={handleSearch}>Search</Button>
      </div>
      {expanded && (
        <div className="p-4 border rounded-lg bg-gray-50 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-medium text-sm">Advanced Filters</span>
            <button onClick={handleClear} className="text-xs text-primary hover:underline flex items-center gap-1"><X className="w-3 h-3" />Clear All</button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {fields.map(f => (
              <div key={f.name} className="space-y-1">
                <label className="text-xs text-gray-500">{f.label}</label>
                {f.type === 'select' ? (
                  <Select value={values[f.name] || ''} onValueChange={v => setValues(s => ({ ...s, [f.name]: v }))}>
                    <SelectTrigger><SelectValue placeholder={f.placeholder || `Select ${f.label}`} /></SelectTrigger>
                    <SelectContent>{f.options?.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                  </Select>
                ) : (
                  <Input placeholder={f.placeholder || `Enter ${f.label}`} value={values[f.name] || ''} onChange={e => setValues(v => ({ ...v, [f.name]: e.target.value }))} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={handleClear}>Reset</Button>
            <Button size="sm" onClick={handleSearch}>Apply Filters</Button>
          </div>
        </div>
      )}
    </div>
  );
}
