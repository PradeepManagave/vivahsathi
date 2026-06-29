'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Video, VideoOff, Mic, MicOff, Phone, PhoneOff,
  Monitor, MoreVertical, CheckCircle, XCircle, Clock,
  User, FileText, AlertTriangle, Maximize2, Settings,
  MessageSquare, MoreHorizontal
} from 'lucide-react';
import { apiClient, API_ENDPOINTS } from '@/lib/api/client';
import { Button } from '@/components/ui/button';

interface KycSession {
  id: string;
  user_id: string;
  status: string;
  scheduled_at: string;
  room_url?: string;
  notes?: string;
}

interface MemberProfile {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  avatar_url?: string;
  date_of_birth?: string;
  religion?: string;
  caste?: string;
}

interface VerificationChecklist {
  id: string;
  name: string;
  checked: boolean;
  notes?: string;
}

const defaultChecklist: Omit<VerificationChecklist, 'id'>[] = [
  { name: 'Photo matches profile', checked: false },
  { name: 'Name matches ID', checked: false },
  { name: 'Date of birth verified', checked: false },
  { name: 'Address confirmed', checked: false },
  { name: 'Religion verified', checked: false },
  { name: 'Education details confirmed', checked: false },
  { name: 'Family information verified', checked: false },
  { name: 'Partner preference discussed', checked: false },
];

export default function LiveVerificationSessionPage() {
  const [session, setSession] = useState<KycSession | null>(null);
  const [member, setMember] = useState<MemberProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showChecklist, setShowChecklist] = useState(true);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [checklist, setChecklist] = useState<VerificationChecklist[]>(
    defaultChecklist.map((item, index) => ({ ...item, id: `check-${index}` }))
  );
  const [evaluationNotes, setEvaluationNotes] = useState('');
  const [sessionEnded, setSessionEnded] = useState(false);
  const [remainingTime, setRemainingTime] = useState(30 * 60);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchSession = useCallback(async () => {
    try {
      const response = await apiClient.get<KycSession[]>('/centre/kyc/pending-sessions');
      if (response.success && response.data?.[0]) {
        const sessionData = response.data[0];
        setSession(sessionData);
        
        // Fetch member details
        const memberResponse = await apiClient.get<MemberProfile>(`/members/${sessionData.user_id}`);
        if (memberResponse.success && memberResponse.data) {
          setMember(memberResponse.data);
        }
      }
    } catch {
      setError('Failed to load session');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  useEffect(() => {
    if (remainingTime > 0 && !sessionEnded) {
      const timer = setInterval(() => {
        setRemainingTime(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [remainingTime, sessionEnded]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleChecklistItem = (id: string) => {
    setChecklist(prev =>
      prev.map(item =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const handleStartCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Camera access denied:', err);
    }
  };

  const toggleVideo = () => {
    if (localVideoRef.current?.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      stream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoOn(!isVideoOn);
    }
  };

  const toggleAudio = () => {
    if (localVideoRef.current?.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      stream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsAudioOn(!isAudioOn);
    }
  };

  const handleEndSession = async () => {
    setProcessing(true);
    try {
      if (session) {
        await apiClient.post(`/video-kyc/sessions/${session.id}/complete`, {
          notes: evaluationNotes
        });
      }
      setSessionEnded(true);
    } catch {
      setError('Failed to end session');
    } finally {
      setProcessing(false);
    }
  };

  const handleApprove = async () => {
    setProcessing(true);
    try {
      if (session) {
        await apiClient.post(API_ENDPOINTS.videoKyc.admin.approveSession(session.id), {
          notes: evaluationNotes
        });
        setShowApproveModal(false);
        // Redirect or show success
      }
    } catch {
      setError('Failed to approve');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (rejectionReason.length < 10) {
      setError('Rejection reason must be at least 10 characters');
      return;
    }
    setProcessing(true);
    try {
      if (session) {
        await apiClient.post(API_ENDPOINTS.videoKyc.admin.rejectSession(session.id), {
          reason: rejectionReason
        });
        setShowRejectModal(false);
      }
    } catch {
      setError('Failed to reject');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#fdc34d] border-t-transparent mx-auto mb-4" />
          <p>Loading verification session...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <p>{error}</p>
          <Button onClick={fetchSession} className="mt-4 bg-[#570013]">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <User className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Pending Sessions</h2>
          <p className="text-gray-400">There are no KYC verification sessions waiting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Main Video Area */}
      <div className="flex-1 flex flex-col" ref={containerRef}>
        {/* Top Bar */}
        <div className="bg-gray-800 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-white">
              <Video className="w-5 h-5 text-[#fdc34d]" />
              <span className="font-medium">Live Verification Session</span>
            </div>
            <div className="flex items-center gap-2 text-white bg-red-500/20 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-sm">LIVE</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-white flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span className={`font-mono ${remainingTime < 300 ? 'text-red-400' : ''}`}>
                {formatTime(remainingTime)}
              </span>
            </div>
            <button
              onClick={() => setShowChecklist(!showChecklist)}
              className="p-2 hover:bg-gray-700 rounded-lg text-white"
            >
              <FileText className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 hover:bg-gray-700 rounded-lg text-white"
            >
              <Maximize2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Container */}
        <div className="flex-1 relative bg-black">
          {/* Remote Video (Member) */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <Video className="w-20 h-20 mx-auto mb-4" />
              <p>Waiting for member to join...</p>
            </div>
          </div>

          {/* Local Video (Staff) */}
          <div className="absolute bottom-4 right-4 w-48 h-36 bg-gray-800 rounded-xl overflow-hidden border-2 border-gray-700">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-2 left-2 text-white text-xs bg-black/50 px-2 py-1 rounded">
              You
            </div>
          </div>

          {/* Controls */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
            <div className="flex items-center gap-3 bg-gray-800/90 backdrop-blur-sm rounded-full px-6 py-3">
              <button
                onClick={toggleAudio}
                className={`p-3 rounded-full transition-colors ${
                  isAudioOn ? 'hover:bg-gray-700' : 'bg-red-500 hover:bg-red-600'
                } text-white`}
              >
                {isAudioOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>
              <button
                onClick={toggleVideo}
                className={`p-3 rounded-full transition-colors ${
                  isVideoOn ? 'hover:bg-gray-700' : 'bg-red-500 hover:bg-red-600'
                } text-white`}
              >
                {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setIsScreenSharing(!isScreenSharing)}
                className={`p-3 rounded-full transition-colors ${
                  isScreenSharing ? 'bg-[#570013] hover:bg-[#450010]' : 'hover:bg-gray-700'
                } text-white`}
              >
                <Monitor className="w-5 h-5" />
              </button>
              <div className="w-px h-8 bg-gray-600 mx-2" />
              <button
                onClick={handleEndSession}
                className="p-3 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors"
              >
                <PhoneOff className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Member Info & Checklist */}
      {showChecklist && (
        <div className="w-96 bg-white flex flex-col">
          {/* Member Profile */}
          <div className="p-4 border-b">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#570013]/10 flex items-center justify-center">
                <User className="w-6 h-6 text-[#570013]" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {member ? `${member.first_name} ${member.last_name}` : 'Loading...'}
                </h3>
                <p className="text-sm text-gray-500">
                  {member?.email || 'Email not available'}
                </p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div className="bg-gray-50 p-2 rounded">
                <span className="text-gray-500">Phone</span>
                <p className="font-medium">{member?.phone || 'N/A'}</p>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <span className="text-gray-500">DOB</span>
                <p className="font-medium">{member?.date_of_birth || 'N/A'}</p>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <span className="text-gray-500">Religion</span>
                <p className="font-medium">{member?.religion || 'N/A'}</p>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <span className="text-gray-500">Caste</span>
                <p className="font-medium">{member?.caste || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Verification Checklist */}
          <div className="flex-1 overflow-y-auto p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Verification Checklist</h4>
            <div className="space-y-2">
              {checklist.map(item => (
                <label
                  key={item.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={() => toggleChecklistItem(item.id)}
                    className="w-5 h-5 rounded border-gray-300 text-[#570013] focus:ring-[#570013]"
                  />
                  <span className="text-gray-700">{item.name}</span>
                </label>
              ))}
            </div>

            {/* Notes */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Session Notes
              </label>
              <textarea
                value={evaluationNotes}
                onChange={(e) => setEvaluationNotes(e.target.value)}
                placeholder="Add notes about this verification session..."
                className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-[#570013] focus:border-transparent"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-4 border-t bg-gray-50">
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => setShowRejectModal(true)}
                className="border-red-300 text-red-600 hover:bg-red-50"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject
              </Button>
              <Button
                onClick={() => setShowApproveModal(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve
              </Button>
            </div>
            <p className="text-xs text-gray-500 text-center mt-2">
              {checklist.filter(c => c.checked).length} of {checklist.length} items verified
            </p>
          </div>
        </div>
      )}

      {/* Approve Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Approve Verification</h3>
                <p className="text-sm text-gray-500">Add verified badge to this profile</p>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (optional)
              </label>
              <textarea
                value={evaluationNotes}
                onChange={(e) => setEvaluationNotes(e.target.value)}
                className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg resize-none"
              />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowApproveModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleApprove} disabled={processing} className="flex-1 bg-green-600 hover:bg-green-700">
                {processing ? 'Processing...' : 'Confirm Approve'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Reject Verification</h3>
                <p className="text-sm text-gray-500">Provide reason for rejection</p>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Minimum 10 characters required..."
                className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg resize-none"
              />
              {rejectionReason.length > 0 && rejectionReason.length < 10 && (
                <p className="text-xs text-red-500 mt-1">
                  {10 - rejectionReason.length} more characters required
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowRejectModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={handleReject}
                disabled={processing || rejectionReason.length < 10}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                {processing ? 'Processing...' : 'Confirm Reject'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
