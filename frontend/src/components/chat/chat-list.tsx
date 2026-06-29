'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Search, Phone, Video, MoreVertical, ArrowLeft, Smile, Paperclip, Send, Image, Mic, X, FileText, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { MessageBubble } from './message-bubble';
import type { Message, MessageType } from './message-bubble';

interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
  isOnline?: boolean;
}

interface ChatListProps {
  conversations: Conversation[];
  activeId?: string;
  onSelect: (id: string) => void;
  className?: string;
}

export function ChatList({ conversations, activeId, onSelect, className }: ChatListProps) {
  return (
    <div className={cn('divide-y divide-stone-100 overflow-y-auto', className)}>
      {conversations.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-stone-400">
          <MessageCircle className="w-10 h-10 mb-2" />
          <p className="text-sm">No conversations yet</p>
        </div>
      )}
      {conversations.map(conv => (
        <button
          key={conv.id}
          onClick={() => onSelect(conv.id)}
          className={cn(
            'w-full flex items-center gap-3 p-4 hover:bg-stone-50 transition-colors text-left',
            activeId === conv.id && 'bg-primary/5'
          )}
        >
          <div className="relative">
            <Avatar src={conv.participantAvatar}>
              <span className="text-sm">{conv.participantName.charAt(0)}</span>
            </Avatar>
            {conv.isOnline && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="font-medium text-sm text-stone-900 truncate">{conv.participantName}</p>
              {conv.lastMessageAt && (
                <span className="text-[10px] text-stone-400 whitespace-nowrap ml-2">
                  {new Date(conv.lastMessageAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                </span>
              )}
            </div>
            <div className="flex items-center justify-between mt-0.5">
              <p className="text-xs text-stone-500 truncate">{conv.lastMessage || 'Start a conversation'}</p>
              {conv.unreadCount > 0 && (
                <span className="ml-2 w-5 h-5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center flex-shrink-0">
                  {conv.unreadCount}
                </span>
              )}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

interface ChatViewProps {
  conversation: Conversation;
  messages: Message[];
  onSend: (content: string, type: MessageType, file?: File) => void;
  onBack: () => void;
  onVideoCall?: () => void;
  onVoiceCall?: () => void;
  className?: string;
}

export function ChatView({ conversation, messages, onSend, onBack, onVideoCall, onVoiceCall, className }: ChatViewProps) {
  const [text, setText] = useState('');
  const [showAttach, setShowAttach] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text.trim(), 'text');
    setText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFilePick = (type: MessageType) => {
    fileRef.current?.click();
    setShowAttach(false);
  };

  return (
    <div className={cn('flex flex-col h-full', className)}>
      <div className="flex items-center gap-3 p-3 border-b border-stone-200 bg-white">
        <button onClick={onBack} className="p-1 hover:bg-stone-100 rounded-lg lg:hidden">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <Avatar src={conversation.participantAvatar}>
          <span className="text-sm">{conversation.participantName.charAt(0)}</span>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm text-stone-900 truncate">{conversation.participantName}</p>
          <p className="text-[11px] text-emerald-500">{conversation.isOnline ? 'Online' : 'Offline'}</p>
        </div>
        <div className="flex items-center gap-1">
          {onVoiceCall && (
            <button onClick={onVoiceCall} className="p-2 hover:bg-stone-100 rounded-full">
              <Phone className="w-4 h-4 text-stone-500" />
            </button>
          )}
          {onVideoCall && (
            <button onClick={onVideoCall} className="p-2 hover:bg-stone-100 rounded-full">
              <Video className="w-4 h-4 text-stone-500" />
            </button>
          )}
          <button className="p-2 hover:bg-stone-100 rounded-full">
            <MoreVertical className="w-4 h-4 text-stone-500" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-1 bg-stone-50/50">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-stone-400">
            <p className="text-sm">No messages yet</p>
            <p className="text-xs mt-1">Say hello to start the conversation!</p>
          </div>
        )}
        {messages.map(msg => (
          <MessageBubble key={msg.id} message={msg} isOwn={msg.senderId === 'me'} />
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="p-3 border-t border-stone-200 bg-white">
        {showAttach && (
          <div className="flex gap-3 mb-3 px-1">
            <button onClick={() => handleFilePick('image')} className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 bg-rose-50 rounded-full flex items-center justify-center"><Image className="w-5 h-5 text-rose-500" /></div>
              <span className="text-[10px] text-stone-500">Photo</span>
            </button>
            <button onClick={() => handleFilePick('video')} className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 bg-violet-50 rounded-full flex items-center justify-center"><Video className="w-5 h-5 text-violet-500" /></div>
              <span className="text-[10px] text-stone-500">Video</span>
            </button>
            <button onClick={() => handleFilePick('document')} className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center"><FileText className="w-5 h-5 text-blue-500" /></div>
              <span className="text-[10px] text-stone-500">Document</span>
            </button>
          </div>
        )}
        <div className="flex items-end gap-2">
          <button onClick={() => setShowAttach(!showAttach)} className="p-2 hover:bg-stone-100 rounded-full flex-shrink-0">
            <Paperclip className="w-5 h-5 text-stone-400" />
          </button>
          <div className="flex-1 relative">
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              rows={1}
              className="w-full resize-none rounded-2xl border border-stone-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <button className="absolute right-2 bottom-2 p-1 hover:bg-stone-100 rounded-full">
              <Smile className="w-4 h-4 text-stone-400" />
            </button>
          </div>
          <button
            onClick={handleSend}
            disabled={!text.trim()}
            className="p-2.5 bg-primary text-white rounded-full hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <input ref={fileRef} type="file" accept="image/*,video/*,.pdf,.doc,.docx" className="hidden" />
      </div>
    </div>
  );
}


