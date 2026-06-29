'use client';

import React, { useEffect, useState } from 'react';
import { Users, Calendar, Clock, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { Card } from '@/components/ui/card';
import { ReportChart } from '@/components/admin/report-chart';
import { DataTable, Column } from '@/components/admin/data-table';

interface StaffActivity {
  date: string; registrations: number; appointments: number; approvals: number;
}

interface StaffSummary {
  totalStaff: number; totalRegistrations: number; totalAppointments: number; totalApprovals: number;
}

export default function StaffReportsPage() {
  const [activity, setActivity] = useState<StaffActivity[]>([]);
  const [summary, setSummary] = useState<StaffSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [actRes, sumRes] = await Promise.all([
          apiClient.get<{ activity: StaffActivity[] }>('/member/reports/staff-activity', { range: '30d' }),
          apiClient.get<StaffSummary>('/member/reports/staff-summary'),
        ]);
        if (actRes.success && actRes.data) setActivity(actRes.data.activity || []);
        if (sumRes.success && sumRes.data) setSummary(sumRes.data);
      } catch { /* ignore */ }
      finally { setLoading(false) }
    };
    fetch();
  }, []);

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">Staff Reports</h1><p className="text-gray-500">Staff activity and performance metrics</p></div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4"><Users className="w-5 h-5 text-blue-500 mb-2" /><p className="text-xs text-gray-500">Total Staff</p><p className="text-2xl font-bold">{summary?.totalStaff || 0}</p></Card>
        <Card className="p-4"><Calendar className="w-5 h-5 text-green-500 mb-2" /><p className="text-xs text-gray-500">Registrations</p><p className="text-2xl font-bold">{summary?.totalRegistrations || 0}</p></Card>
        <Card className="p-4"><Clock className="w-5 h-5 text-yellow-500 mb-2" /><p className="text-xs text-gray-500">Appointments</p><p className="text-2xl font-bold">{summary?.totalAppointments || 0}</p></Card>
        <Card className="p-4"><Users className="w-5 h-5 text-primary mb-2" /><p className="text-xs text-gray-500">Approvals</p><p className="text-2xl font-bold">{summary?.totalApprovals || 0}</p></Card>
      </div>

      {activity.length > 0 && (
        <div className="grid md:grid-cols-3 gap-4">
          <ReportChart type="bar" data={activity.map(a => ({ label: a.date, value: a.registrations }))} title="Registrations" />
          <ReportChart type="bar" data={activity.map(a => ({ label: a.date, value: a.appointments }))} title="Appointments" />
          <ReportChart type="bar" data={activity.map(a => ({ label: a.date, value: a.approvals }))} title="Approvals" />
        </div>
      )}
    </div>
  );
}
