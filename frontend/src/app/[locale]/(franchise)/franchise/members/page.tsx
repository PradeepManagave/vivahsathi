'use client';

import React, { useEffect, useState } from 'react';
import { Users, Search, Loader2, CheckCircle, Ban, Eye } from 'lucide-react';
import Link from 'next/link';
import { apiClient } from '@/lib/api/client';
import { DataTable, Column } from '@/components/admin/data-table';
import { Badge } from '@/components/ui/badge';

interface Member {
  id: string; firstName: string; lastName: string; email?: string; phone?: string;
  gender: string; status: string; membershipPlan?: string; createdAt: string;
}

export default function FranchiseMembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await apiClient.get<{ members: Member[] }>('/franchise/members', { limit: 100 });
        if (res.success && res.data) setMembers(res.data.members || []);
      } catch {}
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const columns: Column<Member>[] = [
    { key: 'name', header: 'Member', render: row => <Link href={`/franchise/members/${row.id}`} className="flex items-center gap-2 hover:text-primary"><div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">{row.firstName[0]}{row.lastName[0]}</div><span className="font-medium">{row.firstName} {row.lastName}</span></Link> },
    { key: 'email', header: 'Contact', render: row => <div className="text-sm">{row.email}<br />{row.phone && <span className="text-gray-500">{row.phone}</span>}</div> },
    { key: 'gender', header: 'Gender', sortable: true },
    { key: 'status', header: 'Status', render: row => <Badge className={row.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>{row.status}</Badge>, sortable: true },
    { key: 'membershipPlan', header: 'Plan', render: row => row.membershipPlan || 'Free', sortable: true },
    { key: 'createdAt', header: 'Joined', render: row => new Date(row.createdAt).toLocaleDateString(), sortable: true },
    { key: 'id', header: '', render: row => <Link href={`/franchise/members/${row.id}`}><Eye className="w-4 h-4 text-gray-400 hover:text-primary" /></Link> },
  ];

  return <div className="space-y-6"><div><h1 className="text-2xl font-bold text-gray-900">Members</h1><p className="text-gray-500">{members.length} registered members</p></div><DataTable columns={columns} data={members} keyField="id" loading={loading} searchable emptyMessage="No members found" /></div>;
}
