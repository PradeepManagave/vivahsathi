'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Calendar, Clock, MapPin, Video, CheckCircle, 
  ChevronLeft, ChevronRight, Loader2, AlertCircle,
  Building2, Wifi
} from 'lucide-react';
import { apiClient, API_ENDPOINTS } from '@/lib/api/client';
import { Button } from '@/components/ui/button';

interface KycSlot {
  id: string;
  centre_id: string;
  centre_name: string;
  slot_date: string;
  start_time: string;
  end_time: string;
  kyc_type: 'centre' | 'online';
  max_participants: number;
  current_participants: number;
  status: string;
}

interface KycSession {
  id: string;
  status: string;
  scheduled_at: string;
  room_url?: string;
}

const colorClasses = {
  maroon: 'bg-[#570013]/10 text-[#570013]',
  gold: 'bg-[#fdc34d]/20 text-[#a67c00]',
  green: 'bg-green-100 text-green-600',
  blue: 'bg-blue-100 text-blue-600'
};

interface KycStatusData {
  status: string;
  hasVerifiedBadge: boolean;
  lastKycDate: string | null;
  currentSession?: KycSession | null;
  pendingChanges?: Array<{ field: string; oldValue: string; newValue: string }>;
}

export default function ScheduleKycPage() {
  const [step, setStep] = useState(1);
  const [kycType, setKycType] = useState<'centre' | 'online' | null>(null);
  const [slots, setSlots] = useState<KycSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<KycSlot | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<KycSession | null>(null);
  const [kycStatus, setKycStatus] = useState<KycStatusData | null>(null);

  const fetchSlots = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.get<KycSlot[]>(API_ENDPOINTS.videoKyc.slots);
      if (response.success && response.data) {
        setSlots(response.data);
      }
    } catch {
      setError('Failed to load available slots');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchKycStatus = useCallback(async () => {
    try {
      const response = await apiClient.get<KycStatusData>(API_ENDPOINTS.videoKyc.status);
      if (response.success && response.data) {
        setKycStatus(response.data);
        if (response.data.currentSession) {
          setSession(response.data.currentSession as KycSession);
        }
      }
    } catch {
      // Ignore errors
    }
  }, []);

  useEffect(() => {
    fetchSlots();
    fetchKycStatus();
  }, [fetchSlots, fetchKycStatus]);

  const handleKycTypeSelect = (type: 'centre' | 'online') => {
    setKycType(type);
    setStep(2);
  };

  const handleSlotSelect = (slot: KycSlot) => {
    setSelectedSlot(slot);
    setStep(3);
  };

  const handleDateSelect = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const availableSlots = slots.filter(s => s.slot_date === dateStr && s.status === 'available');
    if (availableSlots.length > 0) {
      setSelectedSlot(availableSlots[0]);
      setStep(3);
    }
  };

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);

    try {
      let response;
      if (kycType === 'online') {
        response = await apiClient.post<KycSession>(API_ENDPOINTS.videoKyc.createSession);
      } else {
        response = await apiClient.post<KycSession>(API_ENDPOINTS.videoKyc.bookSlot, {
          slotId: selectedSlot?.id
        });
      }

      if (response.success && response.data) {
        setSession(response.data);
        setStep(4);
      } else {
        throw new Error(response.error?.message || 'Failed to book KYC');
      }
    } catch (err: unknown) {
      const apiError = (err as { message?: string })?.message || 'An error occurred';
      setError(apiError);
    } finally {
      setLoading(false);
    }
  };

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

  const hasSlotsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return slots.some(s => s.slot_date === dateStr && s.status === 'available');
  };

  const getSlotsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return slots.filter(s => s.slot_date === dateStr && s.status === 'available');
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isPast = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const days = getDaysInMonth(currentMonth);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Video KYC Verification</h1>
          <p className="text-gray-600">Complete your identity verification to get verified badge</p>
        </div>

        {/* Current Status Banner */}
        {kycStatus?.hasVerifiedBadge && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <div>
              <p className="font-medium text-green-800">Your profile is verified</p>
              <p className="text-sm text-green-600">
                Verified on {kycStatus.lastKycDate ? new Date(kycStatus.lastKycDate).toLocaleDateString('en-IN') : 'N/A'}
              </p>
            </div>
          </div>
        )}

        {/* Step Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-semibold
                  ${step >= s ? 'bg-[#570013] text-white' : 'bg-gray-200 text-gray-500'}
                `}>
                  {step > s ? <CheckCircle className="w-5 h-5" /> : s}
                </div>
                {s < 4 && (
                  <div className={`w-16 h-1 mx-2 ${step > s ? 'bg-[#570013]' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-8 mt-2 text-sm">
            <span className={step >= 1 ? 'text-[#570013] font-medium' : 'text-gray-400'}>Select Type</span>
            <span className={step >= 2 ? 'text-[#570013] font-medium' : 'text-gray-400'}>Choose Slot</span>
            <span className={step >= 3 ? 'text-[#570013] font-medium' : 'text-gray-400'}>Confirm</span>
            <span className={step >= 4 ? 'text-[#570013] font-medium' : 'text-gray-400'}>Complete</span>
          </div>
        </div>

        {/* Step 1: Select KYC Type */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* At Centre Option */}
              <button
                onClick={() => handleKycTypeSelect('centre')}
                className="p-6 bg-white rounded-xl border-2 border-gray-200 hover:border-[#570013] transition-all text-left group"
              >
                <div className="w-14 h-14 rounded-xl bg-[#570013]/10 flex items-center justify-center mb-4 group-hover:bg-[#570013] transition-colors">
                  <Building2 className="w-7 h-7 text-[#570013] group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">At Franchise Centre</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Visit your nearest franchise centre for in-person video verification with our staff.
                </p>
                <ul className="text-sm text-gray-500 space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Personal assistance
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Document verification
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Instant verification
                  </li>
                </ul>
              </button>

              {/* Online Option */}
              <button
                onClick={() => handleKycTypeSelect('online')}
                className="p-6 bg-white rounded-xl border-2 border-gray-200 hover:border-[#570013] transition-all text-left group"
              >
                <div className="w-14 h-14 rounded-xl bg-[#fdc34d]/20 flex items-center justify-center mb-4 group-hover:bg-[#fdc34d] transition-colors">
                  <Wifi className="w-7 h-7 text-[#a67c00] group-hover:text-[#570013] transition-colors" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Online Self-Verification</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Complete verification from anywhere using your smartphone or laptop.
                </p>
                <ul className="text-sm text-gray-500 space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    24/7 available
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    No travel required
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Quick process
                  </li>
                </ul>
              </button>
            </div>

            {kycStatus?.pendingChanges && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-800">Re-verification Required</p>
                  <p className="text-sm text-yellow-600">
                    Your profile was recently updated. Please complete KYC to maintain your verified badge.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Calendar View */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-semibold">
                {currentMonth.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
              </h2>
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="grid grid-cols-7 bg-gray-50">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="py-3 text-center text-sm font-medium text-gray-600">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7">
                {days.map((date, index) => (
                  <div key={index} className="min-h-[80px] border-t border-gray-100 p-1">
                    {date && (
                      <button
                        onClick={() => !isPast(date) && handleDateSelect(date)}
                        disabled={isPast(date)}
                        className={`
                          w-full h-full rounded-lg p-2 text-sm transition-all
                          ${isPast(date) ? 'text-gray-300 cursor-not-allowed' : ''}
                          ${isToday(date) ? 'bg-[#570013]/10 font-bold text-[#570013]' : ''}
                          ${hasSlotsForDate(date) && !isPast(date) ? 'bg-green-50 hover:bg-green-100 cursor-pointer' : ''}
                        `}
                      >
                        <span className="block">{date.getDate()}</span>
                        {hasSlotsForDate(date) && (
                          <span className="block text-xs text-green-600 mt-1">
                            {getSlotsForDate(date).length} slots
                          </span>
                        )}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Time Slots for Selected Date */}
            {selectedSlot && (
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h3 className="font-semibold mb-4">Available Slots</h3>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                  {getSlotsForDate(new Date(selectedSlot.slot_date)).map(slot => (
                    <button
                      key={slot.id}
                      onClick={() => setSelectedSlot(slot)}
                      className={`
                        p-3 rounded-lg border-2 text-center transition-all
                        ${selectedSlot.id === slot.id 
                          ? 'border-[#570013] bg-[#570013]/5' 
                          : 'border-gray-200 hover:border-gray-300'}
                      `}
                    >
                      <Clock className="w-4 h-4 mx-auto mb-1 text-gray-400" />
                      <span className="font-medium">{slot.start_time}</span>
                      <span className="block text-xs text-gray-500">{slot.centre_name}</span>
                    </button>
                  ))}
                </div>
                <div className="mt-4 flex justify-end">
                  <Button onClick={() => setStep(3)} className="bg-[#570013]">
                    Continue
                  </Button>
                </div>
              </div>
            )}

            {/* Back Button */}
            <button
              onClick={() => setStep(1)}
              className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to selection
            </button>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4">Confirm Your KYC</h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  {kycType === 'centre' ? (
                    <Building2 className="w-10 h-10 text-[#570013]" />
                  ) : (
                    <Video className="w-10 h-10 text-[#570013]" />
                  )}
                  <div>
                    <p className="font-medium">
                      {kycType === 'centre' ? 'At Franchise Centre' : 'Online Self-Verification'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {kycType === 'centre' 
                        ? `Centre: ${selectedSlot?.centre_name}` 
                        : 'Connect via video call'}
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Date</p>
                    <p className="font-medium">
                      {selectedSlot ? formatDate(new Date(selectedSlot.slot_date)) : 'Immediately'}
                    </p>
                  </div>
                  {kycType === 'centre' && selectedSlot && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Time</p>
                      <p className="font-medium">{selectedSlot.start_time} - {selectedSlot.end_time}</p>
                    </div>
                  )}
                </div>

                {kycType === 'centre' && selectedSlot && (
                  <div className="p-4 bg-gray-50 rounded-lg flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="font-medium">{selectedSlot.centre_name}</p>
                      <p className="text-sm text-gray-500">Visit this centre for your verification</p>
                    </div>
                  </div>
                )}
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="mt-6 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button 
                  onClick={handleConfirm} 
                  className="bg-[#570013]"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Confirming...
                    </>
                  ) : (
                    'Confirm & Book'
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Success */}
        {step === 4 && (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">KYC Scheduled Successfully!</h2>
              <p className="text-gray-600">
                {kycType === 'centre' 
                  ? 'Please visit the centre at your scheduled time.' 
                  : 'Your online verification session is ready. Join when you are prepared.'}
              </p>
            </div>

            {session && (
              <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-md mx-auto">
                <div className="space-y-3 text-left">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Session ID</span>
                    <span className="font-mono text-sm">{session.id.slice(0, 8)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status</span>
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full capitalize">
                      {session.status}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-center gap-4">
              {kycType === 'online' && (
                <Button className="bg-[#570013]">
                  <Video className="w-4 h-4 mr-2" />
                  Start Verification
                </Button>
              )}
              <Button variant="outline" onClick={() => window.location.href = '/dashboard'}>
                Go to Dashboard
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
