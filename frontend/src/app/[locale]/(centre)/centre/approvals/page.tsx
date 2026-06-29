'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { 
  CheckCircle, XCircle, Clock, User, FileText, Image,
  AlertTriangle, ChevronRight, Filter, Loader2, RefreshCw
} from 'lucide-react';
import { apiClient, API_ENDPOINTS } from '@/lib/api/client';
import { PaginationMeta } from '@/types';

interface ApprovalRequest {
  id: string;
  type: 'registration' | 'photo' | 'profile_update' | 'kyc';
  status: 'pending' | 'approved' | 'rejected';
  memberName: string;
  memberPhone: string;
  submittedBy: string;
  submittedAt: string;
  details: Record<string, any>;
}

interface ApprovalsResponse {
  approvals: ApprovalRequest[];
  pagination: PaginationMeta;
}

const typeIcons: Record<string, React.ReactNode> = {
  registration: <User className="w-4 h-4" />,
  photo: <Image className="w-4 h-4" />,
  profile_update: <FileText className="w-4 h-4" />,
  kyc: <CheckCircle className="w-4 h-4" />
};

const typeLabels: Record<string, string> = {
  registration: 'New Registration',
  photo: 'Photo Upload',
  profile_update: 'Profile Update',
  kyc: 'KYC Verification'
};

const typeColors: Record<string, string> = {
  registration: 'bg-blue-100 text-blue-700',
  photo: 'bg-purple-100 text-purple-700',
  profile_update: 'bg-orange-100 text-orange-700',
  kyc: 'bg-green-100 text-green-700'
};

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const [selectedApproval, setSelectedApproval] = useState<ApprovalRequest | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchApprovals = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string | number> = { page: 1, limit: 50 };
      if (filter !== 'all') params.status = filter;

      const response = await apiClient.get<ApprovalsResponse>(API_ENDPOINTS.centre.approvals.pending, params);
      
      if (response.success && response.data) {
        setApprovals(response.data.approvals || []);
        setPagination(response.meta || null);
      } else {
        setError('Failed to load approvals');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Approvals fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchApprovals();
  }, [fetchApprovals]);

  const pendingCount = approvals.filter(a => a.status === 'pending').length;
  const approvedCount = approvals.filter(a => a.status === 'approved').length;
  const rejectedCount = approvals.filter(a => a.status === 'rejected').length;

  const handleApprove = async (approval: ApprovalRequest) => {
    setActionLoading(approval.id);
    try {
      const response = await apiClient.post(`${API_ENDPOINTS.centre.approvals.pending}/${approval.id}/approve`);
      if (response.success) {
        fetchApprovals();
      }
    } catch (err) {
      console.error('Approve error:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = (approval: ApprovalRequest) => {
    setSelectedApproval(approval);
    setShowRejectModal(true);
  };

  const submitRejection = async () => {
    if (!selectedApproval || !rejectReason.trim()) return;
    
    setActionLoading(selectedApproval.id);
    try {
      const response = await apiClient.post(
        `${API_ENDPOINTS.centre.approvals.pending}/${selectedApproval.id}/reject`,
        { reason: rejectReason }
      );
      if (response.success) {
        setShowRejectModal(false);
        setRejectReason('');
        setSelectedApproval(null);
        fetchApprovals();
      }
    } catch (err) {
      console.error('Reject error:', err);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Approval Requests</h1>
          <p className="text-gray-500">{pendingCount} pending requests need your attention</p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
              <p className="text-sm text-gray-500">Pending</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{approvedCount}</p>
              <p className="text-sm text-gray-500">Approved</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{rejectedCount}</p>
              <p className="text-sm text-gray-500">Rejected</p>
            </div>
          </div>
        </div>
      </div>

      {/* Loading/Error States */}
      {loading ? (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
          <Loader2 className="w-8 h-8 text-[#570013] animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading approvals...</p>
        </div>
      ) : error ? (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-700 font-medium mb-4">{error}</p>
          <button
            onClick={fetchApprovals}
            className="flex items-center gap-2 px-4 py-2 bg-[#570013] text-white rounded-lg hover:bg-[#450010] mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      ) : approvals.length === 0 ? (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
          <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No approval requests</h3>
          <p className="text-gray-500">
            {filter === 'all' 
              ? 'There are no pending approval requests' 
              : `No ${filter} requests found`}
          </p>
        </div>
      ) : (
        /* Approvals List */
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="divide-y divide-gray-100">
            {approvals.map((approval) => (
              <div key={approval.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg ${typeColors[approval.type]}`}>
                    {typeIcons[approval.type]}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900">{approval.memberName}</h3>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full capitalize ${
                        approval.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        approval.status === 'approved' ? 'bg-green-100 text-green-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {approval.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{typeLabels[approval.type]}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                      <span>By: {approval.submittedBy}</span>
                      <span>{new Date(approval.submittedAt).toLocaleString()}</span>
                    </div>
                  </div>
                  {approval.status === 'pending' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApprove(approval)}
                        disabled={actionLoading === approval.id}
                        className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50"
                      >
                        {actionLoading === approval.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(approval)}
                        disabled={actionLoading === approval.id}
                        className="flex items-center gap-1 px-3 py-1.5 border border-red-300 text-red-600 text-sm rounded-lg hover:bg-red-50 disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  )}
                  {approval.status !== 'pending' && (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedApproval && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowRejectModal(false)} />
          <div className="relative bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold">Reject Request</h3>
            </div>
            <p className="text-gray-600 mb-4">
              You are about to reject the request for <strong>{selectedApproval.memberName}</strong>.
              Please provide a reason for rejection.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4"
              rows={4}
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={submitRejection}
                disabled={!rejectReason.trim() || actionLoading === selectedApproval.id}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {actionLoading === selectedApproval.id && <Loader2 className="w-4 h-4 animate-spin" />}
                Reject Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
