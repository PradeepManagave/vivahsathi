'use client';

import { useState } from 'react';
import { Bookmark, BookmarkCheck, Search, MoreHorizontal, Bell, BellOff, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface SavedSearch {
  id: string;
  name: string;
  filters: Record<string, string>;
  resultCount?: number;
  notifyOnNew?: boolean;
  createdAt: string;
}

interface SavedSearchesProps {
  searches: SavedSearch[];
  onApply: (search: SavedSearch) => void;
  onDelete: (id: string) => void;
  onToggleNotify: (id: string) => void;
  onRename: (id: string, name: string) => void;
  className?: string;
}

export function SavedSearches({ searches, onApply, onDelete, onToggleNotify, onRename, className }: SavedSearchesProps) {
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  if (!searches || searches.length === 0) {
    return (
      <Card className={cn('p-6 text-center text-gray-500', className)}>
        <Bookmark className="w-10 h-10 mx-auto mb-2 opacity-40" />
        <p className="font-medium">No saved searches</p>
        <p className="text-sm mt-1">Save your search filters to quickly find matching profiles later</p>
      </Card>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      {searches.map(s => (
        <Card key={s.id} className="hover:shadow-sm transition-shadow">
          <CardContent className="p-3 flex items-center gap-3">
            <BookmarkCheck className="w-5 h-5 text-primary flex-shrink-0" />
            <div className="flex-1 min-w-0">
              {renamingId === s.id ? (
                <input autoFocus className="text-sm font-medium border-b border-primary outline-none w-full bg-transparent" value={renameValue} onChange={e => setRenameValue(e.target.value)} onBlur={() => { onRename(s.id, renameValue); setRenamingId(null); }} onKeyDown={e => { if (e.key === 'Enter') { onRename(s.id, renameValue); setRenamingId(null); } }} />
              ) : (
                <p className="text-sm font-medium truncate cursor-pointer" onDoubleClick={() => { setRenamingId(s.id); setRenameValue(s.name); }}>{s.name}</p>
              )}
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-gray-400">{new Date(s.createdAt).toLocaleDateString()}</span>
                {s.resultCount !== undefined && <span className="text-xs text-gray-400">{s.resultCount} results</span>}
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                {Object.entries(s.filters).filter(([, v]) => v).slice(0, 3).map(([k, v]) => <Badge key={k} variant="secondary" className="text-[10px]">{k}: {v}</Badge>)}
                {Object.entries(s.filters).filter(([, v]) => v).length > 3 && <Badge variant="secondary" className="text-[10px]">+{Object.entries(s.filters).filter(([, v]) => v).length - 3} more</Badge>}
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => onToggleNotify(s.id)} title={s.notifyOnNew ? 'Notifications on' : 'Notifications off'}>
                {s.notifyOnNew ? <Bell className="w-3.5 h-3.5 text-primary" /> : <BellOff className="w-3.5 h-3.5 text-gray-400" />}
              </Button>
              <Button variant="ghost" size="icon" className="w-7 h-7 text-red-500 hover:text-red-600" onClick={() => onDelete(s.id)} title="Delete"><Trash2 className="w-3.5 h-3.5" /></Button>
              <Button variant="outline" size="sm" className="text-xs" onClick={() => onApply(s)}><Search className="w-3 h-3 mr-1" />Apply</Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
