'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { 
  Plus, Image, Eye, Edit, Trash2, 
  Search, ToggleLeft, ToggleRight, Calendar,
  MousePointer, TrendingUp, Loader2, RefreshCw, AlertTriangle, X
} from 'lucide-react';
import { apiClient, API_ENDPOINTS } from '@/lib/api/client';
import { PaginationMeta } from '@/types';

interface Banner {
  id: string;
  title: string;
  imageUrl?: string;
  linkUrl?: string;
  position: 'homepage' | 'sidebar' | 'footer' | 'popup' | 'banner';
  campaignName?: string;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  clicks: number;
  impressions: number;
  clickRate: number;
}

interface BannersResponse {
  banners: Banner[];
  pagination: PaginationMeta;
}

const positionLabels = {
  homepage: 'Homepage',
  sidebar: 'Sidebar',
  footer: 'Footer',
  popup: 'Popup',
  banner: 'Banner'
};

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchBanners = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string | number> = { page: 1, limit: 50 };
      if (searchTerm) params.search = searchTerm;

      const response = await apiClient.get<BannersResponse>(API_ENDPOINTS.superAdmin.cms.banners, params);
      
      if (response.success && response.data) {
        setBanners(response.data.banners || []);
        setPagination(response.meta || null);
      } else {
        setError('Failed to load banners');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Banners fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBanners();
  };

  const handleToggle = async (banner: Banner) => {
    setActionLoading(banner.id);
    try {
      const response = await apiClient.patch(
        API_ENDPOINTS.superAdmin.cms.banner(banner.id),
        { isActive: !banner.isActive }
      );
      if (response.success) {
        fetchBanners();
      }
    } catch (err) {
      console.error('Toggle error:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (bannerId: string) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;
    
    setActionLoading(bannerId);
    try {
      const response = await apiClient.delete(API_ENDPOINTS.superAdmin.cms.banner(bannerId));
      if (response.success) {
        fetchBanners();
      }
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredBanners = banners.filter(banner =>
    banner.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    banner.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Banners</h1>
          <p className="text-gray-500">Manage promotional banners and campaigns</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#570013] text-white rounded-lg hover:bg-[#450010]"
        >
          <Plus className="w-4 h-4" />
          Create Banner
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search banners..."
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
          <p className="text-gray-500">Loading banners...</p>
        </div>
      ) : error ? (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-700 font-medium mb-4">{error}</p>
          <button
            onClick={fetchBanners}
            className="flex items-center gap-2 px-4 py-2 bg-[#570013] text-white rounded-lg hover:bg-[#450010] mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      ) : filteredBanners.length === 0 ? (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
          <Image className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No banners found</h3>
          <p className="text-gray-500 mb-4">Create your first banner to get started</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#570013] text-white rounded-lg hover:bg-[#450010] mx-auto"
          >
            <Plus className="w-4 h-4" />
            Create Banner
          </button>
        </div>
      ) : (
        /* Banners Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBanners.map((banner) => (
            <div key={banner.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="aspect-video bg-gray-100 relative">
                {banner.imageUrl ? (
                  <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Image className="w-12 h-12 text-gray-300" />
                  </div>
                )}
                <div className="absolute top-2 left-2">
                  <span className="px-2 py-1 text-xs font-medium bg-white/90 rounded">
                    {positionLabels[banner.position]}
                  </span>
                </div>
                <div className="absolute top-2 right-2">
                  {banner.isActive ? (
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded">Active</span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded">Inactive</span>
                  )}
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2">{banner.title}</h3>
                {banner.campaignName && (
                  <p className="text-sm text-gray-500 mb-2">Campaign: {banner.campaignName}</p>
                )}
                {(banner.startDate || banner.endDate) && (
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                    <Calendar className="w-4 h-4" />
                    {banner.startDate} - {banner.endDate}
                  </div>
                )}
                <div className="grid grid-cols-3 gap-4 py-3 border-t border-gray-100">
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900">{banner.impressions.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">Impressions</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900">{banner.clicks.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">Clicks</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-[#570013]">{banner.clickRate}%</p>
                    <p className="text-xs text-gray-500">CTR</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                  <button 
                    onClick={() => setEditingBanner(banner)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(banner.id)}
                    disabled={actionLoading === banner.id}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
                  >
                    {actionLoading === banner.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                  <button 
                    onClick={() => handleToggle(banner)}
                    disabled={actionLoading === banner.id}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg disabled:opacity-50"
                  >
                    {banner.isActive ? (
                      <ToggleRight className="w-6 h-6 text-green-600" />
                    ) : (
                      <ToggleLeft className="w-6 h-6" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {(showCreateModal || editingBanner) && (
        <BannerModal
          banner={editingBanner}
          onClose={() => { setShowCreateModal(false); setEditingBanner(null); }}
          onSuccess={() => {
            setShowCreateModal(false);
            setEditingBanner(null);
            fetchBanners();
          }}
          loading={actionLoading !== null}
        />
      )}
    </div>
  );
}

interface BannerFormData {
  title: string;
  imageUrl: string;
  linkUrl: string;
  position: string;
  campaignName: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

function BannerModal({ banner, onClose, onSuccess, loading }: {
  banner: Banner | null;
  onClose: () => void;
  onSuccess: () => void;
  loading: boolean;
}) {
  const [formData, setFormData] = useState<BannerFormData>({
    title: banner?.title || '',
    imageUrl: banner?.imageUrl || '',
    linkUrl: banner?.linkUrl || '',
    position: banner?.position || 'homepage',
    campaignName: banner?.campaignName || '',
    startDate: banner?.startDate || '',
    endDate: banner?.endDate || '',
    isActive: banner?.isActive || false
  });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      const response = banner
        ? await apiClient.patch(API_ENDPOINTS.superAdmin.cms.banner(banner.id), formData)
        : await apiClient.post(API_ENDPOINTS.superAdmin.cms.banners, formData);
      
      if (response.success) {
        onSuccess();
      } else {
        setError(response.error?.message || 'Failed to save banner');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{banner ? 'Edit Banner' : 'Create New Banner'}</h3>
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Banner Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
            <select
              value={formData.position}
              onChange={(e) => setFormData({...formData, position: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="homepage">Homepage</option>
              <option value="sidebar">Sidebar</option>
              <option value="footer">Footer</option>
              <option value="popup">Popup</option>
              <option value="banner">Banner</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
            <input
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="https://example.com/banner.jpg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Link URL</label>
            <input
              type="url"
              value={formData.linkUrl}
              onChange={(e) => setFormData({...formData, linkUrl: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="https://example.com/landing-page"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Name</label>
            <input
              type="text"
              value={formData.campaignName}
              onChange={(e) => setFormData({...formData, campaignName: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
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
              {banner ? 'Update Banner' : 'Create Banner'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
