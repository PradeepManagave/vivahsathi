'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Users, TrendingUp, Download, Calendar, Filter,
  RefreshCw, Loader2, ArrowUpRight, ArrowDownRight,
  Search, ChevronDown, BarChart3, PieChart, LineChart
} from 'lucide-react';
import { apiClient, API_ENDPOINTS } from '@/lib/api/client';

interface AcquisitionStats {
  totalAcquisitions: number;
  thisMonth: number;
  lastMonth: number;
  growthRate: number;
  byChannel: Array<{
    channel: string;
    count: number;
    percentage: number;
    conversions: number;
  }>;
  bySource: Array<{
    source: string;
    count: number;
    conversions: number;
  }>;
  byTimeline: Array<{
    date: string;
    organic: number;
    paid: number;
    referral: number;
    centre: number;
  }>;
  byReligion: Array<{
    religion: string;
    count: number;
  }>;
}

interface TopSources {
  id: string;
  name: string;
  type: string;
  acquisitions: number;
  conversions: number;
}

export default function MemberAcquisitionReportPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<AcquisitionStats | null>(null);
  const [topSources, setTopSources] = useState<TopSources[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('this_month');
  const [selectedChannel, setSelectedChannel] = useState('all');
  const [chartType, setChartType] = useState<'line' | 'bar' | 'pie'>('line');
  const [showFilters, setShowFilters] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get(API_ENDPOINTS.superAdmin.reports.members, {
        type: 'acquisition',
        period: selectedPeriod
      });

      if (response.success && response.data) {
        setStats(response.data as AcquisitionStats);
        
        // Generate mock top sources
        setTopSources([
          { id: '1', name: 'Google Ads', type: 'paid', acquisitions: 245, conversions: 42 },
          { id: '2', name: 'Facebook Ads', type: 'paid', acquisitions: 189, conversions: 28 },
          { id: '3', name: 'Centre Walk-in', type: 'centre', acquisitions: 312, conversions: 156 },
          { id: '4', name: 'Referral Program', type: 'referral', acquisitions: 156, conversions: 89 },
          { id: '5', name: 'Organic Search', type: 'organic', acquisitions: 423, conversions: 67 },
          { id: '6', name: 'WhatsApp Share', type: 'referral', acquisitions: 98, conversions: 34 },
        ]);
      }
    } catch {
      setError('Failed to load acquisition data');
    } finally {
      setLoading(false);
    }
  }, [selectedPeriod]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getChannelColor = (channel: string) => {
    switch (channel.toLowerCase()) {
      case 'organic': return 'bg-green-500';
      case 'paid': return 'bg-blue-500';
      case 'referral': return 'bg-purple-500';
      case 'centre': return 'bg-[#570013]';
      default: return 'bg-gray-500';
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel.toLowerCase()) {
      case 'organic': return <TrendingUp className="w-4 h-4" />;
      case 'paid': return <BarChart3 className="w-4 h-4" />;
      case 'referral': return <Users className="w-4 h-4" />;
      case 'centre': return <PieChart className="w-4 h-4" />;
      default: return <ChevronDown className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-[#570013] animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading acquisition reports...</p>
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
          <h1 className="text-2xl font-bold text-gray-900">Member Acquisition Reports</h1>
          <p className="text-gray-500">Track where your members are coming from</p>
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
            <option value="this_year">This Year</option>
          </select>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 border rounded-lg ${showFilters ? 'bg-[#570013] text-white border-[#570013]' : 'border-gray-300'}`}
          >
            <Filter className="w-5 h-5" />
          </button>
          <button
            onClick={fetchData}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#570013] text-white rounded-lg hover:bg-[#450010]">
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Acquisitions</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalAcquisitions.toLocaleString()}</p>
                <div className={`flex items-center gap-1 mt-1 ${stats.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.growthRate >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  <span className="text-sm font-medium">{Math.abs(stats.growthRate)}%</span>
                  <span className="text-xs text-gray-400">vs last period</span>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-[#570013]/10">
                <Users className="w-6 h-6 text-[#570013]" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">This Month</p>
                <p className="text-3xl font-bold text-gray-900">{stats.thisMonth.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-1 text-green-600">
                  <ArrowUpRight className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {Math.round(((stats.thisMonth - stats.lastMonth) / stats.lastMonth) * 100)}%
                  </span>
                  <span className="text-xs text-gray-400">vs last month</span>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-green-100">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Avg. Conversions</p>
                <p className="text-3xl font-bold text-gray-900">34.2%</p>
                <p className="text-xs text-gray-400 mt-1">Across all channels</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-100">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Top Channel</p>
                <p className="text-xl font-bold text-gray-900">
                  {stats.byChannel[0]?.channel || 'N/A'}
                </p>
                <p className="text-sm text-[#570013]">
                  {stats.byChannel[0]?.count || 0} acquisitions
                </p>
              </div>
              <div className="p-3 rounded-lg bg-[#fdc34d]/20">
                <PieChart className="w-6 h-6 text-[#a67c00]" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chart Type Selector */}
      <div className="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <h3 className="font-semibold">Acquisition Trends</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Chart type:</span>
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setChartType('line')}
              className={`px-3 py-1.5 ${chartType === 'line' ? 'bg-[#570013] text-white' : 'hover:bg-gray-50'}`}
            >
              <LineChart className="w-4 h-4" />
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`px-3 py-1.5 ${chartType === 'bar' ? 'bg-[#570013] text-white' : 'hover:bg-gray-50'}`}
            >
              <BarChart3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setChartType('pie')}
              className={`px-3 py-1.5 ${chartType === 'pie' ? 'bg-[#570013] text-white' : 'hover:bg-gray-50'}`}
            >
              <PieChart className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Channel Breakdown Chart */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold mb-6">Channel Breakdown</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Bar Chart */}
          <div>
            <div className="space-y-4">
              {stats?.byChannel.map((channel) => (
                <div key={channel.channel} className="flex items-center gap-4">
                  <div className="w-24 flex items-center gap-2">
                    {getChannelIcon(channel.channel)}
                    <span className="text-sm font-medium">{channel.channel}</span>
                  </div>
                  <div className="flex-1">
                    <div className="h-8 bg-gray-100 rounded-lg overflow-hidden">
                      <div
                        className={`h-full ${getChannelColor(channel.channel)} rounded-lg flex items-center justify-end px-2`}
                        style={{ width: `${channel.percentage}%` }}
                      >
                        <span className="text-white text-sm font-medium">
                          {channel.count.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="w-20 text-right">
                    <span className="text-sm font-medium">{channel.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pie Chart */}
          <div className="flex items-center justify-center">
            <div className="relative w-64 h-64">
              <svg viewBox="0 0 100 100" className="transform -rotate-90">
                {stats?.byChannel.reduce((acc, channel, index) => {
                  const percentage = channel.percentage;
                  const previousPercentage = acc.total;
                  acc.total += percentage;
                  
                  const startAngle = (previousPercentage / 100) * 360;
                  const endAngle = (acc.total / 100) * 360;
                  
                  const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
                  const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
                  const x2 = 50 + 40 * Math.cos((endAngle * Math.PI) / 180);
                  const y2 = 50 + 40 * Math.sin((endAngle * Math.PI) / 180);
                  
                  const largeArcFlag = percentage > 50 ? 1 : 0;
                  
                  acc.elements.push(
                    <path
                      key={channel.channel}
                      d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                      fill={['#570013', '#fdc34d', '#22c55e', '#3b82f6', '#a855f7'][index % 5]}
                      className="hover:opacity-80 cursor-pointer"
                    />
                  );
                  return acc;
                }, { total: 0, elements: [] as any }).elements}
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-3xl font-bold">{stats?.totalAcquisitions}</p>
                  <p className="text-sm text-gray-500">Total</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Sources Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="font-semibold">Top Acquisition Sources</h3>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search sources..."
                className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acquisitions</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Conversions</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Conv. Rate</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {topSources.map((source) => (
                <tr key={source.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <span className="font-medium text-gray-900">{source.name}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                      ${source.type === 'paid' ? 'bg-blue-100 text-blue-800' : ''}
                      ${source.type === 'organic' ? 'bg-green-100 text-green-800' : ''}
                      ${source.type === 'referral' ? 'bg-purple-100 text-purple-800' : ''}
                      ${source.type === 'centre' ? 'bg-[#570013]/10 text-[#570013]' : ''}
                    `}>
                      {source.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-medium">
                    {source.acquisitions.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-green-600">
                    {source.conversions.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-medium">
                      {Math.round((source.conversions / source.acquisitions) * 100)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 text-green-600">
                      <ArrowUpRight className="w-4 h-4" />
                      <span className="text-sm font-medium">12%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Religion Breakdown */}
      {stats?.byReligion && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold mb-4">Acquisitions by Religion</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {stats.byReligion.map((item) => (
              <div key={item.religion} className="text-center p-4 bg-gray-50 rounded-xl">
                <p className="text-2xl font-bold text-[#570013]">{item.count}</p>
                <p className="text-sm text-gray-500 truncate">{item.religion}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
