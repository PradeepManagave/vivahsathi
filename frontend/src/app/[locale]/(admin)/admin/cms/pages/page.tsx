'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { 
  Plus, FileText, Eye, Edit, Trash2, 
  ChevronRight, Search, Loader2, RefreshCw, AlertTriangle, X
} from 'lucide-react';
import { apiClient, API_ENDPOINTS } from '@/lib/api/client';
import { PaginationMeta } from '@/types';

interface Page {
  id: string;
  title: string;
  slug: string;
  content?: string;
  status: 'draft' | 'published' | 'archived';
  pageType: string;
  metaTitle?: string;
  metaDescription?: string;
  updatedAt: string;
  createdAt: string;
}

interface PagesResponse {
  pages: Page[];
  pagination: PaginationMeta;
}

const statusColors = {
  draft: 'bg-gray-100 text-gray-700',
  published: 'bg-green-100 text-green-700',
  archived: 'bg-yellow-100 text-yellow-700'
};

export default function CmsPagesPage() {
  const [pages, setPages] = useState<Page[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchPages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string | number> = { page: 1, limit: 50 };
      if (searchTerm) params.search = searchTerm;

      const response = await apiClient.get<PagesResponse>(API_ENDPOINTS.superAdmin.cms.pages, params);
      
      if (response.success && response.data) {
        setPages(response.data.pages || []);
        setPagination(response.meta || null);
      } else {
        setError('Failed to load pages');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Pages fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPages();
  };

  const handleDelete = async (pageId: string) => {
    if (!confirm('Are you sure you want to delete this page?')) return;
    
    setActionLoading(pageId);
    try {
      const response = await apiClient.delete(API_ENDPOINTS.superAdmin.cms.page(pageId));
      if (response.success) {
        fetchPages();
      }
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredPages = pages.filter(page =>
    page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    page.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pages</h1>
          <p className="text-gray-500">Manage static content pages</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#570013] text-white rounded-lg hover:bg-[#450010]"
        >
          <Plus className="w-4 h-4" />
          Create Page
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search pages..."
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
          <p className="text-gray-500">Loading pages...</p>
        </div>
      ) : error ? (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-700 font-medium mb-4">{error}</p>
          <button
            onClick={fetchPages}
            className="flex items-center gap-2 px-4 py-2 bg-[#570013] text-white rounded-lg hover:bg-[#450010] mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      ) : filteredPages.length === 0 ? (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No pages found</h3>
          <p className="text-gray-500 mb-4">Create your first page to get started</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#570013] text-white rounded-lg hover:bg-[#450010] mx-auto"
          >
            <Plus className="w-4 h-4" />
            Create Page
          </button>
        </div>
      ) : (
        /* Pages List */
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Page</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Updated</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPages.map((page) => (
                <tr key={page.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[#570013]/10 rounded-lg">
                        <FileText className="w-5 h-5 text-[#570013]" />
                      </div>
                      <span className="font-medium text-gray-900">{page.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <code className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                      {page.slug}
                    </code>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-600 capitalize">{page.pageType}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${statusColors[page.status]}`}>
                      {page.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(page.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/cms/pages/${page.id}`}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => setEditingPage(page)}
                        className="p-2 text-gray-400 hover:text-[#570013] hover:bg-gray-100 rounded-lg"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(page.id)}
                        disabled={actionLoading === page.id}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
                      >
                        {actionLoading === page.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Modal */}
      {(showCreateModal || editingPage) && (
        <PageModal
          page={editingPage}
          onClose={() => { setShowCreateModal(false); setEditingPage(null); }}
          onSuccess={() => {
            setShowCreateModal(false);
            setEditingPage(null);
            fetchPages();
          }}
          loading={actionLoading !== null}
        />
      )}
    </div>
  );
}

interface PageFormData {
  title: string;
  slug: string;
  content: string;
  status: string;
  pageType: string;
  metaTitle: string;
  metaDescription: string;
}

function PageModal({ page, onClose, onSuccess, loading }: {
  page: Page | null;
  onClose: () => void;
  onSuccess: () => void;
  loading: boolean;
}) {
  const [formData, setFormData] = useState<PageFormData>({
    title: page?.title || '',
    slug: page?.slug || '',
    content: page?.content || '',
    status: page?.status || 'draft',
    pageType: page?.pageType || 'custom',
    metaTitle: page?.metaTitle || '',
    metaDescription: page?.metaDescription || ''
  });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      const response = page
        ? await apiClient.patch(API_ENDPOINTS.superAdmin.cms.page(page.id), formData)
        : await apiClient.post(API_ENDPOINTS.superAdmin.cms.pages, formData);
      
      if (response.success) {
        onSuccess();
      } else {
        setError(response.error?.message || 'Failed to save page');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl p-6 w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{page ? 'Edit Page' : 'Create New Page'}</h3>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Page Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({...formData, slug: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="/page-url"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Page Type</label>
              <select
                value={formData.pageType}
                onChange={(e) => setFormData({...formData, pageType: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="custom">Custom</option>
                <option value="about">About</option>
                <option value="contact">Contact</option>
                <option value="privacy">Privacy Policy</option>
                <option value="terms">Terms of Service</option>
                <option value="faq">FAQ</option>
                <option value="help">Help</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              rows={8}
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
              {page ? 'Update Page' : 'Create Page'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
