'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft, Video, MoreVertical, Verified, Send,
  Paperclip, SmileIcon, MoreHorizontal, Phone,
  User, ChevronRight
} from 'lucide-react';

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read';
}

interface ChatContact {
  id: string;
  name: string;
  age: number;
  location: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
  avatar?: string;
}

const mockContact: ChatContact = {
  id: '1',
  name: 'Rohan Deshmukh',
  age: 30,
  location: 'Pune, Maharashtra',
  lastMessage: 'Would you like to have a quick video call?',
  lastMessageTime: '10:45 AM',
  unreadCount: 0,
  isOnline: true
};

const mockMessages: Message[] = [
  {
    id: '1',
    senderId: 'contact',
    content: 'Namaste Rohan, I really liked your family description.',
    timestamp: new Date('2024-10-24T10:42:00'),
    status: 'read'
  },
  {
    id: '2',
    senderId: 'user',
    content: 'Thank you Priya, it means a lot. Would you like to have a quick video call?',
    timestamp: new Date('2024-10-24T10:45:00'),
    status: 'read'
  }
];

export default function MemberChatViewPage() {
  const params = useParams();
  const conversationId = params.id as string;
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [newMessage, setNewMessage] = useState('');
  const [showCallPrompt, setShowCallPrompt] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentUserId = 'user';
  const contactId = 'contact';
  const contact = mockContact;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      senderId: currentUserId,
      content: newMessage,
      timestamp: new Date(),
      status: 'sent'
    };

    setMessages([...messages, message]);
    setNewMessage('');
    setShowCallPrompt(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleVideoCallRequest = () => {
    alert('Video call request sent to ' + contact.name);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDateSeparator = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Today, ${date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <nav className="bg-surface shadow-sm fixed top-0 w-full z-50">
        <div className="flex justify-between items-center px-6 py-4 w-full max-w-4xl mx-auto">
          <div className="flex items-center gap-4">
            <Link href="/inbox" className="text-primary active:scale-95 duration-200 p-2 -ml-2 rounded-full hover:bg-stone-100">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <Link href={`/profile/${contactId}`} className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center">
                  <User className="w-5 h-5 text-stone-500" />
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-surface rounded-full"></span>
              </div>
              <div>
                <h1 className="font-headline text-lg font-semibold tracking-tight text-primary leading-none">{contact.name}</h1>
                <span className="text-[10px] uppercase tracking-widest text-amber-600 font-bold">Online Now</span>
              </div>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/video-call/${contactId}`} className="w-10 h-10 flex items-center justify-center rounded-full bg-stone-100 hover:bg-stone-200 text-primary transition-colors">
              <Video className="w-5 h-5" />
            </Link>
            <button className="w-10 h-10 flex items-center justify-center rounded-full bg-stone-100 hover:bg-stone-200 text-primary transition-colors">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="h-px bg-stone-200 w-full"></div>
      </nav>

      <main className="flex-1 mt-16 mb-28 overflow-y-auto px-6 py-4 flex flex-col gap-4">
        <div className="mx-auto bg-stone-100 px-4 py-2 rounded-full border border-stone-200/20 flex items-center gap-2">
          <Verified className="w-4 h-4 text-amber-600" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-600">End-to-End Encrypted Secure Chat</span>
        </div>

        <div className="relative flex items-center py-4">
          <div className="flex-grow border-t border-stone-200/30"></div>
          <span className="flex-shrink mx-4 text-[10px] font-bold uppercase tracking-widest text-stone-400">
            {formatDateSeparator(new Date())}
          </span>
          <div className="flex-grow border-t border-stone-200/30"></div>
        </div>

        {messages.map((message) => (
          <div key={message.id}>
            {message.senderId === currentUserId ? (
              <div className="flex flex-col items-end max-w-[85%] self-end">
                <div className="bg-primary text-white rounded-2xl rounded-tr-none px-5 py-4 shadow-md">
                  <p className="text-sm leading-relaxed">{message.content}</p>
                </div>
                <div className="flex items-center gap-1 mt-1 mr-1">
                  <span className="text-[10px] text-stone-400 uppercase tracking-tighter">{formatTime(message.timestamp)}</span>
                  <svg className="w-4 h-4 text-amber-500" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.88a.32.32 0 0 1-.484.032l-.358-.325a.32.32 0 0 0-.484.032l-.378.48a.418.418 0 0 0 .536.62l.532-.193 5.494-3.635a.31.31 0 0 1 .564.026l.004.006L15.01 3.316z"/>
                    {message.status === 'read' && <path d="M12.5 5.5l4 4-4 4"/>}
                  </svg>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-start max-w-[85%]">
                <div className="bg-stone-100 text-stone-900 rounded-2xl rounded-tl-none px-5 py-4 shadow-sm border border-stone-200/10">
                  <p className="text-sm leading-relaxed">{message.content}</p>
                </div>
                <span className="text-[10px] text-stone-400 mt-1 ml-1 uppercase tracking-tighter">{formatTime(message.timestamp)}</span>
              </div>
            )}
          </div>
        ))}

        {showCallPrompt && (
          <div className="w-full bg-gradient-to-br from-stone-100 to-stone-200 p-6 rounded-xl border border-amber-200/30 flex flex-col gap-4 mt-4">
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-1">
                <h3 className="font-headline font-bold text-primary italic">Initiate Video Meeting</h3>
                <p className="text-xs text-stone-600 max-w-[200px]">Secure, private, and high-definition video calls for verified members.</p>
              </div>
              <div className="bg-amber-100 p-3 rounded-full">
                <Video className="w-5 h-5 text-amber-600" />
              </div>
            </div>
            <button
              onClick={handleVideoCallRequest}
              className="w-full py-3 bg-primary text-white rounded-full font-bold text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-transform"
            >
              Request Video Call
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </main>

      <div className="fixed bottom-0 left-0 w-full px-4 pb-8 pt-4 bg-gradient-to-t from-surface via-surface to-transparent">
        <div className="max-w-4xl mx-auto flex items-center gap-3 bg-white p-2 rounded-full shadow-lg border border-stone-200/20">
          <button className="w-10 h-10 flex items-center justify-center text-stone-500 hover:text-primary transition-colors">
            <Paperclip className="w-5 h-5 rotate-45" />
          </button>
          <input
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-stone-900 placeholder:text-stone-400"
            placeholder="Type a thoughtful message..."
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button className="w-10 h-10 flex items-center justify-center text-stone-500 hover:text-primary transition-colors">
            <SmileIcon className="w-5 h-5" />
          </button>
          <button
            onClick={handleSendMessage}
            className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center shadow-md active:scale-90 transition-transform disabled:opacity-50"
            disabled={!newMessage.trim()}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="fixed top-0 right-0 pointer-events-none opacity-5">
        <svg fill="none" height="200" viewBox="0 0 200 200" width="200" xmlns="http://www.w3.org/2000/svg">
          <path d="M100 0C100 55.2285 55.2285 100 0 100C55.2285 100 100 144.772 100 200C100 144.772 144.772 100 200 100C144.772 100 100 55.2285 100 0Z" fill="#570013"></path>
        </svg>
      </div>
    </div>
  );
}
