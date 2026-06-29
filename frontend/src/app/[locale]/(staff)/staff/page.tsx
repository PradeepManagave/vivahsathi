'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { 
  Users, UserPlus, Calendar, Clock, 
  CheckCircle, AlertTriangle, ArrowUpRight, 
  RefreshCw, Loader2
} from 'lucide-react';

interface StaffStats {
  registrationsToday: number;
  registrationsThisWeek: number;
  appointmentsToday: number;
  pendingTasks: number;
  completedTasks: number;
  todayAppointments: Array<{
    id: string;
    time: string;
    memberName: string;
    type: string;
    status: string;
  }>;
  recentRegistrations: Array<{
    id: string;
    name: string;
    profileId: string;
    time: string;
    status: string;
  }>;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'maroon' | 'gold' | 'green' | 'blue';
  link?: string;
}

const colorClasses = {
  maroon: 'bg-[#570013]/10 text-[#570013]',
  gold: 'bg-[#fdc34d]/20 text-[#a67c00]',
  green: 'bg-green-100 text-green-600',
  blue: 'bg-blue-100 text-blue-600'
};

function StatCard({ title, value, icon, color, link }: StatCardProps) {
  const content = (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
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

export default function StaffDashboardPage() {
  const [stats, setStats] = useState<StaffStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Mock data - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setStats({
        registrationsToday: 8,
        registrationsThisWeek: 42,
        appointmentsToday: 5,
        pendingTasks: 3,
        completedTasks: 12,
        todayAppointments: [
          { id: '1', time: '10:00 AM', memberName: 'Priya Patel', type: 'Profile Update', status: 'confirmed' },
          { id: '2', time: '11:30 AM', memberName: 'Amit Kumar', type: 'KYC Verification', status: 'pending' },
          { id: '3', time: '2:00 PM', memberName: 'Sneha Desai', type: 'Photo Upload', status: 'confirmed' },
        ],
        recentRegistrations: [
          { id: '1', name: 'Rohit Mehta', profileId: 'M12345', time: '2 hours ago', status: 'completed' },
          { id: '2', name: 'Anjali Singh', profileId: 'M12346', time: '3 hours ago', status: 'pending' },
          { id: '3', name: 'Vikram Joshi', profileId: 'M12347', time: '5 hours ago', status: 'completed' },
        ]
      });
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
          <h1 className="text-2xl font-bold text-gray-900">Staff Dashboard</h1>
          <p className="text-gray-500">Welcome back! Here&apos;s your daily overview.</p>
        </div>
        <button
          onClick={fetchDashboard}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Registrations Today"
          value={stats.registrationsToday}
          icon={<UserPlus className="w-6 h-6" />}
          color="maroon"
          link="/staff/registrations"
        />
        <StatCard
          title="Registrations This Week"
          value={stats.registrationsThisWeek}
          icon={<Users className="w-6 h-6" />}
          color="green"
        />
        <StatCard
          title="Appointments Today"
          value={stats.appointmentsToday}
          icon={<Calendar className="w-6 h-6" />}
          color="blue"
          link="/staff/appointments"
        />
        <StatCard
          title="Pending Tasks"
          value={stats.pendingTasks}
          icon={<Clock className="w-6 h-6" />}
          color="gold"
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Appointments */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Today&apos;s Appointments</h3>
            <Link href="/staff/appointments" className="text-sm text-[#570013] hover:underline">
              View All
            </Link>
          </div>
          {stats.todayAppointments.length > 0 ? (
            <div className="space-y-3">
              {stats.todayAppointments.map((apt) => (
                <div key={apt.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
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

        {/* Recent Registrations */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Registrations</h3>
            <Link href="/staff/registrations" className="text-sm text-[#570013] hover:underline">
              View All
            </Link>
          </div>
          {stats.recentRegistrations.length > 0 ? (
            <div className="space-y-3">
              {stats.recentRegistrations.map((reg) => (
                <div key={reg.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{reg.name}</p>
                    <p className="text-sm text-gray-500">{reg.profileId} &middot; {reg.time}</p>
                  </div>
                  <span className={`
                    px-2 py-1 text-xs font-medium rounded-full capitalize
                    ${reg.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}
                  `}>
                    {reg.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <UserPlus className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No recent registrations</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/staff/registrations?action=new"
            className="flex items-center gap-3 p-4 bg-[#570013]/5 hover:bg-[#570013]/10 rounded-lg transition-colors"
          >
            <div className="p-2 bg-[#570013] rounded-lg">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-gray-900">New Registration</p>
              <p className="text-sm text-gray-500">Walk-in member</p>
            </div>
          </Link>
          <Link
            href="/staff/appointments?action=create"
            className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
          >
            <div className="p-2 bg-blue-500 rounded-lg">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Schedule Appointment</p>
              <p className="text-sm text-gray-500">Book a slot</p>
            </div>
          </Link>
          <Link
            href="/staff/tasks"
            className="flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
          >
            <div className="p-2 bg-green-500 rounded-lg">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-gray-900">View Tasks</p>
              <p className="text-sm text-gray-500">{stats.pendingTasks} pending</p>
            </div>
          </Link>
          <Link
            href="/staff/members"
            className="flex items-center gap-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
          >
            <div className="p-2 bg-purple-500 rounded-lg">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Browse Members</p>
              <p className="text-sm text-gray-500">Search profiles</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
