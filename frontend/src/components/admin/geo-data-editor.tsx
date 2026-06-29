'use client';

import React, { useState, useMemo } from 'react';
import { Search, Plus, Pencil, Trash2, ChevronRight, Globe, MapPin, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { NativeSelect } from '@/components/ui/select';
import { DataTable } from '@/components/admin/data-table';
import type { Column } from '@/components/admin/data-table';

interface GeoNode {
  id: string;
  name: string;
  code?: string;
  type: 'country' | 'state' | 'district' | 'taluka' | 'village';
  parentId?: string;
  isActive: boolean;
}

interface GeoDataEditorProps {
  data: GeoNode[];
  onAdd: (node: Omit<GeoNode, 'id'>) => void;
  onUpdate: (id: string, node: Partial<GeoNode>) => void;
  onDelete: (id: string) => void;
  className?: string;
}

export function GeoDataEditor({ data, onAdd, onUpdate, onDelete, className }: GeoDataEditorProps) {
  const [level, setLevel] = useState<GeoNode['type']>('country');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<GeoNode | null>(null);

  const levels: { key: GeoNode['type']; label: string; icon: React.ReactNode }[] = [
    { key: 'country', label: 'Countries', icon: <Globe className="w-4 h-4" /> },
    { key: 'state', label: 'States', icon: <MapPin className="w-4 h-4" /> },
    { key: 'district', label: 'Districts', icon: <Building2 className="w-4 h-4" /> },
    { key: 'taluka', label: 'Talukas', icon: <Building2 className="w-4 h-4" /> },
    { key: 'village', label: 'Villages', icon: <MapPin className="w-4 h-4" /> },
  ];

  const filtered = useMemo(() => {
    let items = data.filter(n => n.type === level);
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(n => n.name.toLowerCase().includes(q) || (n.code && n.code.toLowerCase().includes(q)));
    }
    return items;
  }, [data, level, search]);

  const columns: Column<GeoNode>[] = [
    { key: 'name', header: 'Name', sortable: true },
    { key: 'code', header: 'Code', sortable: true, render: n => n.code || '-' },
    { key: 'isActive', header: 'Status', render: n => (
      <span className={n.isActive ? 'text-emerald-600' : 'text-stone-400'}>{n.isActive ? 'Active' : 'Inactive'}</span>
    )},
    { key: 'actions', header: '', render: n => (
      <div className="flex items-center gap-1">
        <button onClick={() => { setEditing(n); setShowForm(true); }} className="p-1.5 hover:bg-stone-100 rounded-lg"><Pencil className="w-4 h-4 text-stone-400" /></button>
        <button onClick={() => onDelete(n.id)} className="p-1.5 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4 text-red-400" /></button>
      </div>
    )},
  ];

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-stone-900">Geo Data</h3>
        <Button variant="primary" size="sm" onClick={() => { setEditing(null); setShowForm(true); }}>
          <Plus className="w-4 h-4 mr-2" />Add {level}
        </Button>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {levels.map(l => (
          <button
            key={l.key}
            onClick={() => setLevel(l.key)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors',
              level === l.key ? 'bg-primary text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            )}
          >
            {l.icon}{l.label}
          </button>
        ))}
      </div>

      <Input
        placeholder={`Search ${level}s...`}
        value={search}
        onChange={e => setSearch(e.target.value)}
        leftIcon={<Search className="w-4 h-4" />}
      />

      <DataTable columns={columns} data={filtered} keyField="id" searchable={false} emptyMessage={`No ${level}s found`} />

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editing ? `Edit ${level}` : `Add ${level}`}>
        <GeoForm
          type={level}
          data={data}
          initial={editing || undefined}
          onSave={(vals) => {
            if (editing) {
              onUpdate(editing.id, vals);
            } else {
              onAdd(vals as Omit<GeoNode, 'id'>);
            }
            setShowForm(false);
          }}
          onCancel={() => setShowForm(false)}
        />
      </Modal>
    </div>
  );
}

function GeoForm({
  type, data, initial, onSave, onCancel,
}: {
  type: GeoNode['type'];
  data: GeoNode[];
  initial?: GeoNode;
  onSave: (vals: Partial<GeoNode>) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    name: initial?.name || '',
    code: initial?.code || '',
    parentId: initial?.parentId || '',
    isActive: initial?.isActive ?? true,
  });

  const parentLevel = type === 'state' ? 'country' : type === 'district' ? 'state' : type === 'taluka' ? 'district' : type === 'village' ? 'taluka' : null;
  const parents = parentLevel ? data.filter(n => n.type === parentLevel && n.isActive) : [];

  const update = (f: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [f]: e.target.value }));

  return (
    <div className="space-y-4 p-1">
      <Input label="Name" value={form.name} onChange={update('name')} required />
      <Input label="Code (optional)" value={form.code} onChange={update('code')} placeholder="e.g. IN, MH" />
      {parentLevel && (
        <NativeSelect label={`Parent ${parentLevel}`} value={form.parentId} onChange={update('parentId')} options={[{ value: '', label: `Select ${parentLevel}` }, ...parents.map(p => ({ value: p.id, label: p.name }))]} />
      )}
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={form.isActive} onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))} className="rounded border-stone-300" />
        <span className="text-sm text-stone-600">Active</span>
      </label>
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button variant="primary" onClick={() => onSave(form)} disabled={!form.name}>
          {initial ? 'Update' : 'Create'}
        </Button>
      </div>
    </div>
  );
}
