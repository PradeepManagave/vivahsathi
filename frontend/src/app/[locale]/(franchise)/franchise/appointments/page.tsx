'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Calendar, Clock, User, Video, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Appointment {
  id: string; time: string; memberName: string; type: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  memberPhone?: string; notes?: string;
}

export default function FranchiseAppointmentsPage() {
  const [apps, setApps] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try { const res = await apiClient.get<{ appointments: Appointment[] }>('/franchise/appointments', { limit: 100 }); if (res.success && res.data) setApps(res.data.appointments || []); }
    catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const handleAction = async (id: string, action: 'confirm' | 'cancel') => {
    try { await apiClient.post(`/franchise/appointments/${id}/${action}`); fetch(); } catch {}
  };

  const statusColors = { scheduled: 'bg-blue-100 text-blue-700', confirmed: 'bg-green-100 text-green-700', completed: 'bg-gray-100 text-gray-500', cancelled: 'bg-red-100 text-red-700' };

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">Appointments</h1><p className="text-gray-500">{apps.length} total appointments</p></div>
      <div className="space-y-3">{apps.length === 0 ? <Card className="p-8 text-center text-gray-400"><Calendar className="w-10 h-10 mx-auto mb-2 opacity-50" /><p>No appointments found</p></Card> : apps.map(a => (
        <Card key={a.id} className="p-4">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-gray-100 rounded-lg"><Calendar className="w-5 h-5 text-gray-500" /></div>
            <div className="flex-1 min-w-0">
              <p className="font-medium">{a.memberName}</p>
              <div className="flex items-center gap-3 text-sm text-gray-500 mt-0.5">
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{a.time}</span>
                <span className="flex items-center gap-1"><Video className="w-3.5 h-3.5" />{a.type}</span>
              </div>
            </div>
            <Badge className={statusColors[a.status]}>{a.status}</Badge>
            {a.status === 'scheduled' && <div className="flex gap-1"><button onClick={() => handleAction(a.id, 'confirm')} className="p-1.5 text-green-600 hover:bg-green-50 rounded"><CheckCircle className="w-4 h-4" /></button><button onClick={() => handleAction(a.id, 'cancel')} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><XCircle className="w-4 h-4" /></button></div>}
          </div>
        </Card>
      ))}</div>
    </div>
  );
}
