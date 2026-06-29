'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Filter, Calendar, Monitor, Globe, ChevronDown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/select';
import { Pagination } from '@/components/ui/pagination';

interface LogEntry {
  id: string;
  action: string;
  description: string;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

const mockLogs: LogEntry[] = Array.from({ length: 25 }, (_, i) => ({
  id: `log-${i}`,
  action: ['profile_viewed', 'profile_updated', 'photo_uploaded', 'interest_sent', 'login', 'logout', 'password_change', 'membership_upgrade'][i % 8],
  description: [
    'Viewed profile of Priya Sharma',
    'Updated education details',
    'Uploaded new profile photo',
    'Sent interest to Rahul Verma',
    'User logged in from new device',
    'User logged out',
    'Password changed successfully',
    'Upgraded to Gold membership',
  ][i % 8],
  ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  createdAt: new Date(Date.now() - i * 3600000).toISOString(),
}));

const actionColors: Record<string, string> = {
  profile_viewed: 'bg-blue-100 text-blue-700',
  profile_updated: 'bg-amber-100 text-amber-700',
  photo_uploaded: 'bg-violet-100 text-violet-700',
  interest_sent: 'bg-rose-100 text-rose-700',
  login: 'bg-emerald-100 text-emerald-700',
  logout: 'bg-stone-100 text-stone-600',
  password_change: 'bg-red-100 text-red-700',
  membership_upgrade: 'bg-purple-100 text-purple-700',
};

const actionLabels: Record<string, string> = {
  profile_viewed: 'Profile Viewed',
  profile_updated: 'Profile Updated',
  photo_uploaded: 'Photo Uploaded',
  interest_sent: 'Interest Sent',
  login: 'Login',
  logout: 'Logout',
  password_change: 'Password Change',
  membership_upgrade: 'Membership Upgrade',
};

export default function ActivityLogPage() {
  const params = useParams();
  const [actionFilter, setActionFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const filtered = mockLogs.filter(log => {
    if (actionFilter && log.action !== actionFilter) return false;
    if (dateFrom && new Date(log.createdAt) < new Date(dateFrom)) return false;
    if (dateTo && new Date(log.createdAt) > new Date(dateTo + 'T23:59:59')) return false;
    return true;
  });

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const actions = Object.keys(actionLabels);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href={`/admin/members/${params.id}`} className="flex items-center gap-2 text-stone-500 hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4" />Back to Member
        </Link>
        <h1 className="text-lg font-semibold text-stone-900">Activity Log</h1>
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-stone-500 flex items-center gap-1"><Filter className="w-3 h-3" />Action</label>
            <NativeSelect value={actionFilter} onChange={e => { setActionFilter(e.target.value); setPage(1); }} options={[{ value: '', label: 'All Actions' }, ...actions.map(a => ({ value: a, label: actionLabels[a] }))]} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-stone-500 flex items-center gap-1"><Calendar className="w-3 h-3" />From</label>
            <Input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1); }} className="w-40" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-stone-500 flex items-center gap-1"><Calendar className="w-3 h-3" />To</label>
            <Input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1); }} className="w-40" />
          </div>
        </div>
      </Card>

      <Card className="divide-y divide-stone-100">
        {paged.length === 0 ? (
          <div className="p-8 text-center text-stone-400 text-sm">No activity logs found.</div>
        ) : paged.map(log => (
          <div key={log.id} className="p-4 hover:bg-stone-50 transition-colors">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={actionColors[log.action] || 'bg-stone-100 text-stone-600'}>
                    {actionLabels[log.action] || log.action}
                  </Badge>
                  <span className="text-xs text-stone-400">{new Date(log.createdAt).toLocaleString()}</span>
                </div>
                <p className="text-sm text-stone-800">{log.description}</p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-stone-400">
                  <span className="flex items-center gap-1"><Globe className="w-3 h-3" />{log.ipAddress}</span>
                  <span className="flex items-center gap-1"><Monitor className="w-3 h-3" />{log.userAgent.slice(0, 50)}...</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </Card>

      {totalPages > 1 && (
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      )}
    </div>
  );
}
