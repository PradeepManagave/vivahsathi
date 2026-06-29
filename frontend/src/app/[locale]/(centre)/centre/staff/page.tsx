'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { 
  UserCog, Plus, Edit, Trash2, Shield, Check,
  User, MoreVertical, Mail, Phone, Loader2, RefreshCw, AlertTriangle, X
} from 'lucide-react';
import { apiClient, API_ENDPOINTS } from '@/lib/api/client';

interface Staff {
  id: string;
  userId?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  phoneCountryCode?: string;
  role: string;
  designation?: string;
  permissions: string[];
  isHead: boolean;
  isActive: boolean;
  canLogin: boolean;
  joinedAt: string;
}

const roleColors: Record<string, string> = {
  centre_admin: 'bg-purple-100 text-purple-700',
  counselor: 'bg-blue-100 text-blue-700',
  coordinator: 'bg-green-100 text-green-700',
  data_entry: 'bg-gray-100 text-gray-700'
};

const roleLabels: Record<string, string> = {
  centre_admin: 'Centre Admin',
  manager: 'Centre Manager',
  counselor: 'Counselor',
  coordinator: 'Coordinator',
  data_entry: 'Data Entry'
};

export default function StaffPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<{ staff: Staff[] }>(API_ENDPOINTS.centre.staff);
      
      if (response.success && response.data) {
        setStaff(response.data.staff || []);
      } else {
        setError('Failed to load staff');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Staff fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const handleRemoveStaff = async (staffId: string) => {
    if (!confirm('Are you sure you want to remove this staff member?')) return;
    
    setActionLoading(staffId);
    try {
      const response = await apiClient.delete(`${API_ENDPOINTS.centre.removeStaff(staffId)}`);
      if (response.success) {
        fetchStaff();
      }
    } catch (err) {
      console.error('Remove staff error:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleAddStaff = async (staffData: Partial<Staff>) => {
    setActionLoading('add');
    try {
      const response = await apiClient.post(API_ENDPOINTS.centre.addStaff, staffData);
      if (response.success) {
        setShowAddModal(false);
        fetchStaff();
      }
    } catch (err) {
      console.error('Add staff error:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateStaff = async (staffId: string, staffData: Partial<Staff>) => {
    setActionLoading(staffId);
    try {
      const response = await apiClient.patch(API_ENDPOINTS.centre.updateStaff(staffId), staffData);
      if (response.success) {
        setEditingStaff(null);
        fetchStaff();
      }
    } catch (err) {
      console.error('Update staff error:', err);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-gray-500">Manage centre staff and permissions</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#570013] text-white rounded-lg hover:bg-[#450010]"
        >
          <Plus className="w-4 h-4" />
          Add Staff
        </button>
      </div>

      {/* Loading/Error States */}
      {loading ? (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
          <Loader2 className="w-8 h-8 text-[#570013] animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading staff...</p>
        </div>
      ) : error ? (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-700 font-medium mb-4">{error}</p>
          <button
            onClick={fetchStaff}
            className="flex items-center gap-2 px-4 py-2 bg-[#570013] text-white rounded-lg hover:bg-[#450010] mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      ) : staff.length === 0 ? (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
          <UserCog className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No staff members</h3>
          <p className="text-gray-500 mb-4">Add staff to manage your centre</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#570013] text-white rounded-lg hover:bg-[#450010] mx-auto"
          >
            <Plus className="w-4 h-4" />
            Add Staff
          </button>
        </div>
      ) : (
        /* Staff List */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {staff.map((member) => (
            <div key={member.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#570013] rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {member.firstName[0]}{member.lastName[0]}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{member.firstName} {member.lastName}</h3>
                      {member.isHead && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-[#fdc34d] text-[#570013] rounded-full flex items-center gap-1">
                          <Shield className="w-3 h-3" /> Head
                        </span>
                      )}
                    </div>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${roleColors[member.role] || 'bg-gray-100 text-gray-700'}`}>
                      {roleLabels[member.role] || member.role}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditingStaff(member)}
                    className="p-2 text-gray-400 hover:text-[#570013] hover:bg-gray-100 rounded-lg"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleRemoveStaff(member.id)}
                    disabled={actionLoading === member.id}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
                  >
                    {actionLoading === member.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="w-4 h-4" />
                  {member.email}
                </div>
                {member.phone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4" />
                    {member.phoneCountryCode || '+91'} {member.phone}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-2">Permissions</p>
                <div className="flex flex-wrap gap-1">
                  {member.permissions.includes('all') ? (
                    <span className="px-2 py-0.5 text-xs bg-[#570013]/10 text-[#570013] rounded">
                      All Permissions
                    </span>
                  ) : (
                    member.permissions.map(perm => (
                      <span key={perm} className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded capitalize">
                        {perm.replace('_', ' ')}
                      </span>
                    ))
                  )}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <span>Joined: {new Date(member.joinedAt).toLocaleDateString()}</span>
                <span className={member.isActive ? 'text-green-600' : 'text-gray-400'}>
                  ● {member.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Staff Modal */}
      {(showAddModal || editingStaff) && (
        <StaffModal 
          staff={editingStaff}
          onClose={() => { setShowAddModal(false); setEditingStaff(null); }}
          onSubmit={editingStaff 
            ? (data) => handleUpdateStaff(editingStaff.id, data)
            : handleAddStaff
          }
          loading={actionLoading === 'add' || actionLoading === editingStaff?.id}
        />
      )}
    </div>
  );
}

interface StaffFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  permissions: string[];
  isHead: boolean;
}

function StaffModal({ staff, onClose, onSubmit, loading }: {
  staff: Staff | null;
  onClose: () => void;
  onSubmit: (data: Partial<Staff>) => void;
  loading: boolean;
}) {
  const [formData, setFormData] = useState<StaffFormData>({
    firstName: staff?.firstName || '',
    lastName: staff?.lastName || '',
    email: staff?.email || '',
    phone: staff?.phone || '',
    role: staff?.role || 'counselor',
    permissions: staff?.permissions || ['register', 'appointments'],
    isHead: staff?.isHead || false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const togglePermission = (perm: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(perm)
        ? prev.permissions.filter(p => p !== perm)
        : [...prev.permissions, perm]
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            {staff ? 'Edit Staff' : 'Add New Staff'}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input 
                type="text" 
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg" 
                placeholder="Enter first name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input 
                type="text" 
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg" 
                placeholder="Enter last name"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input 
                type="email" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg" 
                placeholder="email@centre.com"
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
                placeholder="9876543210"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select 
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="centre_admin">Centre Admin</option>
              <option value="manager">Centre Manager</option>
              <option value="counselor">Counselor</option>
              <option value="coordinator">Coordinator</option>
              <option value="data_entry">Data Entry</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Permissions</label>
            <div className="grid grid-cols-2 gap-2">
              {['register', 'appointments', 'payments', 'reports', 'staff'].map(perm => (
                <label key={perm} className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={formData.permissions.includes(perm)}
                    onChange={() => togglePermission(perm)}
                    className="rounded border-gray-300" 
                  />
                  <span className="text-sm capitalize">{perm.replace('_', ' ')}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              id="isHead" 
              checked={formData.isHead}
              onChange={(e) => setFormData({...formData, isHead: e.target.checked})}
              className="rounded border-gray-300" 
            />
            <label htmlFor="isHead" className="text-sm">Set as Centre Head</label>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="px-4 py-2 bg-[#570013] text-white rounded-lg hover:bg-[#450010] disabled:opacity-50 flex items-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {staff ? 'Update Staff' : 'Add Staff'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
