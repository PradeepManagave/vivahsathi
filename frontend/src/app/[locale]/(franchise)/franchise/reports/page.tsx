'use client';

import React, { useEffect, useState } from 'react';
import { BarChart3, Users, DollarSign, TrendingUp, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { Card } from '@/components/ui/card';
import { ReportChart } from '@/components/admin/report-chart';

interface FranchiseReport {
  totalRevenue: number; totalMembers: number; totalCommission: number;
  monthlyRevenue: Array<{ month: string; amount: number }>;
  memberGrowth: Array<{ month: string; count: number }>;
}

export default function FranchiseReportsPage() {
  const [report, setReport] = useState<FranchiseReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try { const res = await apiClient.get<FranchiseReport>('/franchise/reports', { range: '12m' }); if (res.success && res.data) setReport(res.data); }
      catch {}
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>;
  if (!report) return null;

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">Reports</h1><p className="text-gray-500">Franchise performance analytics</p></div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4"><DollarSign className="w-5 h-5 text-green-500 mb-2" /><p className="text-xs text-gray-500">Total Revenue</p><p className="text-2xl font-bold">₹{report.totalRevenue.toLocaleString()}</p></Card>
        <Card className="p-4"><Users className="w-5 h-5 text-blue-500 mb-2" /><p className="text-xs text-gray-500">Total Members</p><p className="text-2xl font-bold">{report.totalMembers}</p></Card>
        <Card className="p-4"><TrendingUp className="w-5 h-5 text-primary mb-2" /><p className="text-xs text-gray-500">Commission</p><p className="text-2xl font-bold">₹{report.totalCommission.toLocaleString()}</p></Card>
        <Card className="p-4"><BarChart3 className="w-5 h-5 text-gold mb-2" /><p className="text-xs text-gray-500">Conversion Rate</p><p className="text-2xl font-bold">{report.totalMembers ? Math.round((report.totalCommission / report.totalRevenue) * 100) : 0}%</p></Card>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <ReportChart type="bar" data={report.monthlyRevenue?.map(m => ({ label: m.month, value: m.amount })) || []} title="Monthly Revenue" height={250} />
        <ReportChart type="line" data={report.memberGrowth?.map(m => ({ label: m.month, value: m.count })) || []} title="Member Growth" height={250} />
      </div>
    </div>
  );
}
