'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { 
  Users, TrendingUp, DollarSign, Calendar, 
  Clock, UserPlus, CheckCircle, AlertTriangle,
  ArrowUpRight, ArrowDownRight, ChevronRight,
  RefreshCw, Loader2, CreditCard
} from 'lucide-react';
import { apiClient, API_ENDPOINTS } from '@/lib/api/client';

interface DashboardStats {
  totalMembers: number;
  paidConversions: number;
  paidConversionRate: string;
  appointmentsToday: number;
  pendingApprovals: number;
  commissionEarned: number;
  newToday: number;
  newThisMonth: number;
  todayAppointments: Array<{
    id: string;
    time: string;
    memberName: string;
    type: string;
    status: string;
  }>;
  pendingItems: Array<{
    type: string;
    count: number;
    label: string;
    urgent: boolean;
  }>;
}

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  color: 'maroon' | 'gold' | 'green' | 'red' | 'blue';
  link?: string;
}

const colorClasses = {
  maroon: 'bg-[#570013]/10 text-[#570013]',
  gold: 'bg-[#fdc34d]/20 text-[#a67c00]',
  green: 'bg-green-100 text-green-600',
  red: 'bg-red-100 text-red-600',
  blue: 'bg-blue-100 text-blue-600'
};

function StatCard({ title, value, change, icon, color, link }: StatCardProps) {
  const content = (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer">
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

  if (link) {
    return <Link href={link}>{content}</Link>;
  }
  return content;
}

export default function CentreDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<DashboardStats>(API_ENDPOINTS.centre.dashboard);
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

  const pendingItems = stats?.pendingItems || [
    { type: 'registration', count: 0, label: 'New Registrations', urgent: true },
    { type: 'photo', count: 0, label: 'Photo Approvals', urgent: true },
    { type: 'kyc', count: 0, label: 'KYC Verifications', urgent: false },
    { type: 'changes', count: 0, label: 'Profile Changes', urgent: false },
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500">Welcome back! Here&apos;s your centre overview.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboard}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <div className="text-right">
            <p className="text-sm text-gray-500">Today&apos;s Date</p>
            <p className="text-lg font-semibold text-gray-900">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
      </div>

      {/* Pending Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {pendingItems.map((item) => (
          <Link
            key={item.type}
            href={`/centre/approvals?type=${item.type}`}
            className={`
              bg-white rounded-xl p-4 border border-gray-100 cursor-pointer
              hover:shadow-md transition-shadow
              ${item.urgent ? 'border-l-4 border-l-orange-500' : ''}
            `}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{item.count}</p>
                <p className="text-sm text-gray-500">{item.label}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
            {item.urgent && (
              <span className="text-xs text-orange-600 font-medium mt-2 block">Requires attention</span>
            )}
          </Link>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Members"
          value={stats.totalMembers.toLocaleString()}
          change={12.5}
          icon={<Users className="w-6 h-6" />}
          color="maroon"
          link="/centre/members"
        />
        <StatCard
          title="Paid Conversions"
          value={`${stats.paidConversionRate}`}
          change={5.2}
          icon={<TrendingUp className="w-6 h-6" />}
          color="green"
        />
        <StatCard
          title="Appointments Today"
          value={stats.appointmentsToday}
          icon={<Calendar className="w-6 h-6" />}
          color="blue"
          link="/centre/appointments"
        />
        <StatCard
          title="Commission Earned"
          value={formatCurrency(stats.commissionEarned)}
          change={8.3}
          icon={<DollarSign className="w-6 h-6" />}
          color="gold"
          link="/centre/reports"
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Appointments */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Today&apos;s Appointments</h3>
            <Link href="/centre/appointments" className="text-sm text-[#570013] hover:underline">
              View All
            </Link>
          </div>
          {stats.todayAppointments && stats.todayAppointments.length > 0 ? (
            <div className="space-y-3">
              {stats.todayAppointments.map((apt, index) => (
                <div key={apt.id || index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <div className="w-16 text-center">
                    <p className="text-sm font-medium text-gray-900">{apt.time}</p>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{apt.memberName}</p>
                    <p className="text-sm text-gray-500 capitalize">{apt.type.replace('_', ' ')}</p>
                  </div>
                  <span className={`
                    px-2 py-1 text-xs font-medium rounded-full capitalize
                    ${apt.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}
                  `}>
                    {apt.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No appointments scheduled for today</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link
              href="/centre/members/register"
              className="flex items-center gap-3 p-3 bg-[#570013]/5 hover:bg-[#570013]/10 rounded-lg transition-colors"
            >
              <div className="p-2 bg-[#570013] rounded-lg">
                <UserPlus className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Walk-in Registration</p>
                <p className="text-sm text-gray-500">Register new member</p>
              </div>
            </Link>
            <Link
              href="/centre/appointments?action=create"
              className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="p-2 bg-blue-500 rounded-lg">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Create Slot</p>
                <p className="text-sm text-gray-500">Add appointment slot</p>
              </div>
            </Link>
            <Link
              href="/centre/payments?action=create"
              className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="p-2 bg-green-500 rounded-lg">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Offline Payment</p>
                <p className="text-sm text-gray-500">Record cash payment</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Commission Summary */}
      <div className="bg-gradient-to-r from-[#570013] to-[#3a000d] rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/70 text-sm">Total Commission Earned</p>
            <h2 className="text-3xl font-bold mt-1">{formatCurrency(stats.commissionEarned)}</h2>
            <p className="text-white/70 text-sm mt-2">Based on completed payments this month</p>
          </div>
          <Link
            href="/centre/reports/commissions"
            className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
          >
            View Details
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
