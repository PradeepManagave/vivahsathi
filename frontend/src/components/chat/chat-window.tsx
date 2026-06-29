'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Paperclip, Smile, Phone, Video, MoreVertical, Check, CheckCheck, Image, Mic, X } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export interface Message {
  id: string;
  senderId: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'audio';
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read';
  mediaUrl?: string;
}

export interface ChatUser {
  id: string;
  name: string;
  avatar?: string;
  isOnline?: boolean;
  lastSeen?: Date;
  isVerified?: boolean;
}

export interface ChatWindowProps {
  user: ChatUser;
  currentUserId: string;
  messages: Message[];
  loading?: boolean;
  onSendMessage: (content: string, type?: Message['type']) => void;
  onSendMedia?: (file: File) => void;
  onVoiceCall?: () => void;
  onVideoCall?: () => void;
  className?: string;
}

export function ChatWindow({
  user,
  currentUserId,
  messages,
  loading = false,
  onSendMessage,
  onSendMedia,
  onVoiceCall,
  onVideoCall,
  className = ''
}: ChatWindowProps) {
  const [inputValue, setInputValue] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    onSendMessage(inputValue.trim());
    setInputValue('');
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onSendMedia) {
      onSendMedia(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const messageDate = new Date(date);
    const diffTime = today.getTime() - messageDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return messageDate.toLocaleDateString([], { weekday: 'long' });
    return messageDate.toLocaleDateString();
  };

  const shouldShowDate = (index: number) => {
    if (index === 0) return true;
    const currentDate = new Date(messages[index].timestamp).toDateString();
    const prevDate = new Date(messages[index - 1].timestamp).toDateString();
    return currentDate !== prevDate;
  };

  const MessageStatus = ({ status }: { status: Message['status'] }) => {
    if (status === 'sent') return <Check className="w-4 h-4 text-stone-400" />;
    if (status === 'delivered') return <CheckCheck className="w-4 h-4 text-stone-400" />;
    return <CheckCheck className="w-4 h-4 text-primary" />;
  };

  const commonEmojis = ['😊', '❤️', '👍', '😂', '🙏', '😍', '🥰', '😘', '💕', '✨', '🌟', '💖'];

  if (loading) {
    return (
      <div className={`flex flex-col h-full bg-surface ${className}`}>
        <div className="p-4 bg-white border-b border-stone-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-stone-200 rounded-full animate-pulse" />
            <div className="flex-1">
              <div className="h-4 bg-stone-200 rounded animate-pulse w-32 mb-2" />
              <div className="h-3 bg-stone-200 rounded animate-pulse w-24" />
            </div>
          </div>
        </div>
        <div className="flex-1 p-4 space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
              <div className={`h-10 bg-stone-200 rounded-2xl animate-pulse ${i % 2 === 0 ? 'w-48' : 'w-32'}`} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full bg-surface ${className}`}>
      <div className="p-4 bg-white border-b border-stone-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar name={user.name} src={user.avatar} size="md" />
            {user.isOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-white" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-stone-900">{user.name}</h3>
            <p className="text-xs text-stone-500">
              {user.isOnline ? 'Online' : user.lastSeen ? `Last seen ${formatTime(user.lastSeen)}` : 'Offline'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {onVoiceCall && (
            <Button variant="ghost" size="sm" onClick={onVoiceCall}>
              <Phone className="w-5 h-5" />
            </Button>
          )}
          {onVideoCall && (
            <Button variant="ghost" size="sm" onClick={onVideoCall}>
              <Video className="w-5 h-5" />
            </Button>
          )}
          <Button variant="ghost" size="sm">
            <MoreVertical className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => {
          const isMine = message.senderId === currentUserId;
          const showDate = shouldShowDate(index);

          return (
            <React.Fragment key={message.id}>
              {showDate && (
                <div className="flex justify-center">
                  <span className="text-xs text-stone-500 bg-stone-100 px-3 py-1 rounded-full">
                    {formatDate(message.timestamp)}
                  </span>
                </div>
              )}
              <div className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                    isMine
                      ? 'bg-primary text-white rounded-br-sm'
                      : 'bg-white text-stone-900 rounded-bl-sm border border-stone-200'
                  }`}
                >
                  {message.type === 'image' && message.mediaUrl && (
                    <img src={message.mediaUrl} alt="Shared image" className="rounded-lg mb-2 max-w-full" />
                  )}
                  {message.type === 'text' && <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>}
                  <div className={`flex items-center justify-end gap-1 mt-1 ${isMine ? 'text-white/70' : 'text-stone-400'}`}>
                    <span className="text-[10px]">{formatTime(message.timestamp)}</span>
                    {isMine && <MessageStatus status={message.status} />}
                  </div>
                </div>
              </div>
            </React.Fragment>
          );
        })}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-stone-200 px-4 py-3 rounded-2xl rounded-bl-sm">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {showEmojiPicker && (
        <div className="bg-white border-t border-stone-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-stone-700">Emojis</span>
            <button onClick={() => setShowEmojiPicker(false)} className="text-stone-400 hover:text-stone-600">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {commonEmojis.map((emoji) => (
              <button
                key={emoji}
                onClick={() => setInputValue((prev) => prev + emoji)}
                className="text-2xl hover:bg-stone-100 p-1 rounded transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white border-t border-stone-200 p-3">
        <div className="flex items-center gap-2">
          {onSendMedia && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="text-stone-500"
            >
              <Paperclip className="w-5 h-5" />
            </Button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className={`text-stone-500 ${showEmojiPicker ? 'text-primary' : ''}`}
          >
            <Smile className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-stone-500"
          >
            <Mic className="w-5 h-5" />
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSend}
            disabled={!inputValue.trim()}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
