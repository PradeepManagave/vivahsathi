'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Calendar, Clock, Plus, Search, Filter,
  CheckCircle, Clock as ClockIcon, XCircle, Eye
} from 'lucide-react';

interface Appointment {
  id: string;
  memberName: string;
  profileId: string;
  type: string;
  date: string;
  time: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  notes: string;
}

const mockAppointments: Appointment[] = [
  { id: '1', memberName: 'Priya Patel', profileId: 'M12350', type: 'Profile Update', date: '2026-05-19', time: '10:00 AM', status: 'confirmed', notes: 'Update photos and horoscope' },
  { id: '2', memberName: 'Amit Kumar', profileId: 'M12351', type: 'KYC Verification', date: '2026-05-19', time: '11:30 AM', status: 'pending', notes: 'Bring Aadhaar and PAN card' },
  { id: '3', memberName: 'Sneha Desai', profileId: 'M12352', type: 'Photo Upload', date: '2026-05-19', time: '02:00 PM', status: 'confirmed', notes: 'Professional photoshoot' },
  { id: '4', memberName: 'Rahul Mehta', profileId: 'M12353', type: 'Membership Upgrade', date: '2026-05-20', time: '10:30 AM', status: 'pending', notes: 'Upgrade to Gold plan' },
  { id: '5', memberName: 'Kavita Singh', profileId: 'M12354', type: 'Profile Review', date: '2026-05-20', time: '03:00 PM', status: 'confirmed', notes: 'Review and optimize profile' },
];

const statusBadge = {
  confirmed: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  cancelled: 'bg-red-100 text-red-700',
  completed: 'bg-blue-100 text-blue-700'
};

const statusIcon = {
  confirmed: <CheckCircle className="w-4 h-4" />,
  pending: <ClockIcon className="w-4 h-4" />,
  cancelled: <XCircle className="w-4 h-4" />,
  completed: <CheckCircle className="w-4 h-4" />
};

export default function StaffAppointmentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredAppointments = mockAppointments.filter(apt => {
    const matchesSearch = apt.memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          apt.profileId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          apt.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-500">Manage member appointments</p>
        </div>
        <Link
          href="/staff/appointments?action=create"
          className="flex items-center gap-2 px-4 py-2 bg-[#570013] text-white rounded-lg hover:bg-[#450010] transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Appointment
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, profile ID, or type..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#570013] focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#570013] focus:border-transparent"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Appointments List */}
      <div className="space-y-4">
        {filteredAppointments.map((apt) => (
          <div key={apt.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#570013]/10 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-[#570013]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{apt.memberName}</h3>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${statusBadge[apt.status]}`}>
                      {statusIcon[apt.status]}
                      {apt.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{apt.profileId} &middot; {apt.type}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {apt.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {apt.time}
                    </span>
                  </div>
                  {apt.notes && (
                    <p className="text-sm text-gray-500 mt-2 italic">{apt.notes}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Eye className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredAppointments.length === 0 && (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No appointments found</p>
        </div>
      )}
    </div>
  );
}
