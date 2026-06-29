'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { 
  Search, Plus, Building2, Users, DollarSign, 
  ChevronRight, MapPin, Phone, Mail, MoreVertical,
  Edit, Trash2, Eye, Loader2, RefreshCw, AlertTriangle, X
} from 'lucide-react';
import { apiClient, API_ENDPOINTS } from '@/lib/api/client';
import { PaginationMeta } from '@/types';

interface Franchise {
  id: string;
  name: string;
  code: string;
  ownerName?: string;
  ownerEmail?: string;
  email: string;
  phone: string;
  city?: string;
  state?: string;
  pincode?: string;
  addressLine?: string;
  status: 'pending' | 'approved' | 'active' | 'suspended' | 'closed';
  commissionPercent: number;
  totalMembers: number;
  totalRevenue: number;
  totalCentres: number;
  createdAt: string;
  updatedAt: string;
}

interface FranchisesResponse {
  franchises: Franchise[];
  pagination: PaginationMeta;
}

interface Stats {
  totalFranchises: number;
  activeCentres: number;
  totalMembers: number;
  totalRevenue: number;
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-blue-100 text-blue-700',
  active: 'bg-green-100 text-green-700',
  suspended: 'bg-red-100 text-red-700',
  closed: 'bg-gray-100 text-gray-700'
};

export default function FranchisesPage() {
  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchFranchises = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string | number> = { page: 1, limit: 50 };
      if (searchTerm) params.search = searchTerm;

      const response = await apiClient.get<FranchisesResponse>(API_ENDPOINTS.superAdmin.franchises, params);
      
      if (response.success && response.data) {
        setFranchises(response.data.franchises || []);
        setPagination(response.meta || null);
        
        const totalRevenue = (response.data.franchises || []).reduce((sum, f) => sum + (f.totalRevenue || 0), 0);
        const totalMembers = (response.data.franchises || []).reduce((sum, f) => sum + (f.totalMembers || 0), 0);
        const totalCentres = (response.data.franchises || []).reduce((sum, f) => sum + (f.totalCentres || 0), 0);
        
        setStats({
          totalFranchises: response.meta?.total || response.data.franchises?.length || 0,
          activeCentres: totalCentres,
          totalMembers,
          totalRevenue
        });
      } else {
        setError('Failed to load franchises');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Franchises fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchFranchises();
  }, [fetchFranchises]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchFranchises();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const filteredFranchises = franchises.filter(f =>
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.state?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Franchises</h1>
          <p className="text-gray-500">Manage franchise centres and their performance</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#570013] text-white rounded-lg hover:bg-[#450010]"
        >
          <Plus className="w-4 h-4" />
          Add Franchise
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Total Franchises</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalFranchises}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Active Centres</p>
            <p className="text-2xl font-bold text-gray-900">{stats.activeCentres}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Total Members</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalMembers.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Total Revenue</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search franchises..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#570013] focus:border-transparent"
          />
        </form>
      </div>

      {/* Loading/Error States */}
      {loading ? (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
          <Loader2 className="w-8 h-8 text-[#570013] animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading franchises...</p>
        </div>
      ) : error ? (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-700 font-medium mb-4">{error}</p>
          <button
            onClick={fetchFranchises}
            className="flex items-center gap-2 px-4 py-2 bg-[#570013] text-white rounded-lg hover:bg-[#450010] mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      ) : filteredFranchises.length === 0 ? (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
          <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No franchises found</h3>
          <p className="text-gray-500 mb-4">Try adjusting your search criteria</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#570013] text-white rounded-lg hover:bg-[#450010] mx-auto"
          >
            <Plus className="w-4 h-4" />
            Add Franchise
          </button>
        </div>
      ) : (
        /* Franchises List */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredFranchises.map((franchise) => (
            <div key={franchise.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-[#570013]/10 rounded-lg">
                    <Building2 className="w-6 h-6 text-[#570013]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{franchise.name}</h3>
                    <p className="text-sm text-gray-500">Code: {franchise.code}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${statusColors[franchise.status]}`}>
                  {franchise.status}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                {franchise.city && franchise.state && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    {franchise.city}, {franchise.state}
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4" />
                  {franchise.phone}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4" />
                  {franchise.email}
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 py-4 border-t border-gray-100">
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900">{franchise.totalCentres}</p>
                  <p className="text-xs text-gray-500">Centres</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900">{franchise.totalMembers.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">Members</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-[#570013]">{formatCurrency(franchise.totalRevenue)}</p>
                  <p className="text-xs text-gray-500">Revenue</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900">{franchise.commissionPercent}%</p>
                  <p className="text-xs text-gray-500">Commission</p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                <Link
                  href={`/admin/franchises/${franchise.id}`}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-[#570013] hover:bg-[#570013]/5 rounded-lg"
                >
                  <Eye className="w-4 h-4" />
                  View
                </Link>
                <Link
                  href={`/admin/franchises/${franchise.id}/members`}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <Users className="w-4 h-4" />
                  Members
                </Link>
                <Link
                  href={`/admin/franchises/${franchise.id}/revenue`}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <DollarSign className="w-4 h-4" />
                  Revenue
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <FranchiseCreateModal 
          onClose={() => setShowCreateModal(false)} 
          onSuccess={() => {
            setShowCreateModal(false);
            fetchFranchises();
          }} 
        />
      )}
    </div>
  );
}

interface CreateFranchiseForm {
  name: string;
  code: string;
  ownerName: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  commissionPercent: string;
}

function FranchiseCreateModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState<CreateFranchiseForm>({
    name: '',
    code: '',
    ownerName: '',
    email: '',
    phone: '',
    city: '',
    state: '',
    commissionPercent: '20'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.post(API_ENDPOINTS.superAdmin.franchises, {
        ...formData,
        commissionPercent: parseFloat(formData.commissionPercent)
      });
      
      if (response.success) {
        onSuccess();
      } else {
        setError(response.error?.message || 'Failed to create franchise');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Create New Franchise</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Franchise Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({...formData, code: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="e.g. MUM-W"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Owner Name</label>
            <input
              type="text"
              value={formData.ownerName}
              onChange={(e) => setFormData({...formData, ownerName: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({...formData, state: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Commission Rate (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.5"
              value={formData.commissionPercent}
              onChange={(e) => setFormData({...formData, commissionPercent: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="px-4 py-2 bg-[#570013] text-white rounded-lg hover:bg-[#450010] disabled:opacity-50 flex items-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Create Franchise
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
