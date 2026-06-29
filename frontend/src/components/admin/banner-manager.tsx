'use client';

import React, { useState } from 'react';
import { Plus, GripVertical, Eye, EyeOff, Pencil, Trash2, MoveUp, MoveDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

export interface Banner {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl?: string;
  position: number;
  isActive: boolean;
  deviceTarget?: 'all' | 'mobile' | 'desktop';
  pageTarget?: string;
  startDate?: string;
  endDate?: string;
}

interface BannerManagerProps {
  banners: Banner[];
  onAdd: (banner: Omit<Banner, 'id'>) => void;
  onUpdate: (id: string, banner: Partial<Banner>) => void;
  onDelete: (id: string) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  className?: string;
}

export function BannerManager({ banners, onAdd, onUpdate, onDelete, onReorder, className }: BannerManagerProps) {
  const [editing, setEditing] = useState<Banner | null>(null);
  const [showForm, setShowForm] = useState(false);

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-stone-900">Banners ({banners.length})</h3>
        <Button variant="primary" size="sm" onClick={() => { setEditing(null); setShowForm(true); }}>
          <Plus className="w-4 h-4 mr-2" />Add Banner
        </Button>
      </div>

      <div className="space-y-2">
        {banners.sort((a, b) => a.position - b.position).map((banner, index) => (
          <div key={banner.id} className="flex items-center gap-3 bg-white rounded-lg border border-stone-200 p-3">
            <div className="flex flex-col gap-0.5 text-stone-300">
              <button onClick={() => onReorder(index, index - 1)} disabled={index === 0} className="disabled:opacity-30"><MoveUp className="w-3 h-3" /></button>
              <button onClick={() => onReorder(index, index + 1)} disabled={index === banners.length - 1} className="disabled:opacity-30"><MoveDown className="w-3 h-3" /></button>
            </div>

            <div className="w-20 h-12 rounded-lg overflow-hidden bg-stone-100 flex-shrink-0">
              <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-stone-900 truncate">{banner.title}</p>
              <p className="text-xs text-stone-400 truncate">{banner.linkUrl || 'No link'}</p>
            </div>

            <Badge className={banner.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-100 text-stone-500'}>
              {banner.isActive ? 'Active' : 'Inactive'}
            </Badge>

            <div className="flex items-center gap-1">
              <button onClick={() => onUpdate(banner.id, { isActive: !banner.isActive })} className="p-1.5 hover:bg-stone-100 rounded-lg">
                {banner.isActive ? <EyeOff className="w-4 h-4 text-stone-400" /> : <Eye className="w-4 h-4 text-stone-400" />}
              </button>
              <button onClick={() => { setEditing(banner); setShowForm(true); }} className="p-1.5 hover:bg-stone-100 rounded-lg">
                <Pencil className="w-4 h-4 text-stone-400" />
              </button>
              <button onClick={() => onDelete(banner.id)} className="p-1.5 hover:bg-red-50 rounded-lg">
                <Trash2 className="w-4 h-4 text-red-400" />
              </button>
            </div>
          </div>
        ))}
        {banners.length === 0 && (
          <p className="text-center text-sm text-stone-400 py-8">No banners yet. Add your first banner.</p>
        )}
      </div>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editing ? 'Edit Banner' : 'Add Banner'}>
        <BannerForm
          initial={editing || undefined}
          onSave={(data) => {
            if (editing) {
              onUpdate(editing.id, data);
            } else {
              onAdd(data as Omit<Banner, 'id'>);
            }
            setShowForm(false);
          }}
          onCancel={() => setShowForm(false)}
        />
      </Modal>
    </div>
  );
}

function BannerForm({ initial, onSave, onCancel }: { initial?: Banner; onSave: (data: Partial<Banner>) => void; onCancel: () => void }) {
  const [form, setForm] = useState({
    title: initial?.title || '',
    imageUrl: initial?.imageUrl || '',
    linkUrl: initial?.linkUrl || '',
    deviceTarget: initial?.deviceTarget || 'all',
    pageTarget: initial?.pageTarget || '',
    startDate: initial?.startDate || '',
    endDate: initial?.endDate || '',
    isActive: initial?.isActive ?? true,
    position: initial?.position ?? 0,
  });

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  return (
    <div className="space-y-4 p-1">
      <Input label="Title" value={form.title} onChange={update('title')} required />
      <Input label="Image URL" value={form.imageUrl} onChange={update('imageUrl')} required placeholder="https://..." />
      <Input label="Link URL (optional)" value={form.linkUrl} onChange={update('linkUrl')} placeholder="https://..." />
      <div className="grid grid-cols-2 gap-4">
        <NativeSelect label="Device Target" value={form.deviceTarget} onChange={update('deviceTarget')} options={[{ value: 'all', label: 'All' }, { value: 'mobile', label: 'Mobile' }, { value: 'desktop', label: 'Desktop' }]} />
        <Input label="Page Target" value={form.pageTarget} onChange={update('pageTarget')} placeholder="/dashboard" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input type="date" label="Start Date" value={form.startDate} onChange={update('startDate')} />
        <Input type="date" label="End Date" value={form.endDate} onChange={update('endDate')} />
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={form.isActive} onChange={e => setForm(prev => ({ ...prev, isActive: e.target.checked }))} className="rounded border-stone-300" />
        <span className="text-sm text-stone-600">Active</span>
      </label>
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button variant="primary" onClick={() => onSave(form)}>{initial ? 'Update' : 'Create'}</Button>
      </div>
    </div>
  );
}
