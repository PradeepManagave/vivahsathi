'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Users, TrendingUp, DollarSign, Calendar, Clock, UserPlus, CheckCircle, Loader2, RefreshCw, ArrowUpRight, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { apiClient } from '@/lib/api/client';

interface FranchiseStats {
  totalMembers: number; newThisMonth: number; appointmentsToday: number;
  pendingApprovals: number; commissionEarned: number; paidConversions: number;
  todayAppointments: Array<{ id: string; time: string; memberName: string; type: string; status: string }>;
  pendingItems: Array<{ type: string; count: number; label: string; urgent: boolean }>;
}

const colorClasses: Record<string, string> = {
  maroon: 'bg-[#570013]/10 text-[#570013]', gold: 'bg-[#fdc34d]/20 text-[#a67c00]',
  green: 'bg-green-100 text-green-600', red: 'bg-red-100 text-red-600', blue: 'bg-blue-100 text-blue-600',
};

export default function FranchiseDashboardPage() {
  const [stats, setStats] = useState<FranchiseStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try { const res = await apiClient.get<FranchiseStats>('/franchise/dashboard', {}); if (res.success && res.data) setStats(res.data); }
    catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 text-[#570013] animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Franchise Dashboard</h1><p className="text-gray-500">Overview of your franchise performance</p></div>
        <button onClick={fetchData} className="flex items-center gap-2 px-3 py-2 border rounded-lg hover:bg-gray-50 text-sm"><RefreshCw className="w-4 h-4" />Refresh</button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { title: 'Total Members', value: stats?.totalMembers || 0, icon: <Users />, color: 'maroon' },
          { title: 'New This Month', value: stats?.newThisMonth || 0, icon: <UserPlus />, color: 'blue' },
          { title: 'Appointments Today', value: stats?.appointmentsToday || 0, icon: <Calendar />, color: 'gold' },
          { title: 'Pending Approvals', value: stats?.pendingApprovals || 0, icon: <Clock />, color: 'red' },
          { title: 'Commission Earned', value: `₹${(stats?.commissionEarned || 0).toLocaleString()}`, icon: <DollarSign />, color: 'green' },
          { title: 'Paid Conversions', value: stats?.paidConversions || 0, icon: <TrendingUp />, color: 'maroon' },
        ].map(s => (
          <div key={s.title} className="bg-white rounded-xl p-4 border border-gray-100">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${colorClasses[s.color]}`}>{s.icon}</div>
            <p className="text-sm text-gray-500">{s.title}</p>
            <p className="text-xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <h3 className="font-semibold mb-4">Today's Appointments</h3>
          {stats?.todayAppointments?.length ? (
            <div className="space-y-3">{stats.todayAppointments.map(a => (
              <div key={a.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div><p className="font-medium text-sm">{a.memberName}</p><p className="text-xs text-gray-500">{a.time} • {a.type}</p></div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${a.status === 'confirmed' ? 'bg-green-100 text-green-700' : a.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>{a.status}</span>
              </div>
            ))}</div>
          ) : <p className="text-sm text-gray-400">No appointments today</p>}
          <Link href="/franchise/appointments" className="text-sm text-primary flex items-center gap-1 mt-4 hover:underline">View All <ChevronRight className="w-3.5 h-3.5" /></Link>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <h3 className="font-semibold mb-4">Pending Items</h3>
          {stats?.pendingItems?.length ? (
            <div className="space-y-3">{stats.pendingItems.map(p => (
              <div key={p.type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2"><span className={`w-2 h-2 rounded-full ${p.urgent ? 'bg-red-500' : 'bg-yellow-500'}`} /><span className="text-sm">{p.label}</span></div>
                <span className="text-sm font-bold">{p.count}</span>
              </div>
            ))}</div>
          ) : <p className="text-sm text-gray-400">No pending items</p>}
          <Link href="/franchise/members" className="text-sm text-primary flex items-center gap-1 mt-4 hover:underline">Manage Members <ChevronRight className="w-3.5 h-3.5" /></Link>
        </div>
      </div>
    </div>
  );
}
