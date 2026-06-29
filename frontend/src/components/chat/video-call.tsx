'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Maximize, Minimize, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/avatar';

interface VideoCallProps {
  participantName: string;
  participantAvatar?: string;
  isIncoming?: boolean;
  onAccept?: () => void;
  onReject?: () => void;
  onEnd?: () => void;
  onToggleScreenShare?: () => void;
  className?: string;
}

export function VideoCall({
  participantName,
  participantAvatar,
  isIncoming,
  onAccept,
  onReject,
  onEnd,
  onToggleScreenShare,
  className,
}: VideoCallProps) {
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isSharingScreen, setIsSharingScreen] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (localVideoRef.current && camOn) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(stream => { localVideoRef.current!.srcObject = stream; })
        .catch(() => {});
    }
  }, [camOn]);

  useEffect(() => {
    if (!isIncoming) {
      const interval = setInterval(() => setCallDuration(d => d + 1), 1000);
      return () => clearInterval(interval);
    }
  }, [isIncoming]);

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  if (isIncoming) {
    return (
      <div className={cn('fixed inset-0 z-50 bg-black/60 flex items-center justify-center', className)}>
        <div className="bg-white rounded-2xl p-8 text-center max-w-sm w-full mx-4 space-y-6">
          <Avatar size="xl" src={participantAvatar} className="mx-auto">
            <span className="text-2xl">{participantName.charAt(0)}</span>
          </Avatar>
          <div>
            <h3 className="text-lg font-semibold text-stone-900">{participantName}</h3>
            <p className="text-sm text-stone-500">Incoming video call...</p>
          </div>
          <div className="flex items-center justify-center gap-6">
            <button onClick={onReject} className="w-14 h-14 bg-red-500 text-white rounded-full hover:bg-red-600 flex items-center justify-center transition-colors">
              <PhoneOff className="w-6 h-6" />
            </button>
            <button onClick={onAccept} className="w-14 h-14 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 flex items-center justify-center transition-colors">
              <Video className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('relative bg-black rounded-xl overflow-hidden', fullscreen ? 'fixed inset-0 z-50 rounded-none' : 'aspect-video', className)}>
      {remoteVideoRef && (
        <video ref={remoteVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" poster={participantAvatar} />
      )}

      {!camOn && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Avatar size="xl" src={participantAvatar}>
            <span className="text-3xl">{participantName.charAt(0)}</span>
          </Avatar>
        </div>
      )}

      <div className="absolute top-4 left-4">
        <video ref={localVideoRef} autoPlay playsInline muted className="w-28 h-20 rounded-lg object-cover border-2 border-white shadow-lg" />
      </div>

      <div className="absolute top-4 right-4">
        <p className="text-white text-sm font-medium drop-shadow-lg">{participantName}</p>
        <p className="text-white/80 text-xs drop-shadow-lg">{formatDuration(callDuration)}</p>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4">
        <button
          onClick={() => setMicOn(!micOn)}
          className={cn('w-12 h-12 rounded-full flex items-center justify-center transition-all', micOn ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-red-500 text-white')}
        >
          {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
        </button>
        <button
          onClick={() => setCamOn(!camOn)}
          className={cn('w-12 h-12 rounded-full flex items-center justify-center transition-all', camOn ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-red-500 text-white')}
        >
          {camOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
        </button>
        <button
          onClick={() => { setIsSharingScreen(!isSharingScreen); onToggleScreenShare?.(); }}
          className={cn('w-12 h-12 rounded-full flex items-center justify-center transition-all', !isSharingScreen ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-primary text-white')}
        >
          <Monitor className="w-5 h-5" />
        </button>
        <button onClick={onEnd} className="w-12 h-12 bg-red-500 text-white rounded-full hover:bg-red-600 flex items-center justify-center">
          <PhoneOff className="w-5 h-5" />
        </button>
        <button
          onClick={() => setFullscreen(!fullscreen)}
          className="w-12 h-12 rounded-full bg-white/20 text-white hover:bg-white/30 flex items-center justify-center"
        >
          {fullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
}
