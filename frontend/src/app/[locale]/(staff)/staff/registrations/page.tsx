'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  UserPlus, Search, Filter, Plus, 
  CheckCircle, Clock, XCircle, Eye
} from 'lucide-react';

interface Registration {
  id: string;
  profileId: string;
  name: string;
  gender: string;
  age: number;
  phone: string;
  registeredBy: string;
  status: 'completed' | 'pending' | 'cancelled';
  date: string;
  time: string;
}

const mockRegistrations: Registration[] = [
  { id: '1', profileId: 'M12345', name: 'Rohit Mehta', gender: 'Male', age: 28, phone: '+91 98765 43210', registeredBy: 'Rahul Sharma', status: 'completed', date: '2026-05-19', time: '10:30 AM' },
  { id: '2', profileId: 'M12346', name: 'Anjali Singh', gender: 'Female', age: 26, phone: '+91 98765 43211', registeredBy: 'Rahul Sharma', status: 'pending', date: '2026-05-19', time: '11:15 AM' },
  { id: '3', profileId: 'M12347', name: 'Vikram Joshi', gender: 'Male', age: 32, phone: '+91 98765 43212', registeredBy: 'Priya Patel', status: 'completed', date: '2026-05-18', time: '02:45 PM' },
  { id: '4', profileId: 'M12348', name: 'Sneha Desai', gender: 'Female', age: 24, phone: '+91 98765 43213', registeredBy: 'Rahul Sharma', status: 'completed', date: '2026-05-18', time: '04:00 PM' },
  { id: '5', profileId: 'M12349', name: 'Karan Malhotra', gender: 'Male', age: 30, phone: '+91 98765 43214', registeredBy: 'Priya Patel', status: 'cancelled', date: '2026-05-17', time: '11:00 AM' },
];

const statusBadge = {
  completed: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  cancelled: 'bg-red-100 text-red-700'
};

const statusIcon = {
  completed: <CheckCircle className="w-4 h-4" />,
  pending: <Clock className="w-4 h-4" />,
  cancelled: <XCircle className="w-4 h-4" />
};

export default function StaffRegistrationsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredRegistrations = mockRegistrations.filter(reg => {
    const matchesSearch = reg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          reg.profileId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          reg.phone.includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || reg.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Registrations</h1>
          <p className="text-gray-500">Manage member registrations</p>
        </div>
        <Link
          href="/staff/registrations?action=new"
          className="flex items-center gap-2 px-4 py-2 bg-[#570013] text-white rounded-lg hover:bg-[#450010] transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Registration
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, profile ID, or phone..."
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
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Registrations Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profile</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registered By</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredRegistrations.map((reg) => (
                <tr key={reg.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#570013]/10 rounded-full flex items-center justify-center">
                        <span className="text-[#570013] font-medium">{reg.name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{reg.name}</p>
                        <p className="text-sm text-gray-500">{reg.profileId} &middot; {reg.gender}, {reg.age}y</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-900">{reg.phone}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-900">{reg.registeredBy}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-900">{reg.date}</p>
                    <p className="text-xs text-gray-500">{reg.time}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${statusBadge[reg.status]}`}>
                      {statusIcon[reg.status]}
                      {reg.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <Eye className="w-4 h-4 text-gray-600" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredRegistrations.length === 0 && (
          <div className="text-center py-12">
            <UserPlus className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No registrations found</p>
          </div>
        )}
      </div>
    </div>
  );
}
