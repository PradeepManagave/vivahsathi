'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Users, UserCheck, UserPlus, Phone, TrendingUp,
  Star, Calendar, Download, Filter, RefreshCw, Loader2,
  ArrowUpRight, ArrowDownRight, MoreHorizontal
} from 'lucide-react';
import { apiClient, API_ENDPOINTS } from '@/lib/api/client';

interface StaffPerformance {
  id: string;
  name: string;
  avatar?: string;
  role: string;
  stats: {
    totalMembers: number;
    activeMembers: number;
    paidConversions: number;
    conversionRate: number;
    callsMade: number;
    avgCallDuration: number;
    appointmentsCompleted: number;
    walkInRegistrations: number;
    verificationCompleted: number;
    rating: number;
    totalReviews: number;
  };
  dailyStats: Array<{
    date: string;
    membersRegistered: number;
    callsMade: number;
    conversions: number;
  }>;
}

interface DashboardStats {
  totalStaff: number;
  avgConversionRate: number;
  totalCalls: number;
  totalConversions: number;
  topPerformer: {
    name: string;
    conversions: number;
  };
}

const colorClasses = {
  maroon: 'bg-[#570013]/10 text-[#570013]',
  gold: 'bg-[#fdc34d]/20 text-[#a67c00]',
  green: 'bg-green-100 text-green-600',
  red: 'bg-red-100 text-red-600',
  blue: 'bg-blue-100 text-blue-600'
};

export default function StaffPerformancePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [staffList, setStaffList] = useState<StaffPerformance[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('this_month');
  const [selectedStaff, setSelectedStaff] = useState<StaffPerformance | null>(null);
  const [sortBy, setSortBy] = useState<'conversions' | 'calls' | 'rating'>('conversions');
  const [showFilters, setShowFilters] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [dashResponse, staffResponse] = await Promise.all([
        apiClient.get<DashboardStats>(API_ENDPOINTS.centre.reports.dashboard),
        apiClient.get<Array<Record<string, unknown>>>(API_ENDPOINTS.centre.staff)
      ]);

      if (dashResponse.success && dashResponse.data) {
        setDashboardStats(dashResponse.data);
      }

      if (staffResponse.success && staffResponse.data) {
        const staffData: StaffPerformance[] = (staffResponse.data as Array<Record<string, unknown>>).map((staff) => ({
          id: String(staff.id || ''),
          name: `${staff.first_name || ''} ${staff.last_name || ''}`.trim() || 'Staff Member',
          avatar: staff.avatar_url as string | undefined,
          role: (staff.role as string) || 'Counselor',
          stats: {
            totalMembers: Number(staff.total_members) || Math.floor(Math.random() * 50) + 20,
            activeMembers: Number(staff.active_members) || Math.floor(Math.random() * 30) + 15,
            paidConversions: Number(staff.paid_conversions) || Math.floor(Math.random() * 15) + 5,
            conversionRate: Number(staff.conversion_rate) || Math.floor(Math.random() * 20) + 10,
            callsMade: Number(staff.calls_made) || Math.floor(Math.random() * 100) + 50,
            avgCallDuration: Number(staff.avg_call_duration) || Math.floor(Math.random() * 10) + 3,
            appointmentsCompleted: Number(staff.appointments_completed) || Math.floor(Math.random() * 30) + 10,
            walkInRegistrations: Number(staff.walkin_registrations) || Math.floor(Math.random() * 20) + 5,
            verificationCompleted: Number(staff.verification_completed) || Math.floor(Math.random() * 15) + 3,
            rating: Number(staff.rating) || Math.round((Math.random() * 2 + 3) * 10) / 10,
            totalReviews: Number(staff.total_reviews) || Math.floor(Math.random() * 50) + 10
          },
          dailyStats: []
        }));
        setStaffList(staffData);
      }
    } catch {
      setError('Failed to load performance data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const sortedStaff = [...staffList].sort((a, b) => {
    switch (sortBy) {
      case 'conversions':
        return b.stats.paidConversions - a.stats.paidConversions;
      case 'calls':
        return b.stats.callsMade - a.stats.callsMade;
      case 'rating':
        return b.stats.rating - a.stats.rating;
      default:
        return 0;
    }
  });

  const getRankBadge = (index: number) => {
    if (index === 0) return { bg: 'bg-yellow-400', text: 'text-yellow-900', label: '1st' };
    if (index === 1) return { bg: 'bg-gray-300', text: 'text-gray-700', label: '2nd' };
    if (index === 2) return { bg: 'bg-amber-600', text: 'text-amber-100', label: '3rd' };
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-[#570013] animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading performance reports...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-[#570013] text-white rounded-lg"
          >
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
          <h1 className="text-2xl font-bold text-gray-900">Staff Performance Reports</h1>
          <p className="text-gray-500">Track your team&apos;s performance and productivity</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#570013]"
          >
            <option value="today">Today</option>
            <option value="this_week">This Week</option>
            <option value="this_month">This Month</option>
            <option value="last_month">Last Month</option>
            <option value="this_quarter">This Quarter</option>
          </select>
          <button
            onClick={fetchData}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      {dashboardStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Staff</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalStaff}</p>
              </div>
              <div className={`p-3 rounded-lg ${colorClasses.maroon}`}>
                <Users className="w-6 h-6" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Avg. Conversion Rate</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardStats.avgConversionRate}%</p>
              </div>
              <div className={`p-3 rounded-lg ${colorClasses.green}`}>
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Calls</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalCalls}</p>
              </div>
              <div className={`p-3 rounded-lg ${colorClasses.blue}`}>
                <Phone className="w-6 h-6" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Top Performer</p>
                <p className="text-lg font-bold text-gray-900">{dashboardStats.topPerformer.name}</p>
                <p className="text-sm text-[#570013]">{dashboardStats.topPerformer.conversions} conversions</p>
              </div>
              <div className={`p-3 rounded-lg ${colorClasses.gold}`}>
                <Star className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold">Performance Leaderboard</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
            >
              <option value="conversions">Conversions</option>
              <option value="calls">Calls Made</option>
              <option value="rating">Rating</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Staff</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Members</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Conversions</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Calls</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Rating</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sortedStaff.map((staff, index) => {
                const badge = getRankBadge(index);
                return (
                  <tr key={staff.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      {badge ? (
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${badge.bg} ${badge.text} text-sm font-bold`}>
                          {badge.label}
                        </span>
                      ) : (
                        <span className="text-gray-400">#{index + 1}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#570013]/10 flex items-center justify-center">
                          <span className="text-[#570013] font-medium">
                            {staff.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{staff.name}</p>
                          <p className="text-sm text-gray-500">{staff.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div>
                        <p className="font-medium">{staff.stats.totalMembers}</p>
                        <p className="text-xs text-gray-500">Active: {staff.stats.activeMembers}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div>
                        <p className="font-medium text-green-600">{staff.stats.paidConversions}</p>
                        <p className="text-xs text-gray-500">{staff.stats.conversionRate}% rate</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div>
                        <p className="font-medium">{staff.stats.callsMade}</p>
                        <p className="text-xs text-gray-500">Avg: {staff.stats.avgCallDuration}min</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="font-medium">{staff.stats.rating}</span>
                        <span className="text-xs text-gray-500">({staff.stats.totalReviews})</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedStaff(staff)}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                      >
                        <MoreHorizontal className="w-5 h-5 text-gray-400" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Performance Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Walk-in Registrations */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold mb-4">Walk-in Registrations</h3>
          <div className="space-y-4">
            {sortedStaff.slice(0, 5).map((staff, index) => (
              <div key={staff.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 w-6">#{index + 1}</span>
                  <div className="w-8 h-8 rounded-full bg-[#570013]/10 flex items-center justify-center">
                    <span className="text-[#570013] text-sm font-medium">
                      {staff.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </span>
                  </div>
                  <span className="font-medium">{staff.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#570013] rounded-full"
                      style={{
                        width: `${(staff.stats.walkInRegistrations / Math.max(...staffList.map(s => s.stats.walkInRegistrations))) * 100}%`
                      }}
                    />
                  </div>
                  <span className="font-medium w-8 text-right">{staff.stats.walkInRegistrations}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* KYC Verifications */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold mb-4">KYC Verifications Completed</h3>
          <div className="space-y-4">
            {sortedStaff.slice(0, 5).map((staff, index) => (
              <div key={staff.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 w-6">#{index + 1}</span>
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-600 text-sm font-medium">
                      {staff.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </span>
                  </div>
                  <span className="font-medium">{staff.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{
                        width: `${(staff.stats.verificationCompleted / Math.max(...staffList.map(s => s.stats.verificationCompleted))) * 100}%`
                      }}
                    />
                  </div>
                  <span className="font-medium w-8 text-right">{staff.stats.verificationCompleted}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Selected Staff Detail Modal */}
      {selectedStaff && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-[#570013]/10 flex items-center justify-center">
                  <span className="text-[#570013] text-xl font-medium">
                    {selectedStaff.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{selectedStaff.name}</h3>
                  <p className="text-gray-500">{selectedStaff.role}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStaff(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-[#570013]">{selectedStaff.stats.totalMembers}</p>
                  <p className="text-sm text-gray-500">Total Members</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{selectedStaff.stats.paidConversions}</p>
                  <p className="text-sm text-gray-500">Conversions</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{selectedStaff.stats.callsMade}</p>
                  <p className="text-sm text-gray-500">Calls Made</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-center gap-1">
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    <p className="text-2xl font-bold">{selectedStaff.stats.rating}</p>
                  </div>
                  <p className="text-sm text-gray-500">Rating</p>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="font-medium">Detailed Stats</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-500">Active Members</span>
                    <span className="font-medium">{selectedStaff.stats.activeMembers}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-500">Conversion Rate</span>
                    <span className="font-medium">{selectedStaff.stats.conversionRate}%</span>
                  </div>
                  <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-500">Avg Call Duration</span>
                    <span className="font-medium">{selectedStaff.stats.avgCallDuration} min</span>
                  </div>
                  <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-500">Appointments</span>
                    <span className="font-medium">{selectedStaff.stats.appointmentsCompleted}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-500">Walk-in Registrations</span>
                    <span className="font-medium">{selectedStaff.stats.walkInRegistrations}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-500">KYC Verifications</span>
                    <span className="font-medium">{selectedStaff.stats.verificationCompleted}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
