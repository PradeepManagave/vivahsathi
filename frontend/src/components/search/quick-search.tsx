'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, X, Loader2 } from 'lucide-react';

interface QuickSearchProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
  suggestions?: string[];
  loading?: boolean;
  autoFocus?: boolean;
}

export function QuickSearch({ onSearch, placeholder = 'Search by name, ID or location...', suggestions = [], loading, autoFocus }: QuickSearchProps) {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setShowSuggestions(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSearch?.(query); setShowSuggestions(false); };

  const filtered = suggestions.filter(s => s.toLowerCase().includes(query.toLowerCase()));

  return (
    <div ref={ref} className="relative">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          {loading ? <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" /> : <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />}
          <input
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setShowSuggestions(true); }}
            onFocus={() => setShowSuggestions(true)}
            placeholder={placeholder}
            autoFocus={autoFocus}
            className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          {query && <button type="button" onClick={() => { setQuery(''); onSearch?.(''); }} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-4 h-4 text-gray-400" /></button>}
        </div>
      </form>

      {showSuggestions && filtered.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-1 max-h-60 overflow-y-auto">
          {filtered.map((s, i) => (
            <button key={i} type="button" onClick={() => { setQuery(s); onSearch?.(s); setShowSuggestions(false); }} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50">
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
