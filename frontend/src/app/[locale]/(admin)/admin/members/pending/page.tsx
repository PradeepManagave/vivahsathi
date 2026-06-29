'use client';

import React, { useEffect, useState } from 'react';
import { User, Search, Loader2, AlertTriangle, RefreshCw, CheckCircle, Ban } from 'lucide-react';
import Link from 'next/link';
import { apiClient, API_ENDPOINTS } from '@/lib/api/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable, Column } from '@/components/admin/data-table';

interface Member {
  id: string; firstName: string; lastName: string; email?: string; phone?: string;
  gender: string; status: string; createdAt: string; membershipPlan?: string;
}

export default function PendingMembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<{ members: Member[] }>(API_ENDPOINTS.superAdmin.members, { status: 'pending', limit: 100 });
      if (res.success && res.data) setMembers(res.data.members || []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const handleApprove = async (id: string) => {
    try { await apiClient.post(API_ENDPOINTS.superAdmin.approveMember(id)); fetch(); } catch { /* ignore */ }
  };

  const filtered = search ? members.filter(m => `${m.firstName} ${m.lastName}`.toLowerCase().includes(search.toLowerCase()) || m.email?.toLowerCase().includes(search.toLowerCase())) : members;

  const columns: Column<Member>[] = [
    { key: 'name', header: 'Member', render: row => <Link href={`/admin/members/${row.id}`} className="flex items-center gap-2 hover:text-primary"><div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">{row.firstName[0]}{row.lastName[0]}</div><span className="font-medium">{row.firstName} {row.lastName}</span></Link> },
    { key: 'email', header: 'Contact', render: row => <div className="text-sm">{row.email}<br />{row.phone && <span className="text-gray-500">{row.phone}</span>}</div> },
    { key: 'gender', header: 'Gender', sortable: true },
    { key: 'createdAt', header: 'Registered', render: row => new Date(row.createdAt).toLocaleDateString(), sortable: true },
    { key: 'id', header: '', render: row => <Button size="sm" className="text-xs" onClick={() => handleApprove(row.id)}><CheckCircle className="w-3.5 h-3.5 mr-1" />Approve</Button> },
  ];

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">Pending Members</h1><p className="text-gray-500">{members.length} members awaiting approval</p></div>
      <DataTable columns={columns} data={filtered} keyField="id" loading={loading} searchable emptyMessage="No pending members" />
    </div>
  );
}
