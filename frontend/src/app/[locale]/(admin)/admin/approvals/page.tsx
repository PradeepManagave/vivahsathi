'use client';

import React, { useState } from 'react';
import { CheckCircle, XCircle, Eye, Search, Filter, Loader2, User, AlertTriangle, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { apiClient, API_ENDPOINTS } from '@/lib/api/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PaginationMeta } from '@/types';

interface PendingItem {
  id: string; type: 'member' | 'document' | 'franchise' | 'testimonial';
  name: string; detail: string; submittedAt: string; submittedBy?: string;
  status: 'pending' | 'approved' | 'rejected';
}

const typeColors = { member: 'bg-blue-100 text-blue-700', document: 'bg-purple-100 text-purple-700', franchise: 'bg-orange-100 text-orange-700', testimonial: 'bg-green-100 text-green-700' };

export default function ApprovalsPage() {
  const [items, setItems] = useState<PendingItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (typeFilter !== 'all') params.type = typeFilter;
      if (search) params.search = search;
      const res = await apiClient.get<{ items: PendingItem[] }>('/super-admin/approvals', params);
      if (res.success && res.data) setItems(res.data.items || []);
    } catch { console.error('Failed to load approvals'); }
    finally { setLoading(false); }
  };

  React.useEffect(() => { fetchItems(); }, [typeFilter, search]);

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    setActionLoading(id);
    try {
      const res = await apiClient.post(`/super-admin/approvals/${id}/${action}`);
      if (res.success) fetchItems();
    } catch { console.error('Action failed'); }
    finally { setActionLoading(null); }
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">Approvals</h1><p className="text-gray-500">Review and manage pending approvals</p></div>

      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input placeholder="Search by name or detail..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
          </div>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg">
            <option value="all">All Types</option>
            <option value="member">Members</option>
            <option value="document">Documents</option>
            <option value="franchise">Franchises</option>
            <option value="testimonial">Testimonials</option>
          </select>
          <Button onClick={fetchItems} variant="outline"><RefreshCw className="w-4 h-4" /></Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12"><Loader2 className="w-8 h-8 text-[#570013] animate-spin mx-auto" /></div>
      ) : items.length === 0 ? (
        <div className="text-center py-12"><CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" /><p className="text-gray-700 font-medium">All caught up!</p><p className="text-gray-500">No pending approvals</p></div>
      ) : (
        <div className="space-y-3">
          {items.map(item => (
            <div key={item.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-4">
              <div className={`p-2 rounded-lg ${typeColors[item.type]}`}><Badge className="text-xs">{item.type}</Badge></div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900">{item.name}</p>
                <p className="text-sm text-gray-500 truncate">{item.detail}</p>
                <p className="text-xs text-gray-400 mt-0.5">Submitted {new Date(item.submittedAt).toLocaleDateString()}{item.submittedBy ? ` by ${item.submittedBy}` : ''}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => handleAction(item.id, 'approve')} disabled={actionLoading === item.id} className="p-2 text-green-600 hover:bg-green-50 rounded-lg disabled:opacity-50">
                  {actionLoading === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                </button>
                <button onClick={() => handleAction(item.id, 'reject')} disabled={actionLoading === item.id} className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50">
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
