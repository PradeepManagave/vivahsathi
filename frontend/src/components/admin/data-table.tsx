'use client';

import React, { useState } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
  className?: string;
  headerClassName?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField?: string;
  pageSize?: number;
  searchable?: boolean;
  searchPlaceholder?: string;
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  className?: string;
}

export function DataTable<T extends Record<string, any>>({ columns, data, keyField = 'id', pageSize = 10, searchable, searchPlaceholder = 'Search...', loading, emptyMessage = 'No data found', onRowClick, className }: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const filtered = search ? data.filter(item => columns.some(col => String(item[col.key] ?? '').toLowerCase().includes(search.toLowerCase()))) : data;

  const sorted = [...filtered].sort((a, b) => {
    if (!sortKey) return 0;
    const va = a[sortKey], vb = b[sortKey];
    if (va == null || vb == null) return 0;
    const cmp = typeof va === 'number' ? va - vb : String(va).localeCompare(String(vb));
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const paged = sorted.slice((page - 1) * pageSize, page * pageSize);

  const handleSort = (key: string) => {
    if (sortKey === key) { setSortDir(d => d === 'asc' ? 'desc' : 'asc'); } else { setSortKey(key); setSortDir('asc'); }
  };

  return (
    <div className={cn('space-y-3', className)}>
      {searchable && (
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder={searchPlaceholder} className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm" />
        </div>
      )}
      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>{columns.map(col => (
              <th key={col.key} className={cn('px-4 py-3 text-left font-medium text-gray-500', col.sortable && 'cursor-pointer select-none hover:bg-gray-100', col.headerClassName)} onClick={() => col.sortable && handleSort(col.key)}>
                <div className="flex items-center gap-1">
                  {col.header}
                  {col.sortable && (
                    sortKey === col.key ? (sortDir === 'asc' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />) : <ChevronsUpDown className="w-3.5 h-3.5 text-gray-300" />
                  )}
                </div>
              </th>
            ))}</tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={columns.length} className="px-4 py-12 text-center text-gray-400">Loading...</td></tr>
            ) : paged.length === 0 ? (
              <tr><td colSpan={columns.length} className="px-4 py-12 text-center text-gray-400">{emptyMessage}</td></tr>
            ) : paged.map((item, i) => (
              <tr key={item[keyField] ?? i} className={cn('hover:bg-gray-50 transition-colors', onRowClick && 'cursor-pointer')} onClick={() => onRowClick?.(item)}>
                {columns.map(col => (
                  <td key={col.key} className={cn('px-4 py-3', col.className)}>{col.render ? col.render(item) : item[col.key] ?? '-'}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Page {page} of {totalPages} ({sorted.length} results)</span>
          <div className="flex gap-1">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-30">Prev</button>
            <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-30">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
