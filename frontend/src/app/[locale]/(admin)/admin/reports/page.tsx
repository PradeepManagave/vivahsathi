'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { 
  Download, Users, DollarSign, RefreshCw, Calendar,
  TrendingUp, BarChart3, PieChart, Loader2, RefreshCw as RefreshCwIcon, AlertTriangle
} from 'lucide-react';
import { apiClient, API_ENDPOINTS } from '@/lib/api/client';

type ReportType = 'members' | 'revenue' | 'renewals' | 'commissions';

interface MemberReport {
  totalMembers: number;
  activeMembers: number;
  paidMembers: number;
  pendingApproval: number;
  genderDistribution: { male: number; female: number; other: number };
  planDistribution: { free: number; basic: number; premium: number; premiumPlus: number };
  monthlyGrowth: Array<{ month: string; count: number }>;
}

interface RevenueReport {
  totalRevenue: number;
  thisMonth: number;
  today: number;
  avgTransaction: number;
  monthlyTrend: Array<{ month: string; amount: number }>;
}

interface RenewalReport {
  expiringIn7Days: number;
  expiringIn30Days: number;
  expiringIn90Days: number;
  renewalRate: number;
}

interface CommissionReport {
  franchises: Array<{
    id: string;
    name: string;
    revenue: number;
    commissionPercent: number;
    commission: number;
    netPayable: number;
  }>;
  totalRevenue: number;
  totalCommission: number;
  totalNetPayable: number;
}

export default function ReportsPage() {
  const [activeReport, setActiveReport] = useState<ReportType>('members');
  const [dateRange, setDateRange] = useState('this_month');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [memberData, setMemberData] = useState<MemberReport | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueReport | null>(null);
  const [renewalData, setRenewalData] = useState<RenewalReport | null>(null);
  const [commissionData, setCommissionData] = useState<CommissionReport | null>(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = { range: dateRange };
      
      const [membersRes, revenueRes, renewalsRes, commissionsRes] = await Promise.all([
        apiClient.get<MemberReport>(API_ENDPOINTS.superAdmin.reports.members, params),
        apiClient.get<RevenueReport>(API_ENDPOINTS.superAdmin.reports.revenue, params),
        apiClient.get<RenewalReport>(API_ENDPOINTS.superAdmin.reports.renewals, params),
        apiClient.get<CommissionReport>(API_ENDPOINTS.superAdmin.reports.commissions, params)
      ]);

      if (membersRes.success && membersRes.data) setMemberData(membersRes.data);
      if (revenueRes.success && revenueRes.data) setRevenueData(revenueRes.data);
      if (renewalsRes.success && renewalsRes.data) setRenewalData(renewalsRes.data);
      if (commissionsRes.success && commissionsRes.data) setCommissionData(commissionsRes.data);
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Reports fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const reports = [
    { id: 'members', name: 'Members Report', icon: Users, description: 'Member demographics, growth, and distribution' },
    { id: 'revenue', name: 'Revenue Report', icon: DollarSign, description: 'Payment transactions and revenue analysis' },
    { id: 'renewals', name: 'Renewals Report', icon: RefreshCw, description: 'Membership renewals and forecasts' },
    { id: 'commissions', name: 'Commission Report', icon: BarChart3, description: 'Franchise commission calculations' },
  ];

  const handleExport = async () => {
    try {
      const params = new URLSearchParams({ range: dateRange });
      await apiClient.download(
        `/super-admin/reports/${activeReport}/export?${params}`,
        `${activeReport}-report-${dateRange}.csv`
      );
    } catch (err) {
      console.error('Export error:', err);
    }
  };

  if (loading && !memberData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-[#570013] animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading reports...</p>
        </div>
      </div>
    );
  }

  if (error && !memberData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-700 font-medium mb-4">{error}</p>
          <button
            onClick={fetchReports}
            className="flex items-center gap-2 px-4 py-2 bg-[#570013] text-white rounded-lg hover:bg-[#450010] mx-auto"
          >
            <RefreshCwIcon className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-500">Analytics and insights for your platform</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="today">Today</option>
            <option value="this_week">This Week</option>
            <option value="this_month">This Month</option>
            <option value="last_month">Last Month</option>
            <option value="this_year">This Year</option>
          </select>
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {reports.map((report) => (
          <button
            key={report.id}
            onClick={() => setActiveReport(report.id as ReportType)}
            className={`
              p-6 rounded-xl border-2 text-left transition-all
              ${activeReport === report.id 
                ? 'border-[#570013] bg-[#570013]/5 shadow-md' 
                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
              }
            `}
          >
            <div className={`
              p-3 rounded-lg w-fit mb-4
              ${activeReport === report.id ? 'bg-[#570013] text-white' : 'bg-gray-100 text-gray-600'}
            `}>
              <report.icon className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">{report.name}</h3>
            <p className="text-sm text-gray-500">{report.description}</p>
          </button>
        ))}
      </div>

      {/* Report Content */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        {activeReport === 'members' && memberData && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Member Statistics</h2>
              <button onClick={fetchReports} className="flex items-center gap-2 text-sm text-[#570013] hover:underline">
                <RefreshCwIcon className="w-4 h-4" />
                Refresh
              </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Total Members</p>
                <p className="text-2xl font-bold text-gray-900">{memberData.totalMembers.toLocaleString()}</p>
                <p className="text-xs text-green-600">+8.5% from last month</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Active Members</p>
                <p className="text-2xl font-bold text-gray-900">{memberData.activeMembers.toLocaleString()}</p>
                <p className="text-xs text-green-600">87.4% of total</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Paid Members</p>
                <p className="text-2xl font-bold text-gray-900">{memberData.paidMembers.toLocaleString()}</p>
                <p className="text-xs text-green-600">34% conversion</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Pending Approval</p>
                <p className="text-2xl font-bold text-yellow-600">{memberData.pendingApproval}</p>
                <p className="text-xs text-yellow-600">Requires action</p>
              </div>
            </div>

            {/* Distribution Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-4">Gender Distribution</h3>
                <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <PieChart className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">Gender distribution chart</p>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Male</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="w-3/5 h-full bg-blue-500" />
                      </div>
                      <span className="text-sm font-medium">60%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Female</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="w-2/5 h-full bg-pink-500" />
                      </div>
                      <span className="text-sm font-medium">40%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-4">Membership Plan Distribution</h3>
                <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">Plan distribution chart</p>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Free</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="w-2/3 h-full bg-gray-400" />
                      </div>
                      <span className="text-sm font-medium">66%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Basic</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="w-1/4 h-full bg-[#fdc34d]" />
                      </div>
                      <span className="text-sm font-medium">17%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Premium</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="w-1/6 h-full bg-[#570013]" />
                      </div>
                      <span className="text-sm font-medium">12%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeReport === 'revenue' && revenueData && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Revenue Statistics</h2>
              <button onClick={fetchReports} className="flex items-center gap-2 text-sm text-[#570013] hover:underline">
                <RefreshCwIcon className="w-4 h-4" />
                Refresh
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(revenueData.totalRevenue)}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">This Month</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(revenueData.thisMonth)}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Today</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(revenueData.today)}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Avg. Transaction</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(revenueData.avgTransaction)}</p>
              </div>
            </div>

            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">Revenue trend chart</p>
              </div>
            </div>
          </div>
        )}

        {activeReport === 'renewals' && renewalData && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Renewal Forecast</h2>
              <button onClick={fetchReports} className="flex items-center gap-2 text-sm text-[#570013] hover:underline">
                <RefreshCwIcon className="w-4 h-4" />
                Refresh
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-red-600">Expiring in 7 days</p>
                <p className="text-2xl font-bold text-red-700">{renewalData.expiringIn7Days}</p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-600">Expiring in 30 days</p>
                <p className="text-2xl font-bold text-yellow-700">{renewalData.expiringIn30Days}</p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-600">Expiring in 90 days</p>
                <p className="text-2xl font-bold text-yellow-700">{renewalData.expiringIn90Days}</p>
              </div>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-600">Renewal Rate (Last 30 days)</p>
              <p className="text-2xl font-bold text-green-700">{renewalData.renewalRate}%</p>
            </div>
          </div>
        )}

        {activeReport === 'commissions' && commissionData && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Franchise Commission Report</h2>
              <button onClick={fetchReports} className="flex items-center gap-2 text-sm text-[#570013] hover:underline">
                <RefreshCwIcon className="w-4 h-4" />
                Refresh
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Franchise</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commission %</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commission</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Net Payable</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {commissionData.franchises.map((franchise) => (
                    <tr key={franchise.id}>
                      <td className="px-4 py-3">{franchise.name}</td>
                      <td className="px-4 py-3">{formatCurrency(franchise.revenue)}</td>
                      <td className="px-4 py-3">{franchise.commissionPercent}%</td>
                      <td className="px-4 py-3">{formatCurrency(franchise.commission)}</td>
                      <td className="px-4 py-3">{formatCurrency(franchise.netPayable)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 font-semibold">
                  <tr>
                    <td className="px-4 py-3">Total</td>
                    <td className="px-4 py-3">{formatCurrency(commissionData.totalRevenue)}</td>
                    <td className="px-4 py-3"></td>
                    <td className="px-4 py-3">{formatCurrency(commissionData.totalCommission)}</td>
                    <td className="px-4 py-3">{formatCurrency(commissionData.totalNetPayable)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
