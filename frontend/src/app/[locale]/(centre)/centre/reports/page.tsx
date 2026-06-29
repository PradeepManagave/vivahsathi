'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { 
  DollarSign, TrendingUp, Users, CreditCard, Calendar,
  Download, BarChart3, PieChart, RefreshCw, Loader2, AlertTriangle
} from 'lucide-react';
import { apiClient, API_ENDPOINTS } from '@/lib/api/client';

interface CommissionData {
  month: string;
  gross: number;
  commission: number;
}

interface MemberStats {
  total: number;
  active: number;
  paid: number;
  pending: number;
  newThisMonth: number;
  renewals: number;
}

interface DashboardData {
  totalCommission: number;
  grossRevenue: number;
  pendingPayout: number;
  memberStats: MemberStats;
  commissionHistory: CommissionData[];
}

interface SummaryData {
  totalCommission: number;
  totalMembers: number;
  paidMembers: number;
  renewals: number;
  newThisMonth: number;
  pendingApprovals: number;
  conversionRate: number;
}

export default function CentreReportsPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'summary' | 'commissions' | 'members'>('summary');
  const [dateRange, setDateRange] = useState('this_month');

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [dashboardRes, summaryRes] = await Promise.all([
        apiClient.get<DashboardData>(API_ENDPOINTS.centre.reports.dashboard),
        apiClient.get<SummaryData>(API_ENDPOINTS.centre.dashboard)
      ]);

      if (dashboardRes.success && dashboardRes.data) {
        setDashboardData(dashboardRes.data);
      }
      if (summaryRes.success && summaryRes.data) {
        setSummaryData(summaryRes.data);
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Reports fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

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

  const memberStats = summaryData || {
    totalCommission: 0,
    totalMembers: 0,
    paidMembers: 0,
    renewals: 0,
    newThisMonth: 0,
    pendingApprovals: 0,
    conversionRate: 0
  };

  const commissionData = dashboardData?.commissionHistory || [];

  const handleExport = async () => {
    try {
      const params = new URLSearchParams({ range: dateRange });
      await apiClient.download(
        `/centre/reports/export?${params}`,
        `centre-report-${dateRange}.csv`
      );
    } catch (err) {
      console.error('Export error:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-[#570013] animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading reports...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-700 font-medium mb-4">{error}</p>
          <button
            onClick={fetchReports}
            className="flex items-center gap-2 px-4 py-2 bg-[#570013] text-white rounded-lg hover:bg-[#450010] mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-500">Centre performance and commission reports</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="this_week">This Week</option>
            <option value="this_month">This Month</option>
            <option value="last_month">Last Month</option>
            <option value="this_quarter">This Quarter</option>
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

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200">
        {[
          { id: 'summary', name: 'Summary', icon: BarChart3 },
          { id: 'commissions', name: 'Commissions', icon: DollarSign },
          { id: 'members', name: 'Members', icon: Users },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`
              flex items-center gap-2 px-4 py-3 border-b-2 transition-colors
              ${activeTab === tab.id 
                ? 'border-[#570013] text-[#570013]' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
              }
            `}
          >
            <tab.icon className="w-4 h-4" />
            {tab.name}
          </button>
        ))}
      </div>

      {/* Summary Tab */}
      {activeTab === 'summary' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-[#570013] to-[#3a000d] rounded-xl p-6 text-white">
              <p className="text-white/70 text-sm">Total Commission</p>
              <p className="text-3xl font-bold mt-1">{formatCurrency(dashboardData?.totalCommission || 0)}</p>
              <p className="text-white/70 text-xs mt-2">+12% from last month</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Members</p>
                  <p className="text-2xl font-bold text-gray-900">{memberStats.totalMembers.toLocaleString()}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Paid Members</p>
                  <p className="text-2xl font-bold text-gray-900">{memberStats.paidMembers}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <CreditCard className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Renewals</p>
                  <p className="text-2xl font-bold text-gray-900">{memberStats.renewals}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Commission Trend */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Commission Trend</h3>
            {commissionData.length > 0 ? (
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">Commission trend chart</p>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center bg-gray-50 rounded-lg">
                <p className="text-gray-500">No commission data available</p>
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500 mb-2">New Members This Month</p>
              <p className="text-3xl font-bold text-gray-900">{memberStats.newThisMonth}</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500 mb-2">Pending Approvals</p>
              <p className="text-3xl font-bold text-yellow-600">{memberStats.pendingApprovals}</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500 mb-2">Conversion Rate</p>
              <p className="text-3xl font-bold text-green-600">{memberStats.conversionRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      )}

      {/* Commissions Tab */}
      {activeTab === 'commissions' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#570013]/10 rounded-xl p-6 border border-[#570013]/20">
              <p className="text-sm text-[#570013]">Gross Revenue</p>
              <p className="text-3xl font-bold text-[#570013] mt-1">{formatCurrency(dashboardData?.grossRevenue || 0)}</p>
            </div>
            <div className="bg-[#fdc34d]/20 rounded-xl p-6 border border-[#fdc34d]/30">
              <p className="text-sm text-[#a67c00]">Commission Earned (20%)</p>
              <p className="text-3xl font-bold text-[#a67c00] mt-1">{formatCurrency(dashboardData?.totalCommission || 0)}</p>
            </div>
            <div className="bg-green-100 rounded-xl p-6">
              <p className="text-sm text-green-700">Pending Payout</p>
              <p className="text-3xl font-bold text-green-700 mt-1">{formatCurrency(dashboardData?.pendingPayout || 0)}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Commission History</h3>
            </div>
            {commissionData.length > 0 ? (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Gross Revenue</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Commission Rate</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Commission</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {commissionData.map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{row.month}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right">{formatCurrency(row.gross)}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right">20%</td>
                      <td className="px-4 py-3 text-sm font-medium text-green-600 text-right">{formatCurrency(row.commission)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 font-semibold">
                  <tr>
                    <td className="px-4 py-3">Total</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(commissionData.reduce((sum, r) => sum + r.gross, 0))}</td>
                    <td className="px-4 py-3 text-right"></td>
                    <td className="px-4 py-3 text-right text-green-600">{formatCurrency(commissionData.reduce((sum, r) => sum + r.commission, 0))}</td>
                  </tr>
                </tfoot>
              </table>
            ) : (
              <div className="p-12 text-center">
                <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No commission history available</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Members Tab */}
      {activeTab === 'members' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500">Total Members</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{memberStats.totalMembers}</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500">Active Members</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{memberStats.paidMembers}</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500">Paid Members</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{memberStats.paidMembers}</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500">Free Members</p>
              <p className="text-3xl font-bold text-gray-600 mt-1">{memberStats.totalMembers - memberStats.paidMembers}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Membership Distribution</h3>
            <div className="flex items-center gap-8">
              <div className="flex-1">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600">Free</span>
                      <span className="text-sm font-medium">
                        {memberStats.totalMembers > 0 
                          ? (((memberStats.totalMembers - memberStats.paidMembers) / memberStats.totalMembers) * 100).toFixed(1)
                          : 0}%
                      </span>
                    </div>
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gray-400 rounded-full"
                        style={{ width: `${memberStats.totalMembers > 0 ? ((memberStats.totalMembers - memberStats.paidMembers) / memberStats.totalMembers) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600">Premium</span>
                      <span className="text-sm font-medium">
                        {memberStats.totalMembers > 0 
                          ? ((memberStats.paidMembers / memberStats.totalMembers) * 100).toFixed(1)
                          : 0}%
                      </span>
                    </div>
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#570013] rounded-full"
                        style={{ width: `${memberStats.totalMembers > 0 ? (memberStats.paidMembers / memberStats.totalMembers) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-48 h-48 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <PieChart className="w-16 h-16 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Distribution chart</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
