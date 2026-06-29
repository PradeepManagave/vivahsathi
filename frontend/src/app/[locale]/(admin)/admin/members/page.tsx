'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { 
  Search, Filter, Download, MoreVertical, Eye, Ban, 
  CheckCircle, XCircle, Mail, Phone, User, Calendar,
  ChevronLeft, ChevronRight, X, AlertTriangle, Loader2, RefreshCw
} from 'lucide-react';
import { apiClient, API_ENDPOINTS } from '@/lib/api/client';
import { PaginationMeta } from '@/types';

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  phoneCountryCode?: string;
  gender: 'male' | 'female' | 'other';
  status: 'active' | 'pending' | 'banned' | 'suspended' | 'inactive';
  membershipPlan?: string;
  membershipExpiry?: string;
  franchiseName?: string;
  centreName?: string;
  createdAt: string;
  avatar?: string;
}

interface MembersResponse {
  members: Member[];
  pagination: PaginationMeta;
}

const statusColors = {
  active: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  banned: 'bg-red-100 text-red-700',
  suspended: 'bg-gray-100 text-gray-700',
  inactive: 'bg-gray-100 text-gray-500'
};

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    plan: '',
    franchise: '',
    gender: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [showBanModal, setShowBanModal] = useState(false);
  const [banReason, setBanReason] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchMembers = useCallback(async (page: number = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string | number> = {
        page,
        limit: itemsPerPage
      };
      
      if (searchTerm) params.search = searchTerm;
      if (filters.status) params.status = filters.status;
      if (filters.plan) params.plan = filters.plan;
      if (filters.gender) params.gender = filters.gender;

      const response = await apiClient.get<MembersResponse>(API_ENDPOINTS.superAdmin.members, params);
      
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
  }, [searchTerm, filters.status, filters.plan, filters.gender]);

  useEffect(() => {
    fetchMembers(currentPage);
  }, [fetchMembers, currentPage]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchMembers(1);
  };

  const handleApprove = async (memberId: string) => {
    setActionLoading(memberId);
    try {
      const response = await apiClient.post(`${API_ENDPOINTS.superAdmin.approveMember(memberId)}`);
      if (response.success) {
        fetchMembers(currentPage);
      }
    } catch (err) {
      console.error('Approve error:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleBan = async () => {
    if (!selectedMember || !banReason || banReason.length < 10) return;
    
    setActionLoading(selectedMember.id);
    try {
      const response = await apiClient.post(`${API_ENDPOINTS.superAdmin.banMember(selectedMember.id)}`, {
        reason: banReason
      });
      if (response.success) {
        setShowBanModal(false);
        setBanReason('');
        setSelectedMember(null);
        fetchMembers(currentPage);
      }
    } catch (err) {
      console.error('Ban error:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleExport = async () => {
    try {
      const params: Record<string, string> = {};
      if (filters.status) params.status = filters.status;
      if (filters.gender) params.gender = filters.gender;
      
      await apiClient.download(`${API_ENDPOINTS.superAdmin.memberExport}?format=csv&${new URLSearchParams(params)}`, 'members-export.csv');
    } catch (err) {
      console.error('Export error:', err);
    }
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch = 
      member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.phone?.includes(searchTerm);
    
    const matchesStatus = !filters.status || member.status === filters.status;
    const matchesPlan = !filters.plan || member.membershipPlan === filters.plan;
    const matchesGender = !filters.gender || member.gender === filters.gender;
    
    return matchesSearch && matchesStatus && matchesPlan && matchesGender;
  });

  const displayedMembers = filteredMembers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = pagination ? Math.ceil(pagination.total / itemsPerPage) : Math.ceil(filteredMembers.length / itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Members</h1>
          <p className="text-gray-500">
            {pagination ? `${pagination.total.toLocaleString()} total members` : 'Manage all registered members'}
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
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
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg ${showFilters ? 'bg-[#570013] text-white border-[#570013]' : 'bg-white border-gray-300 hover:bg-gray-50'}`}
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </form>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-4 gap-4">
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="banned">Banned</option>
              <option value="suspended">Suspended</option>
            </select>
            <select
              value={filters.plan}
              onChange={(e) => setFilters({...filters, plan: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">All Plans</option>
              <option value="free">Free</option>
              <option value="basic">Basic</option>
              <option value="premium">Premium</option>
              <option value="premium_plus">Premium Plus</option>
            </select>
            <select
              value={filters.gender}
              onChange={(e) => setFilters({...filters, gender: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">All Genders</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
            <button
              onClick={() => setFilters({ status: '', plan: '', franchise: '', gender: '' })}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Loading State */}
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
            onClick={() => fetchMembers(currentPage)}
            className="flex items-center gap-2 px-4 py-2 bg-[#570013] text-white rounded-lg hover:bg-[#450010] mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      ) : (
        <>
          {/* Members Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Membership</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Franchise</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {displayedMembers.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#570013] rounded-full flex items-center justify-center">
                            <span className="text-white font-medium">
                              {member.firstName[0]}{member.lastName[0]}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{member.firstName} {member.lastName}</p>
                            <p className="text-sm text-gray-500 capitalize">{member.gender}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm">
                          {member.email && <p className="text-gray-900">{member.email}</p>}
                          {member.phone && <p className="text-gray-500">{member.phoneCountryCode || '+91'} {member.phone}</p>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${statusColors[member.status]}`}>
                          {member.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-gray-900">{member.membershipPlan || '-'}</p>
                        {member.membershipExpiry && (
                          <p className="text-xs text-gray-500">Expires: {new Date(member.membershipExpiry).toLocaleDateString()}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {member.franchiseName && <p className="text-sm text-gray-900">{member.franchiseName}</p>}
                        {member.centreName && <p className="text-xs text-gray-500">{member.centreName}</p>}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(member.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/members/${member.id}`}
                            className="p-2 text-gray-400 hover:text-[#570013] hover:bg-gray-100 rounded-lg"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          {member.status === 'pending' && (
                            <button 
                              onClick={() => handleApprove(member.id)}
                              disabled={actionLoading === member.id}
                              className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg disabled:opacity-50"
                            >
                              {actionLoading === member.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <CheckCircle className="w-4 h-4" />
                              )}
                            </button>
                          )}
                          {member.status === 'active' && (
                            <button 
                              onClick={() => { setSelectedMember(member); setShowBanModal(true); }}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredMembers.length > 0 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredMembers.length)} of {filteredMembers.length} results
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="px-3 py-1 text-sm">Page {currentPage} of {totalPages}</span>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage >= totalPages}
                    className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {filteredMembers.length === 0 && (
            <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
              <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No members found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </>
      )}

      {/* Ban Modal */}
      {showBanModal && selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowBanModal(false)} />
          <div className="relative bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold">Ban Member</h3>
            </div>
            <p className="text-gray-600 mb-4">
              You are about to ban <strong>{selectedMember.firstName} {selectedMember.lastName}</strong>. 
              Please provide a reason for this action.
            </p>
            <textarea
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              placeholder="Enter ban reason (minimum 10 characters)..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4"
              rows={4}
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => { setShowBanModal(false); setBanReason(''); setSelectedMember(null); }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleBan}
                disabled={banReason.length < 10 || actionLoading === selectedMember.id}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {actionLoading === selectedMember.id && <Loader2 className="w-4 h-4 animate-spin" />}
                Ban Member
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
