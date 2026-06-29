'use client';

import React, { useEffect, useState } from 'react';
import { RefreshCw, Calendar, Users, TrendingUp, Download, Loader2, AlertTriangle, ChevronRight } from 'lucide-react';
import { apiClient, API_ENDPOINTS } from '@/lib/api/client';
import { Card } from '@/components/ui/card';

interface RenewalReport {
  expiringIn7Days: number;
  expiringIn30Days: number;
  expiringIn90Days: number;
  renewalRate: number;
  upcomingRenewals: Array<{ id: string; name: string; plan: string; expiryDate: string; daysLeft: number }>;
  monthlyRenewals: Array<{ month: string; count: number; revenue: number }>;
}

export default function RenewalsReportPage() {
  const [data, setData] = useState<RenewalReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true); setError(null);
    try {
      const res = await apiClient.get<RenewalReport>(API_ENDPOINTS.superAdmin.reports.renewals, { range: 'all' });
      if (res.success && res.data) setData(res.data);
      else setError('Failed to load data');
    } catch { setError('Network error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const formatCurrency = (v: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 text-[#570013] animate-spin" /></div>;
  if (error) return <div className="text-center py-12"><AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" /><p className="text-gray-700">{error}</p></div>;
  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold text-gray-900">Renewals Report</h1><p className="text-gray-500">Membership renewal analytics and forecasts</p></div>
        <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"><RefreshCw className="w-4 h-4" />Refresh</button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4"><p className="text-xs text-gray-500 uppercase tracking-wider">Expiring in 7 Days</p><p className="text-2xl font-bold text-red-600 mt-1">{data.expiringIn7Days}</p></Card>
        <Card className="p-4"><p className="text-xs text-gray-500 uppercase tracking-wider">Expiring in 30 Days</p><p className="text-2xl font-bold text-yellow-600 mt-1">{data.expiringIn30Days}</p></Card>
        <Card className="p-4"><p className="text-xs text-gray-500 uppercase tracking-wider">Expiring in 90 Days</p><p className="text-2xl font-bold text-blue-600 mt-1">{data.expiringIn90Days}</p></Card>
        <Card className="p-4"><p className="text-xs text-gray-500 uppercase tracking-wider">Renewal Rate</p><p className="text-2xl font-bold text-green-600 mt-1">{(data.renewalRate * 100).toFixed(1)}%</p></Card>
      </div>

      <Card className="p-5"><h3 className="font-semibold mb-4">Upcoming Renewals</h3>
        {data.upcomingRenewals?.length > 0 ? (
          <div className="space-y-2">
            {data.upcomingRenewals.map(r => (
              <div key={r.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div><p className="font-medium">{r.name}</p><p className="text-sm text-gray-500">{r.plan}</p></div>
                <div className="text-right"><p className="text-sm font-medium">{new Date(r.expiryDate).toLocaleDateString()}</p><p className="text-xs text-red-500">{r.daysLeft} days left</p></div>
              </div>
            ))}
          </div>
        ) : <p className="text-gray-500 text-sm">No upcoming renewals</p>}
      </Card>
    </div>
  );
}
