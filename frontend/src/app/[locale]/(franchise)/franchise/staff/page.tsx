'use client';

import React, { useEffect, useState } from 'react';
import { Users, Mail, Phone, Loader2, Plus, MoreVertical } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { DataTable, Column } from '@/components/admin/data-table';
import { Button } from '@/components/ui/button';

interface StaffMember {
  id: string; name: string; email: string; phone: string;
  role: string; status: string; joinedAt: string;
}

export default function FranchiseStaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try { const res = await apiClient.get<{ staff: StaffMember[] }>('/franchise/staff', { limit: 100 }); if (res.success && res.data) setStaff(res.data.staff || []); }
      catch {}
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const columns: Column<StaffMember>[] = [
    { key: 'name', header: 'Name', sortable: true },
    { key: 'email', header: 'Email' },
    { key: 'phone', header: 'Phone' },
    { key: 'role', header: 'Role', sortable: true },
    { key: 'status', header: 'Status', render: row => <span className={`text-sm font-medium ${row.status === 'active' ? 'text-green-600' : 'text-gray-400'}`}>{row.status}</span>, sortable: true },
    { key: 'joinedAt', header: 'Joined', render: row => new Date(row.joinedAt).toLocaleDateString(), sortable: true },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Staff</h1><p className="text-gray-500">{staff.length} staff members</p></div>
        <Button className="flex items-center gap-2"><Plus className="w-4 h-4" />Add Staff</Button>
      </div>
      <DataTable columns={columns} data={staff} keyField="id" loading={loading} searchable emptyMessage="No staff members" />
    </div>
  );
}
