'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Globe, Plus, Search, Edit2, Trash2, ChevronRight,
  MapPin, Building, Home, Users, Loader2, RefreshCw,
  Upload, Download, Filter, X, Check, AlertTriangle,
  ChevronDown, ChevronUp
} from 'lucide-react';
import { apiClient, API_ENDPOINTS } from '@/lib/api/client';
import { Button } from '@/components/ui/button';

interface GeoEntry {
  id: string;
  name: string;
  code?: string;
  phone_code?: string;
  currency?: string;
  capital?: string;
  pincode?: string;
  is_active: boolean;
  children?: GeoEntry[];
  _count?: {
    states?: number;
    districts?: number;
    talukas?: number;
    villages?: number;
  };
}

interface VillageRequest {
  id: string;
  village_name: string;
  taluka_name: string;
  district_name: string;
  state_name: string;
  status: 'pending' | 'approved' | 'rejected';
  requested_by?: string;
  created_at: string;
}

type GeoLevel = 'countries' | 'states' | 'districts' | 'talukas' | 'villages';

export default function GeoManagementPage() {
  const [activeTab, setActiveTab] = useState<'hierarchy' | 'requests'>('hierarchy');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentLevel, setCurrentLevel] = useState<GeoLevel>('countries');
  const [breadcrumb, setBreadcrumb] = useState<{ id: string; name: string }[]>([]);
  const [entries, setEntries] = useState<GeoEntry[]>([]);
  const [villageRequests, setVillageRequests] = useState<VillageRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBulkImportModal, setShowBulkImportModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<GeoEntry | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [bulkImportData, setBulkImportData] = useState('');
  const [processing, setProcessing] = useState(false);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      let endpoint: string;
      let params: Record<string, string> = {};
      
      switch (currentLevel) {
        case 'countries':
          endpoint = API_ENDPOINTS.superAdmin.geo.countries;
          break;
        case 'states':
          if (breadcrumb.length > 0) {
            endpoint = `/geo/countries/${breadcrumb[0].id}/states`;
          } else {
            setEntries([]);
            setLoading(false);
            return;
          }
          break;
        case 'districts':
          if (breadcrumb.length > 1) {
            endpoint = `/geo/states/${breadcrumb[breadcrumb.length - 1].id}/districts`;
          } else {
            setEntries([]);
            setLoading(false);
            return;
          }
          break;
        case 'talukas':
          if (breadcrumb.length > 2) {
            endpoint = `/geo/districts/${breadcrumb[breadcrumb.length - 1].id}/talukas`;
          } else {
            setEntries([]);
            setLoading(false);
            return;
          }
          break;
        case 'villages':
          if (breadcrumb.length > 3) {
            endpoint = `/geo/talukas/${breadcrumb[breadcrumb.length - 1].id}/villages`;
          } else {
            setEntries([]);
            setLoading(false);
            return;
          }
          break;
        default:
          endpoint = API_ENDPOINTS.superAdmin.geo.countries;
      }

      if (searchQuery) {
        params.search = searchQuery;
      }

      const response = await apiClient.get(endpoint, params);
      
      if (response.success && response.data) {
        setEntries(response.data as GeoEntry[]);
      } else {
        setEntries([]);
      }
    } catch {
      setError('Failed to load geo data');
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [currentLevel, breadcrumb, searchQuery]);

  const fetchVillageRequests = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(API_ENDPOINTS.superAdmin.geo.villageRequests);
      if (response.success && response.data) {
        setVillageRequests((response.data as { data?: VillageRequest[] }).data || []);
      }
    } catch {
      setError('Failed to load village requests');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'hierarchy') {
      fetchEntries();
    } else {
      fetchVillageRequests();
    }
  }, [activeTab, fetchEntries, fetchVillageRequests]);

  const handleAddEntry = async () => {
    setProcessing(true);
    try {
      let endpoint: string;
      let data: Record<string, string> = { ...formData };
      
      switch (currentLevel) {
        case 'countries':
          endpoint = API_ENDPOINTS.superAdmin.geo.countries;
          break;
        case 'states':
          endpoint = API_ENDPOINTS.superAdmin.geo.states;
          data.parent_id = breadcrumb[0].id;
          break;
        case 'districts':
          endpoint = API_ENDPOINTS.superAdmin.geo.districts;
          data.parent_id = breadcrumb[breadcrumb.length - 1].id;
          break;
        case 'talukas':
          endpoint = API_ENDPOINTS.superAdmin.geo.talukas;
          data.parent_id = breadcrumb[breadcrumb.length - 1].id;
          break;
        case 'villages':
          endpoint = API_ENDPOINTS.superAdmin.geo.villages;
          data.parent_id = breadcrumb[breadcrumb.length - 1].id;
          break;
        default:
          return;
      }

      const response = await apiClient.post(endpoint, data);
      if (response.success) {
        setShowAddModal(false);
        setFormData({});
        fetchEntries();
      }
    } catch {
      setError('Failed to add entry');
    } finally {
      setProcessing(false);
    }
  };

  const handleEditEntry = async () => {
    if (!selectedEntry) return;
    setProcessing(true);
    try {
      const endpoint = `${getEndpoint(currentLevel)}/${selectedEntry.id}`;
      const response = await apiClient.put(endpoint, formData);
      if (response.success) {
        setShowEditModal(false);
        setSelectedEntry(null);
        setFormData({});
        fetchEntries();
      }
    } catch {
      setError('Failed to update entry');
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteEntry = async (entry: GeoEntry) => {
    if (!confirm(`Are you sure you want to delete ${entry.name}?`)) return;
    
    try {
      const endpoint = `${getEndpoint(currentLevel)}/${entry.id}`;
      await apiClient.delete(endpoint);
      fetchEntries();
    } catch {
      setError('Failed to delete entry');
    }
  };

  const handleApproveRequest = async (request: VillageRequest) => {
    try {
      await apiClient.post(API_ENDPOINTS.superAdmin.geo.approveVillageRequest(request.id));
      fetchVillageRequests();
    } catch {
      setError('Failed to approve request');
    }
  };

  const handleRejectRequest = async (request: VillageRequest) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;
    
    try {
      await apiClient.post(API_ENDPOINTS.superAdmin.geo.rejectVillageRequest(request.id), { reason });
      fetchVillageRequests();
    } catch {
      setError('Failed to reject request');
    }
  };

  const handleBulkImport = async () => {
    setProcessing(true);
    try {
      if (currentLevel !== 'villages') {
        setError('Bulk import is only available for villages');
        return;
      }
      
      const response = await apiClient.post(API_ENDPOINTS.superAdmin.geo.bulkImportCsv, {
        csvData: bulkImportData
      });
      
      if (response.success) {
        setShowBulkImportModal(false);
        setBulkImportData('');
        fetchEntries();
      }
    } catch {
      setError('Failed to import data');
    } finally {
      setProcessing(false);
    }
  };

  const handleDrillDown = (entry: GeoEntry) => {
    const newBreadcrumb = [...breadcrumb, { id: entry.id, name: entry.name }];
    setBreadcrumb(newBreadcrumb);
    
    switch (currentLevel) {
      case 'countries':
        setCurrentLevel('states');
        break;
      case 'states':
        setCurrentLevel('districts');
        break;
      case 'districts':
        setCurrentLevel('talukas');
        break;
      case 'talukas':
        setCurrentLevel('villages');
        break;
    }
  };

  const handleBreadcrumbClick = (index: number) => {
    const newBreadcrumb = breadcrumb.slice(0, index);
    setBreadcrumb(newBreadcrumb);
    
    switch (newBreadcrumb.length) {
      case 0:
        setCurrentLevel('countries');
        break;
      case 1:
        setCurrentLevel('states');
        break;
      case 2:
        setCurrentLevel('districts');
        break;
      case 3:
        setCurrentLevel('talukas');
        break;
      case 4:
        setCurrentLevel('villages');
        break;
    }
  };

  const getEndpoint = (level: GeoLevel): string => {
    switch (level) {
      case 'countries': return API_ENDPOINTS.superAdmin.geo.countries;
      case 'states': return API_ENDPOINTS.superAdmin.geo.states;
      case 'districts': return API_ENDPOINTS.superAdmin.geo.districts;
      case 'talukas': return API_ENDPOINTS.superAdmin.geo.talukas;
      case 'villages': return API_ENDPOINTS.superAdmin.geo.villages;
    }
  };

  const getLevelIcon = (level: GeoLevel) => {
    switch (level) {
      case 'countries': return <Globe className="w-5 h-5" />;
      case 'states': return <MapPin className="w-5 h-5" />;
      case 'districts': return <Building className="w-5 h-5" />;
      case 'talukas': return <Home className="w-5 h-5" />;
      case 'villages': return <Users className="w-5 h-5" />;
    }
  };

  const getFormFields = () => {
    switch (currentLevel) {
      case 'countries':
        return ['name', 'code', 'phone_code', 'currency'];
      case 'states':
        return ['name', 'code', 'capital'];
      case 'districts':
        return ['name', 'code'];
      case 'talukas':
        return ['name', 'code'];
      case 'villages':
        return ['name', 'pincode'];
    }
  };

  const getFieldLabel = (field: string) => {
    const labels: Record<string, string> = {
      name: 'Name',
      code: 'Code',
      phone_code: 'Phone Code',
      currency: 'Currency',
      capital: 'Capital',
      pincode: 'Pincode'
    };
    return labels[field] || field;
  };

  const filteredEntries = entries.filter(entry =>
    entry.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.code?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Geo Management</h1>
          <p className="text-gray-500">Manage countries, states, districts, talukas and villages</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowBulkImportModal(true)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Upload className="w-4 h-4" />
            Bulk Import
          </button>
          <button
            onClick={() => fetchEntries()}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <div className="flex gap-8">
          <button
            onClick={() => setActiveTab('hierarchy')}
            className={`pb-3 px-1 border-b-2 font-medium ${
              activeTab === 'hierarchy'
                ? 'border-[#570013] text-[#570013]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Geo Hierarchy
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`pb-3 px-1 border-b-2 font-medium ${
              activeTab === 'requests'
                ? 'border-[#570013] text-[#570013]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Village Requests
            {villageRequests.filter(r => r.status === 'pending').length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                {villageRequests.filter(r => r.status === 'pending').length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Hierarchy View */}
      {activeTab === 'hierarchy' && (
        <>
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm">
            <button
              onClick={() => { setBreadcrumb([]); setCurrentLevel('countries'); }}
              className="flex items-center gap-1 text-[#570013] hover:underline"
            >
              <Globe className="w-4 h-4" />
              All Countries
            </button>
            {breadcrumb.map((item, index) => (
              <div key={item.id} className="flex items-center">
                <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />
                <button
                  onClick={() => handleBreadcrumbClick(index + 1)}
                  className={`hover:underline ${
                    index === breadcrumb.length - 1 ? 'text-gray-900 font-medium' : 'text-[#570013]'
                  }`}
                >
                  {item.name}
                </button>
              </div>
            ))}
          </div>

          {/* Level Tabs */}
          <div className="flex items-center gap-2 bg-white p-2 rounded-lg border">
            {(['countries', 'states', 'districts', 'talukas', 'villages'] as GeoLevel[]).map((level) => (
              <button
                key={level}
                onClick={() => { setCurrentLevel(level); setBreadcrumb([]); }}
                disabled={level !== 'countries' && breadcrumb.length < (level === 'states' ? 1 : level === 'districts' ? 2 : level === 'talukas' ? 3 : 4)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${
                  currentLevel === level
                    ? 'bg-[#570013] text-white'
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                {getLevelIcon(level)}
                <span className="capitalize">{level}</span>
              </button>
            ))}
          </div>

          {/* Actions Bar */}
          <div className="flex items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${currentLevel}...`}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#570013] focus:border-transparent"
              />
            </div>
            <Button
              onClick={() => { setFormData({}); setShowAddModal(true); }}
              className="bg-[#570013]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add {currentLevel.slice(0, -1)}
            </Button>
          </div>

          {/* Entries Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-[#570013] animate-spin" />
              </div>
            ) : filteredEntries.length === 0 ? (
              <div className="text-center py-12">
                <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No {currentLevel} found</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                    {currentLevel === 'countries' && (
                      <>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone Code</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Currency</th>
                      </>
                    )}
                    {currentLevel !== 'villages' && (
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Children</th>
                    )}
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredEntries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-[#570013]/10">
                            {getLevelIcon(currentLevel)}
                          </div>
                          <span className="font-medium text-gray-900">{entry.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {entry.code || '-'}
                      </td>
                      {currentLevel === 'countries' && (
                        <>
                          <td className="px-6 py-4 text-gray-500">
                            {entry.phone_code || '-'}
                          </td>
                          <td className="px-6 py-4 text-gray-500">
                            {entry.currency || '-'}
                          </td>
                        </>
                      )}
                      {currentLevel !== 'villages' && (
                        <td className="px-6 py-4 text-right">
                          <span className="text-[#570013] font-medium">
                            {entry._count?.states || entry._count?.districts || entry._count?.talukas || entry._count?.villages || 0}
                          </span>
                        </td>
                      )}
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          entry.is_active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {entry.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {currentLevel !== 'villages' && (
                            <button
                              onClick={() => handleDrillDown(entry)}
                              className="p-2 hover:bg-gray-100 rounded-lg text-[#570013]"
                              title="View children"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => { setSelectedEntry(entry); setFormData({ name: entry.name, code: entry.code || '', status: 'active' }); setShowEditModal(true); }}
                            className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteEntry(entry)}
                            className="p-2 hover:bg-red-50 rounded-lg text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {/* Village Requests View */}
      {activeTab === 'requests' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b">
            <h3 className="font-semibold">Pending Village Requests</h3>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-[#570013] animate-spin" />
            </div>
          ) : villageRequests.length === 0 ? (
            <div className="text-center py-12">
              <Check className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <p className="text-gray-500">No pending requests</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Village</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requested By</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {villageRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className="font-medium">{request.village_name}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {request.village_name}, {request.taluka_name}, {request.district_name}, {request.state_name}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {request.requested_by || 'System'}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(request.created_at).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleApproveRequest(request)}
                          className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectRequest(request)}
                          className="px-3 py-1.5 border border-red-300 text-red-600 rounded-lg text-sm hover:bg-red-50"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md mx-4">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">Add {currentLevel.slice(0, -1)}</h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              {getFormFields().map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {getFieldLabel(field)} {field !== 'name' && <span className="text-gray-400">(optional)</span>}
                  </label>
                  <input
                    type="text"
                    value={formData[field] || ''}
                    onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#570013]"
                  />
                </div>
              ))}
            </div>
            <div className="p-4 border-t flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
              <Button onClick={handleAddEntry} disabled={processing} className="bg-[#570013]">
                {processing ? 'Adding...' : 'Add'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedEntry && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md mx-4">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">Edit {selectedEntry.name}</h3>
              <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              {getFormFields().map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {getFieldLabel(field)}
                  </label>
                  <input
                    type="text"
                    value={formData[field] || ''}
                    onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#570013]"
                  />
                </div>
              ))}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active !== 'false'}
                  onChange={(e) => setFormData({ ...formData, is_active: String(e.target.checked) })}
                  className="w-4 h-4 rounded border-gray-300 text-[#570013] focus:ring-[#570013]"
                />
                <label htmlFor="is_active" className="text-sm text-gray-700">Active</label>
              </div>
            </div>
            <div className="p-4 border-t flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowEditModal(false)}>Cancel</Button>
              <Button onClick={handleEditEntry} disabled={processing} className="bg-[#570013]">
                {processing ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      {showBulkImportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-2xl mx-4">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">Bulk Import Villages</h3>
              <button onClick={() => setShowBulkImportModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-500 mb-4">
                Paste CSV data with columns: name, pincode (optional)
              </p>
              <textarea
                value={bulkImportData}
                onChange={(e) => setBulkImportData(e.target.value)}
                placeholder="name, pincode
Shirpur, 425405
Nashik, 422001
..."
                className="w-full h-48 px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm resize-none"
              />
            </div>
            <div className="p-4 border-t flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowBulkImportModal(false)}>Cancel</Button>
              <Button onClick={handleBulkImport} disabled={processing} className="bg-[#570013]">
                {processing ? 'Importing...' : 'Import'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          {error}
          <button onClick={() => setError(null)} className="ml-2">×</button>
        </div>
      )}
    </div>
  );
}
