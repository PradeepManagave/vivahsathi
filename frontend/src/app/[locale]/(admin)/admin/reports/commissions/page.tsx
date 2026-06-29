'use client';

import React, { useEffect, useState } from 'react';
import { BarChart3, DollarSign, Users, Download, Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import { apiClient, API_ENDPOINTS } from '@/lib/api/client';
import { Card } from '@/components/ui/card';

interface FranchiseCommission {
  id: string; name: string; revenue: number; commissionPercent: number; commission: number; netPayable: number;
}

interface CommissionReport {
  franchises: FranchiseCommission[];
  totalRevenue: number;
  totalCommission: number;
  totalNetPayable: number;
}

export default function CommissionsReportPage() {
  const [data, setData] = useState<CommissionReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true); setError(null);
    try {
      const res = await apiClient.get<CommissionReport>(API_ENDPOINTS.superAdmin.reports.commissions, { range: 'this_month' });
      if (res.success && res.data) setData(res.data);
      else setError('Failed to load data');
    } catch { setError('Network error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const fmt = (v: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 text-[#570013] animate-spin" /></div>;
  if (error) return <div className="text-center py-12"><AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" /><p className="text-gray-700">{error}</p></div>;
  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold text-gray-900">Commission Report</h1><p className="text-gray-500">Franchise commission calculations</p></div>
        <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"><RefreshCw className="w-4 h-4" />Refresh</button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4"><p className="text-xs text-gray-500 uppercase">Total Revenue</p><p className="text-2xl font-bold mt-1">{fmt(data.totalRevenue)}</p></Card>
        <Card className="p-4"><p className="text-xs text-gray-500 uppercase">Total Commission</p><p className="text-2xl font-bold text-yellow-600 mt-1">{fmt(data.totalCommission)}</p></Card>
        <Card className="p-4"><p className="text-xs text-gray-500 uppercase">Net Payable</p><p className="text-2xl font-bold text-green-600 mt-1">{fmt(data.totalNetPayable)}</p></Card>
      </div>

      <Card className="p-5"><h3 className="font-semibold mb-4">Franchise Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-gray-500">
              <th className="text-left py-2">Franchise</th>
              <th className="text-right py-2">Revenue</th>
              <th className="text-right py-2">Commission %</th>
              <th className="text-right py-2">Commission</th>
              <th className="text-right py-2">Net Payable</th>
            </tr></thead>
            <tbody className="divide-y">
              {data.franchises.map(f => (
                <tr key={f.id} className="hover:bg-gray-50">
                  <td className="py-3 font-medium">{f.name}</td>
                  <td className="text-right py-3">{fmt(f.revenue)}</td>
                  <td className="text-right py-3">{f.commissionPercent}%</td>
                  <td className="text-right py-3 text-yellow-600">{fmt(f.commission)}</td>
                  <td className="text-right py-3 font-medium text-green-600">{fmt(f.netPayable)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
