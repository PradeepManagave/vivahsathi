'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Shield, BadgeCheck, Ban, CheckCircle, Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import { apiClient, API_ENDPOINTS } from '@/lib/api/client';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface MemberProfile {
  id: string;
  firstName: string; lastName: string; email?: string; phone?: string;
  gender: string; dateOfBirth?: string; age?: number;
  religion?: string; caste?: string; subcaste?: string;
  maritalStatus?: string; education?: string; occupation?: string;
  income?: string; city?: string; state?: string; country?: string;
  status: string; membershipPlan?: string; membershipExpiry?: string;
  profilePhoto?: string; isVerified?: boolean;
  createdAt: string; updatedAt: string;
}

export default function MemberDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [member, setMember] = useState<MemberProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchMember = async () => {
    setLoading(true); setError(null);
    try {
      const res = await apiClient.get<MemberProfile>(`${API_ENDPOINTS.superAdmin.members}/${params.id}`);
      if (res.success && res.data) setMember(res.data);
      else setError('Member not found');
    } catch { setError('Network error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchMember(); }, [params.id]);

  const handleAction = async (action: 'approve' | 'ban' | 'verify') => {
    if (!member) return;
    setActionLoading(action);
    try {
      const endpoint = action === 'approve' ? API_ENDPOINTS.superAdmin.approveMember(member.id)
        : action === 'ban' ? API_ENDPOINTS.superAdmin.banMember(member.id)
        : API_ENDPOINTS.superAdmin.verifyMember(member.id);
      const res = await apiClient.post(endpoint);
      if (res.success) fetchMember();
    } catch { console.error('Action failed'); }
    finally { setActionLoading(null); }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 text-[#570013] animate-spin" /></div>;
  if (error) return (
    <div className="text-center py-12"><AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" /><p className="text-gray-700 mb-4">{error}</p>
      <button onClick={fetchMember} className="px-4 py-2 bg-[#570013] text-white rounded-lg flex items-center gap-2 mx-auto"><RefreshCw className="w-4 h-4" />Retry</button>
    </div>
  );
  if (!member) return null;

  return (
    <div className="space-y-6">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-600 hover:text-[#570013]"><ArrowLeft className="w-4 h-4" />Back</button>

      <Card className="p-6">
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="w-24 h-24 bg-[#570013] rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-3xl font-bold text-white">{member.firstName[0]}{member.lastName[0]}</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold">{member.firstName} {member.lastName}</h1>
              {member.isVerified && <BadgeCheck className="w-6 h-6 text-blue-500" />}
              <Badge className={member.status === 'active' ? 'bg-green-100 text-green-700' : member.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}>{member.status}</Badge>
            </div>
            <p className="text-gray-500 mt-1 capitalize">{member.gender} • {member.age || 'N/A'} years</p>
            <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600">
              {member.email && <span className="flex items-center gap-1"><Mail className="w-4 h-4" />{member.email}</span>}
              {member.phone && <span className="flex items-center gap-1"><Phone className="w-4 h-4" />{member.phone}</span>}
              {member.city && <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{member.city}{member.state ? `, ${member.state}` : ''}</span>}
              <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />Joined {new Date(member.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          {member.status === 'pending' && (
            <div className="flex gap-2">
              <button onClick={() => handleAction('approve')} disabled={actionLoading === 'approve'} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"><Loader2 className={`w-4 h-4 ${actionLoading === 'approve' ? 'animate-spin' : 'hidden'}`} /><CheckCircle className="w-4 h-4" />Approve</button>
              <button onClick={() => handleAction('ban')} disabled={actionLoading === 'ban'} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"><Ban className="w-4 h-4" />Ban</button>
            </div>
          )}
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-5"><h3 className="font-semibold mb-3 flex items-center gap-2"><Shield className="w-4 h-4" />Personal Info</h3>
          <dl className="space-y-2 text-sm">{[
            ['Religion', member.religion], ['Caste', member.caste], ['Subcaste', member.subcaste],
            ['Marital Status', member.maritalStatus], ['Education', member.education],
            ['Occupation', member.occupation], ['Income', member.income]
          ].filter(([, v]) => v).map(([k, v]) => (
            <div key={k as string} className="flex justify-between"><dt className="text-gray-500">{k}</dt><dd className="font-medium">{v}</dd></div>
          ))}</dl>
        </Card>
        <Card className="p-5"><h3 className="font-semibold mb-3 flex items-center gap-2"><BadgeCheck className="w-4 h-4" />Membership</h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-gray-500">Plan</dt><dd className="font-medium">{member.membershipPlan || 'Free'}</dd></div>
            {member.membershipExpiry && <div className="flex justify-between"><dt className="text-gray-500">Expires</dt><dd className="font-medium">{new Date(member.membershipExpiry).toLocaleDateString()}</dd></div>}
          </dl>
        </Card>
      </div>
    </div>
  );
}
