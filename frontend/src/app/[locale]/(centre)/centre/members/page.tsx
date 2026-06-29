'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { 
  Search, Filter, Download, Eye, MessageSquare, 
  CreditCard, MoreVertical, User, Phone, Mail,
  Loader2, RefreshCw, AlertTriangle
} from 'lucide-react';
import { apiClient, API_ENDPOINTS } from '@/lib/api/client';
import { PaginationMeta } from '@/types';

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  gender: 'male' | 'female' | 'other';
  status: 'active' | 'pending' | 'suspended';
  membershipPlan?: string;
  membershipExpiry?: string;
  registeredAt: string;
  avatar?: string;
}

interface MembersResponse {
  members: Member[];
  pagination: PaginationMeta;
}

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  suspended: 'bg-red-100 text-red-700'
};

export default function CentreMembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState({ status: '', plan: '' });

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string | number> = { page: 1, limit: 50 };
      if (searchTerm) params.search = searchTerm;
      if (filter.status) params.status = filter.status;
      if (filter.plan) params.planId = filter.plan;

      const response = await apiClient.get<MembersResponse>(API_ENDPOINTS.centre.members, params);
      
      if (response.success && response.data) {
        setMembers(response.data.members || []);
        setPagination(response.meta || null);
      } else {
        setError('Failed to load members');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Members fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filter.status, filter.plan]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMembers();
  };

  const filteredMembers = members.filter(m => {
    const matchesSearch = 
      `${m.firstName} ${m.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) || 
      m.phone?.includes(searchTerm);
    const matchesStatus = !filter.status || m.status === filter.status;
    const matchesPlan = !filter.plan || m.membershipPlan === filter.plan;
    return matchesSearch && matchesStatus && matchesPlan;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Members</h1>
          <p className="text-gray-500">
            {pagination ? `${pagination.total.toLocaleString()} total members` : 'Manage centre members'}
          </p>
        </div>
        <Link
          href="/centre/members/register"
          className="flex items-center gap-2 px-4 py-2 bg-[#570013] text-white rounded-lg hover:bg-[#450010]"
        >
          <User className="w-4 h-4" />
          Walk-in Registration
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#570013] focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-[#570013] text-white rounded-lg hover:bg-[#450010]"
          >
            Search
          </button>
          <select
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
          </select>
          <select
            value={filter.plan}
            onChange={(e) => setFilter({ ...filter, plan: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">All Plans</option>
            <option value="free">Free</option>
            <option value="basic">Basic</option>
            <option value="premium">Premium</option>
            <option value="premium_plus">Premium Plus</option>
          </select>
        </form>
      </div>

      {/* Loading/Error States */}
      {loading ? (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
          <Loader2 className="w-8 h-8 text-[#570013] animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading members...</p>
        </div>
      ) : error ? (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-700 font-medium mb-4">{error}</p>
          <button
            onClick={fetchMembers}
            className="flex items-center gap-2 px-4 py-2 bg-[#570013] text-white rounded-lg hover:bg-[#450010] mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
          <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No members found</h3>
          <p className="text-gray-500 mb-4">Try adjusting your search or filter criteria</p>
          <Link
            href="/centre/members/register"
            className="flex items-center gap-2 px-4 py-2 bg-[#570013] text-white rounded-lg hover:bg-[#450010] mx-auto w-fit"
          >
            <User className="w-4 h-4" />
            Register New Member
          </Link>
        </div>
      ) : (
        /* Members Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((member) => (
            <div key={member.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#570013] rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {member.firstName[0]}{member.lastName[0]}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{member.firstName} {member.lastName}</h3>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full capitalize ${statusColors[member.status]}`}>
                      {member.status}
                    </span>
                  </div>
                </div>
                <button className="p-1 text-gray-400 hover:text-gray-600">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2 text-sm">
                {member.phone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4" />
                    +91 {member.phone}
                  </div>
                )}
                {member.email && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-4 h-4" />
                    {member.email}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <p className="text-gray-500">Plan</p>
                    <p className="font-medium text-gray-900">{member.membershipPlan || 'Free'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-500">Expiry</p>
                    <p className="font-medium text-gray-900">
                      {member.membershipExpiry 
                        ? new Date(member.membershipExpiry).toLocaleDateString()
                        : '-'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
                <Link
                  href={`/centre/members/${member.id}`}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-[#570013] hover:bg-[#570013]/5 rounded-lg"
                >
                  <Eye className="w-4 h-4" />
                  View
                </Link>
                <Link
                  href={`/centre/payments?member=${member.id}`}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-green-600 hover:bg-green-50 rounded-lg"
                >
                  <CreditCard className="w-4 h-4" />
                  Payment
                </Link>
                <a
                  href={`https://wa.me/91${member.phone?.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  <MessageSquare className="w-4 h-4" />
                  WhatsApp
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
