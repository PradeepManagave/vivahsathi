'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { 
  Users, TrendingUp, DollarSign, UserCheck, UserX, 
  Clock, AlertTriangle, ArrowUpRight, ArrowDownRight,
  RefreshCw, Loader2
} from 'lucide-react';
import { apiClient, API_ENDPOINTS } from '@/lib/api/client';
import { ApiResponse } from '@/types';

interface DashboardStats {
  members: {
    total: number;
    active: number;
    paid: number;
    pending: number;
    banned: number;
    newToday: number;
    newThisWeek: number;
    newThisMonth: number;
    paidConversionRate: string;
  };
  revenue: {
    total: number;
    thisMonth: number;
    today: number;
  };
  membership: {
    active: number;
    expiringThisWeek: number;
  };
  reports: {
    unread: number;
  };
  recentActivity: Array<{
    type: string;
    user: string;
    time: string;
    action: string;
  }>;
}

const colorClasses = {
  maroon: 'bg-[#570013]/10 text-[#570013]',
  gold: 'bg-[#fdc34d]/20 text-[#a67c00]',
  green: 'bg-green-100 text-green-600',
  red: 'bg-red-100 text-red-600',
  blue: 'bg-blue-100 text-blue-600'
};

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  color: 'maroon' | 'gold' | 'green' | 'red' | 'blue';
}

function StatCard({ title, value, change, icon, color }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
          {change !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change >= 0 ? (
                <ArrowUpRight className="w-4 h-4" />
              ) : (
                <ArrowDownRight className="w-4 h-4" />
              )}
              <span>{Math.abs(change)}% from last month</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<DashboardStats>(API_ENDPOINTS.superAdmin.dashboard);
      if (response.success && response.data) {
        setStats(response.data);
      } else {
        setError('Failed to load dashboard data');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const pendingActions = stats ? [
    { type: 'approval', count: stats.members.pending, label: 'Pending Approvals', urgent: true },
    { type: 'kyc', count: Math.floor(stats.members.total * 0.005), label: 'KYC Verifications', urgent: true },
    { type: 'village', count: 5, label: 'Village Requests', urgent: false },
    { type: 'reports', count: stats.reports.unread, label: 'Pending Reports', urgent: false },
  ] : [
    { type: 'approval', count: 0, label: 'Pending Approvals', urgent: true },
    { type: 'kyc', count: 0, label: 'KYC Verifications', urgent: true },
    { type: 'village', count: 0, label: 'Village Requests', urgent: false },
    { type: 'reports', count: 0, label: 'Pending Reports', urgent: false },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-[#570013] animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-700 font-medium mb-2">{error || 'Failed to load dashboard'}</p>
          <button
            onClick={fetchDashboard}
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
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500">Welcome back! Here&apos;s what&apos;s happening.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchDashboard}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button className="px-4 py-2 bg-[#570013] text-white rounded-lg hover:bg-[#450010] transition-colors">
            Download Report
          </button>
        </div>
      </div>

      {/* Pending Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {pendingActions.map((action) => (
          <div 
            key={action.type}
            className={`
              bg-white rounded-xl p-4 border border-gray-100 cursor-pointer
              hover:shadow-md transition-shadow
              ${action.urgent ? 'border-l-4 border-l-red-500' : ''}
            `}
          >
            <p className="text-2xl font-bold text-gray-900">{action.count}</p>
            <p className="text-sm text-gray-500">{action.label}</p>
          </div>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Members"
          value={stats.members.total.toLocaleString()}
          change={8.5}
          icon={<Users className="w-6 h-6" />}
          color="maroon"
        />
        <StatCard
          title="Active Members"
          value={stats.members.active.toLocaleString()}
          change={12.3}
          icon={<UserCheck className="w-6 h-6" />}
          color="green"
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats.revenue.total)}
          change={15.2}
          icon={<DollarSign className="w-6 h-6" />}
          color="gold"
        />
        <StatCard
          title="Revenue This Month"
          value={formatCurrency(stats.revenue.thisMonth)}
          change={-3.1}
          icon={<TrendingUp className="w-6 h-6" />}
          color="blue"
        />
      </div>

      {/* Second Row Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Paid Members"
          value={stats.members.paid.toLocaleString()}
          icon={<UserCheck className="w-6 h-6" />}
          color="green"
        />
        <StatCard
          title="Pending Approval"
          value={stats.members.pending}
          icon={<Clock className="w-6 h-6" />}
          color="gold"
        />
        <StatCard
          title="Banned Members"
          value={stats.members.banned}
          icon={<UserX className="w-6 h-6" />}
          color="red"
        />
        <StatCard
          title="Unread Reports"
          value={stats.reports.unread}
          icon={<AlertTriangle className="w-6 h-6" />}
          color="red"
        />
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart Placeholder */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Overview</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">Revenue chart will appear here</p>
              <p className="text-sm text-gray-400">Monthly revenue trend</p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {stats.recentActivity && stats.recentActivity.length > 0 ? (
              stats.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0">
                  <div className={`
                    w-2 h-2 mt-2 rounded-full
                    ${activity.type === 'member_approved' ? 'bg-green-500' : ''}
                    ${activity.type === 'payment_received' ? 'bg-blue-500' : ''}
                    ${activity.type === 'member_banned' ? 'bg-red-500' : ''}
                    ${activity.type === 'photo_rejected' ? 'bg-yellow-500' : ''}
                    ${activity.type === 'membership_upgraded' ? 'bg-purple-500' : ''}
                  `} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.user}</p>
                    <p className="text-sm text-gray-500">{activity.action}</p>
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap">{activity.time}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No recent activity</p>
            )}
          </div>
        </div>
      </div>

      {/* Membership Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Membership Breakdown</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Free Members</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="w-2/3 h-full bg-gray-400" />
                </div>
                <span className="text-sm font-medium">66%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Basic Plan</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="w-1/4 h-full bg-[#fdc34d]" />
                </div>
                <span className="text-sm font-medium">17%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Premium Plan</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="w-1/6 h-full bg-[#570013]" />
                </div>
                <span className="text-sm font-medium">12%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Premium Plus</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="w-[8%] h-full bg-purple-600" />
                </div>
                <span className="text-sm font-medium">5%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">New Members This Month</h3>
          <div className="h-48 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <Users className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-3xl font-bold text-gray-900">{stats.members.newThisMonth.toLocaleString()}</p>
              <p className="text-sm text-gray-500">New registrations</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Expiring Memberships</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <span className="text-sm text-red-700">Expiring in 7 days</span>
              <span className="text-lg font-bold text-red-700">{stats.membership.expiringThisWeek}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <span className="text-sm text-yellow-700">Expiring in 30 days</span>
              <span className="text-lg font-bold text-yellow-700">892</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-sm text-green-700">Renewed this week</span>
              <span className="text-lg font-bold text-green-700">156</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
