'use client';

import React, { useEffect, useState } from 'react';
import { Store, Star, MapPin, Phone, Loader2, Eye } from 'lucide-react';
import Link from 'next/link';
import { apiClient } from '@/lib/api/client';
import { DataTable, Column } from '@/components/admin/data-table';
import { Badge } from '@/components/ui/badge';

interface Vendor {
  id: string; businessName: string; ownerName: string; email: string;
  phone: string; city: string; category: string; rating: number; status: string;
}

export default function FranchiseVendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try { const res = await apiClient.get<{ vendors: Vendor[] }>('/franchise/vendors', { limit: 100 }); if (res.success && res.data) setVendors(res.data.vendors || []); }
      catch {}
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const columns: Column<Vendor>[] = [
    { key: 'businessName', header: 'Business', sortable: true },
    { key: 'ownerName', header: 'Owner' },
    { key: 'email', header: 'Email' },
    { key: 'phone', header: 'Phone' },
    { key: 'city', header: 'City', sortable: true },
    { key: 'category', header: 'Category', sortable: true },
    { key: 'rating', header: 'Rating', render: row => <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />{row.rating || '-'}</span>, sortable: true },
    { key: 'status', header: 'Status', render: row => <Badge className={row.status === 'verified' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>{row.status}</Badge> },
  ];

  return <div className="space-y-6"><div><h1 className="text-2xl font-bold text-gray-900">Vendors</h1><p className="text-gray-500">{vendors.length} registered vendors</p></div><DataTable columns={columns} data={vendors} keyField="id" loading={loading} searchable emptyMessage="No vendors found" /></div>;
}
