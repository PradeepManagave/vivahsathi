'use client';

import React, { useEffect, useState } from 'react';
import { User, Search, Loader2, AlertTriangle, RefreshCw, Undo2 } from 'lucide-react';
import Link from 'next/link';
import { apiClient, API_ENDPOINTS } from '@/lib/api/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable, Column } from '@/components/admin/data-table';

interface BannedMember {
  id: string; firstName: string; lastName: string; email?: string; phone?: string;
  gender: string; banReason?: string; bannedAt: string; bannedBy?: string;
}

export default function BannedMembersPage() {
  const [members, setMembers] = useState<BannedMember[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<{ members: BannedMember[] }>(API_ENDPOINTS.superAdmin.members, { status: 'banned', limit: 100 });
      if (res.success && res.data) setMembers(res.data.members || []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const handleUnban = async (id: string) => {
    try { await apiClient.post(`${API_ENDPOINTS.superAdmin.unbanMember(id)}`); fetch(); } catch { /* ignore */ }
  };

  const columns: Column<BannedMember>[] = [
    { key: 'name', header: 'Member', render: row => <Link href={`/admin/members/${row.id}`} className="flex items-center gap-2 hover:text-primary"><div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">{row.firstName[0]}{row.lastName[0]}</div><span className="font-medium">{row.firstName} {row.lastName}</span></Link> },
    { key: 'email', header: 'Contact', render: row => <div className="text-sm">{row.email}<br />{row.phone && <span className="text-gray-500">{row.phone}</span>}</div> },
    { key: 'banReason', header: 'Reason', render: row => <span className="text-sm text-gray-600 max-w-[200px] block truncate">{row.banReason || '-'}</span> },
    { key: 'bannedAt', header: 'Banned', render: row => new Date(row.bannedAt).toLocaleDateString(), sortable: true },
    { key: 'id', header: '', render: row => <Button size="sm" variant="outline" className="text-xs" onClick={() => handleUnban(row.id)}><Undo2 className="w-3.5 h-3.5 mr-1" />Unban</Button> },
  ];

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">Banned Members</h1><p className="text-gray-500">{members.length} banned members</p></div>
      <DataTable columns={columns} data={members} keyField="id" loading={loading} searchable emptyMessage="No banned members" searchPlaceholder="Search banned members..." />
    </div>
  );
}
