'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { 
  Calendar, Clock, User, Plus, ChevronLeft, ChevronRight,
  Video, UserCheck, RefreshCw, MessageSquare, X,
  Check, Phone, Mail, Loader2, AlertTriangle
} from 'lucide-react';
import { apiClient, API_ENDPOINTS } from '@/lib/api/client';

interface Slot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  type: string;
  staffName?: string;
  maxBookings: number;
  currentBookings: number;
}

interface Appointment {
  id: string;
  time: string;
  memberName: string;
  memberPhone: string;
  type: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
}

const typeIcons: Record<string, React.ReactNode> = {
  video_kyc: <Video className="w-4 h-4" />,
  profile_setup: <User className="w-4 h-4" />,
  renewal: <RefreshCw className="w-4 h-4" />,
  counseling: <MessageSquare className="w-4 h-4" />
};

const typeColors: Record<string, string> = {
  video_kyc: 'bg-purple-100 text-purple-700',
  profile_setup: 'bg-blue-100 text-blue-700',
  renewal: 'bg-green-100 text-green-700',
  counseling: 'bg-orange-100 text-orange-700'
};

export default function AppointmentsPage() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBookModal, setShowBookModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const [slotsRes, appointmentsRes] = await Promise.all([
        apiClient.get<{ slots: Slot[] }>(API_ENDPOINTS.centre.appointmentSlots, {
          startDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString().split('T')[0],
          endDate: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString().split('T')[0]
        }),
        apiClient.get<{ appointments: Appointment[] }>(API_ENDPOINTS.centre.appointments, { date: today })
      ]);

      if (slotsRes.success && slotsRes.data) {
        setSlots(slotsRes.data.slots || []);
      }
      if (appointmentsRes.success && appointmentsRes.data) {
        setAppointments(appointmentsRes.data.appointments || []);
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Appointments fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [currentDate]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }
    
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const getSlotsForDate = (date: Date) => {
    const dateStr = formatDate(date);
    return slots.filter(slot => slot.date === dateStr);
  };

  const navigateMonth = (direction: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
  };

  const handleBookSlot = (slot: Slot) => {
    setSelectedSlot(slot);
    setShowBookModal(true);
  };

  const handleCreateSlot = async (slotData: Partial<Slot>) => {
    setActionLoading(true);
    try {
      const response = await apiClient.post(API_ENDPOINTS.centre.appointmentSlots, slotData);
      if (response.success) {
        setShowCreateModal(false);
        fetchAppointments();
      }
    } catch (err) {
      console.error('Create slot error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleBookAppointment = async (appointmentData: { memberName: string; phone: string; email?: string; notes?: string }) => {
    if (!selectedSlot) return;
    
    setActionLoading(true);
    try {
      const response = await apiClient.post(
        API_ENDPOINTS.centre.bookAppointment(selectedSlot.id),
        appointmentData
      );
      if (response.success) {
        setShowBookModal(false);
        setSelectedSlot(null);
        fetchAppointments();
      }
    } catch (err) {
      console.error('Book appointment error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-500">Manage appointment slots and bookings</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setView('calendar')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${view === 'calendar' ? 'bg-white shadow text-[#570013]' : 'text-gray-600'}`}
            >
              Calendar
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${view === 'list' ? 'bg-white shadow text-[#570013]' : 'text-gray-600'}`}
            >
              List
            </button>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#570013] text-white rounded-lg hover:bg-[#450010]"
          >
            <Plus className="w-4 h-4" />
            Create Slot
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
          <Loader2 className="w-8 h-8 text-[#570013] animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading appointments...</p>
        </div>
      ) : error ? (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-700 font-medium mb-4">{error}</p>
          <button
            onClick={fetchAppointments}
            className="flex items-center gap-2 px-4 py-2 bg-[#570013] text-white rounded-lg hover:bg-[#450010] mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      ) : view === 'calendar' ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigateMonth(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-3 py-1.5 text-sm hover:bg-gray-100 rounded-lg"
              >
                Today
              </button>
              <button
                onClick={() => navigateMonth(1)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
            {getDaysInMonth(currentDate).map((date, index) => {
              if (!date) {
                return <div key={index} className="h-24" />;
              }
              
              const isToday = formatDate(date) === formatDate(new Date());
              const daySlots = getSlotsForDate(date);
              
              return (
                <div
                  key={index}
                  className={`h-24 border border-gray-100 rounded-lg p-1 ${
                    isToday ? 'bg-[#570013]/5 border-[#570013]' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className={`text-sm font-medium mb-1 ${isToday ? 'text-[#570013]' : 'text-gray-700'}`}>
                    {date.getDate()}
                  </div>
                  <div className="space-y-0.5">
                    {daySlots.slice(0, 2).map(slot => (
                      <button
                        key={slot.id}
                        onClick={() => handleBookSlot(slot)}
                        className={`w-full text-left text-xs px-1.5 py-0.5 rounded truncate ${typeColors[slot.type] || 'bg-gray-100 text-gray-700'}`}
                      >
                        {slot.startTime}
                      </button>
                    ))}
                    {daySlots.length > 2 && (
                      <p className="text-xs text-gray-500 pl-1">+{daySlots.length - 2} more</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Today&apos;s Schedule</h2>
          </div>
          {appointments.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {appointments.map(apt => (
                <div key={apt.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div className="text-center min-w-[60px]">
                      <p className="text-lg font-bold text-gray-900">{apt.time.split(' ')[0]}</p>
                      <p className="text-xs text-gray-500">{apt.time.split(' ')[1]}</p>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900">{apt.memberName}</p>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${typeColors[apt.type] || 'bg-gray-100 text-gray-700'}`}>
                          {typeIcons[apt.type]} {apt.type.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {apt.memberPhone}
                        </span>
                      </div>
                    </div>
                    <span className={`
                      px-2 py-1 text-xs font-medium rounded-full capitalize
                      ${apt.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}
                    `}>
                      {apt.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No appointments scheduled for today</p>
            </div>
          )}
        </div>
      )}

      {/* Create Slot Modal */}
      {showCreateModal && (
        <SlotCreateModal 
          onClose={() => setShowCreateModal(false)} 
          onSubmit={handleCreateSlot}
          loading={actionLoading}
        />
      )}

      {/* Book Appointment Modal */}
      {showBookModal && selectedSlot && (
        <BookAppointmentModal 
          slot={selectedSlot}
          onClose={() => { setShowBookModal(false); setSelectedSlot(null); }}
          onSubmit={handleBookAppointment}
          loading={actionLoading}
        />
      )}
    </div>
  );
}

interface SlotFormData {
  type: string;
  date: string;
  startTime: string;
  endTime: string;
  maxBookings: string;
}

function SlotCreateModal({ onClose, onSubmit, loading }: { 
  onClose: () => void; 
  onSubmit: (data: Partial<Slot>) => void;
  loading: boolean;
}) {
  const [formData, setFormData] = useState<SlotFormData>({
    type: 'video_kyc',
    date: new Date().toISOString().split('T')[0],
    startTime: '10:00',
    endTime: '11:00',
    maxBookings: '1'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      type: formData.type,
      date: formData.date,
      startTime: formData.startTime,
      endTime: formData.endTime,
      maxBookings: parseInt(formData.maxBookings),
      currentBookings: 0
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
        <h3 className="text-lg font-semibold mb-4">Create Appointment Slot</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Appointment Type</label>
            <select 
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="video_kyc">Video KYC</option>
              <option value="profile_setup">Profile Setup</option>
              <option value="renewal">Renewal</option>
              <option value="counseling">Counseling</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input 
              type="date" 
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg" 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
              <input 
                type="time" 
                value={formData.startTime}
                onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
              <input 
                type="time" 
                value={formData.endTime}
                onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg" 
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Bookings</label>
            <input 
              type="number" 
              min="1" 
              max="10" 
              value={formData.maxBookings}
              onChange={(e) => setFormData({...formData, maxBookings: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg" 
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
              Create Slot
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface BookFormData {
  memberName: string;
  phone: string;
  email: string;
  notes: string;
}

function BookAppointmentModal({ slot, onClose, onSubmit, loading }: { 
  slot: Slot;
  onClose: () => void; 
  onSubmit: (data: BookFormData) => void;
  loading: boolean;
}) {
  const [formData, setFormData] = useState<BookFormData>({
    memberName: '',
    phone: '',
    email: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
        <h3 className="text-lg font-semibold mb-4">Book Appointment</h3>
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <p className="text-sm text-gray-500">Slot Details</p>
          <p className="font-medium">{slot.date} | {slot.startTime} - {slot.endTime}</p>
          <p className="text-sm capitalize">{slot.type.replace('_', ' ')}</p>
          <p className="text-sm text-gray-500">{slot.currentBookings}/{slot.maxBookings} booked</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Member Name</label>
            <input 
              type="text" 
              value={formData.memberName}
              onChange={(e) => setFormData({...formData, memberName: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg" 
              placeholder="Enter member name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input 
              type="tel" 
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg" 
              placeholder="9876543210"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email (optional)</label>
            <input 
              type="email" 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg" 
              placeholder="email@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea 
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg" 
              rows={2} 
              placeholder="Any special notes..."
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Book Appointment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
