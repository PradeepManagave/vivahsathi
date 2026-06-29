'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Video, VideoOff, Mic, MicOff, PhoneOff, MessageSquare, Users, Settings, Loader2 } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { useVideoChat } from '@/hooks/use-video-chat';
import { toast } from 'sonner';

export default function VideoChatPage() {
  const router = useRouter();
  const [activeCall, setActiveCall] = useState(false);
  const [callWith, setCallWith] = useState<{ id: string; name: string; avatar?: string } | null>(null);
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ id: string; sender: string; text: string; time: string }>>([]);
  const [showChat, setShowChat] = useState(false);

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  const {
    currentCall,
    initiateCall,
    endCall: hookEndCall,
  } = useVideoChat();

  const toggleMute = () => setIsMuted(prev => !prev);
  const toggleVideo = () => setIsVideoOff(prev => !prev);

  const handleStartCall = async (userId: string, name: string) => {
    setCallWith({ id: userId, name, avatar: '' });
    setActiveCall(true);
    setCallDuration(0);
    await initiateCall(userId);
    toast.success(`Calling ${name}...`);
  };

  const handleEndCall = async () => {
    if (currentCall) {
      await hookEndCall(currentCall.id);
    }
    setActiveCall(false);
    setCallWith(null);
    setCallDuration(0);
    toast.info('Call ended');
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setChatMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: 'me',
        text: message,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setMessage('');
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Mock contacts for demo
  const contacts = [
    { id: '1', name: 'Priya Sharma', online: true, lastActive: 'Online now' },
    { id: '2', name: 'Sneha Deshmukh', online: false, lastActive: '2h ago' },
    { id: '3', name: 'Anita Patil', online: true, lastActive: 'Online now' },
  ];

  return (
    <div className="min-h-screen bg-surface">
      <Header variant="member" />

      <div className="container-page py-6">
        <h1 className="text-2xl font-bold text-stone-900 mb-6">Video Chat</h1>

        {activeCall && callWith ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Video Area */}
            <div className="lg:col-span-2">
              <Card className="relative overflow-hidden bg-stone-900 aspect-video">
                {/* Remote Video */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Avatar name={callWith.name} size="xl" className="w-32 h-32" />
                </div>

                {/* Self View */}
                <div className="absolute bottom-4 right-4 w-32 h-24 bg-stone-800 rounded-lg overflow-hidden border-2 border-white/20">
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-white text-xs">You</span>
                  </div>
                </div>

                {/* Call Info Overlay */}
                <div className="absolute top-4 left-4">
                  <h3 className="text-white font-semibold">{callWith.name}</h3>
                  <p className="text-white/70 text-sm">{formatDuration(callDuration)}</p>
                </div>

                {/* Call Controls */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
                  <Button
                    variant={isMuted ? 'danger' : 'ghost'}
                    size="icon"
                    className="bg-white/10 hover:bg-white/20 text-white"
                    onClick={toggleMute}
                  >
                    {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </Button>
                  <Button
                    variant={isVideoOff ? 'danger' : 'ghost'}
                    size="icon"
                    className="bg-white/10 hover:bg-white/20 text-white"
                    onClick={toggleVideo}
                  >
                    {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                  </Button>
                  <Button
                    variant="danger"
                    size="icon"
                    className="bg-red-600 hover:bg-red-700"
                    onClick={handleEndCall}
                  >
                    <PhoneOff className="w-5 h-5" />
                  </Button>
                  <Button
                    variant={showChat ? 'primary' : 'ghost'}
                    size="icon"
                    className="bg-white/10 hover:bg-white/20 text-white"
                    onClick={() => setShowChat(!showChat)}
                  >
                    <MessageSquare className="w-5 h-5" />
                  </Button>
                </div>
              </Card>
            </div>

            {/* Chat Panel */}
            {showChat && (
              <Card className="p-4 flex flex-col h-[500px]">
                <h3 className="font-semibold text-stone-900 mb-4">Chat</h3>
                <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                  {chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${
                          msg.sender === 'me'
                            ? 'bg-primary text-white'
                            : 'bg-surface-100 text-stone-900'
                        }`}
                      >
                        <p>{msg.text}</p>
                        <p className={`text-xs mt-1 ${msg.sender === 'me' ? 'text-white/70' : 'text-stone-400'}`}>
                          {msg.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="flex-1"
                  />
                  <Button variant="primary" type="submit" size="sm">
                    Send
                  </Button>
                </form>
              </Card>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contacts.map((contact) => (
              <Card key={contact.id} variant="hover" className="p-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar name={contact.name} size="lg" />
                    {contact.online && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-stone-900">{contact.name}</h3>
                    <p className="text-sm text-stone-500">{contact.lastActive}</p>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<Video className="w-4 h-4" />}
                    onClick={() => handleStartCall(contact.id, contact.name)}
                    disabled={!contact.online}
                  >
                    Call
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
