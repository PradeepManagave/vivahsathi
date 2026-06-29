'use client';

import React, { useEffect, useState } from 'react';
import { BarChart3, Users, Heart, Eye, TrendingUp, Download, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { Card } from '@/components/ui/card';
import { ReportChart } from '@/components/admin/report-chart';
import { DataTable, Column } from '@/components/admin/data-table';

interface ProfileView {
  date: string; count: number;
}

interface InterestStat {
  sent: number; received: number; accepted: number;
}

export default function MemberReportsPage() {
  const [views, setViews] = useState<ProfileView[]>([]);
  const [interestStats, setInterestStats] = useState<InterestStat | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [viewsRes, interestRes] = await Promise.all([
          apiClient.get<{ views: ProfileView[] }>('/member/reports/profile-views', { range: '30d' }),
          apiClient.get<InterestStat>('/member/reports/interests'),
        ]);
        if (viewsRes.success && viewsRes.data) setViews(viewsRes.data.views || []);
        if (interestRes.success && interestRes.data) setInterestStats(interestRes.data);
      } catch { /* ignore */ }
      finally { setLoading(false) }
    };
    fetch();
  }, []);

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">My Reports</h1><p className="text-gray-500">Track your profile performance and engagement</p></div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4"><Eye className="w-5 h-5 text-blue-500 mb-2" /><p className="text-xs text-gray-500">Profile Views</p><p className="text-2xl font-bold">{views.reduce((s, v) => s + v.count, 0)}</p></Card>
        <Card className="p-4"><Heart className="w-5 h-5 text-red-500 mb-2" /><p className="text-xs text-gray-500">Interests Sent</p><p className="text-2xl font-bold">{interestStats?.sent || 0}</p></Card>
        <Card className="p-4"><Heart className="w-5 h-5 text-green-500 mb-2" /><p className="text-xs text-gray-500">Interests Received</p><p className="text-2xl font-bold">{interestStats?.received || 0}</p></Card>
        <Card className="p-4"><TrendingUp className="w-5 h-5 text-primary mb-2" /><p className="text-xs text-gray-500">Accepted</p><p className="text-2xl font-bold">{interestStats?.accepted || 0}</p></Card>
      </div>

      <ReportChart type="bar" data={views.map(v => ({ label: v.date, value: v.count }))} title="Profile Views (Last 30 Days)" height={250} />
    </div>
  );
}
