'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/avatar';
import { Tooltip } from '@/components/ui/tooltip';
import { Check, CheckCheck, FileText, Play, Image, Mic } from 'lucide-react';

export type MessageType = 'text' | 'image' | 'video' | 'voice' | 'document' | 'system';

export interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  type: MessageType;
  mediaUrl?: string;
  fileName?: string;
  replyTo?: { id: string; content: string; senderName: string };
  createdAt: string;
  isRead: boolean;
  isDelivered: boolean;
}

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  className?: string;
}

const typeIcons: Record<MessageType, React.ReactNode> = {
  text: null,
  image: <Image className="w-4 h-4" />,
  video: <Play className="w-4 h-4" />,
  voice: <Mic className="w-4 h-4" />,
  document: <FileText className="w-4 h-4" />,
  system: null,
};

export function MessageBubble({ message, isOwn, className }: MessageBubbleProps) {
  if (message.type === 'system') {
    return (
      <div className="flex justify-center py-2">
        <span className="text-xs text-stone-400 bg-stone-100 px-3 py-1 rounded-full">{message.content}</span>
      </div>
    );
  }

  return (
    <div className={cn('flex gap-2 mb-3', isOwn ? 'flex-row-reverse' : 'flex-row', className)}>
      {!isOwn && (
        <Avatar size="sm" src={message.senderAvatar}>
          <span className="text-xs">{message.senderName.charAt(0)}</span>
        </Avatar>
      )}
      <div className={cn('max-w-[75%] space-y-1', isOwn ? 'items-end' : 'items-start')}>
        {!isOwn && <p className="text-[11px] text-stone-400 px-1">{message.senderName}</p>}
        {message.replyTo && (
          <div className={cn(
            'px-3 py-1.5 rounded-lg text-xs border-l-2 text-stone-500 bg-stone-50',
            isOwn ? 'border-stone-300 mr-0 ml-auto' : 'border-stone-300'
          )}>
            <p className="font-medium text-[10px] text-stone-400">{message.replyTo.senderName}</p>
            <p className="truncate max-w-[200px]">{message.replyTo.content}</p>
          </div>
        )}
        <div className={cn(
          'px-3 py-2 rounded-2xl text-sm leading-relaxed',
          isOwn
            ? 'bg-primary text-white rounded-tr-md'
            : 'bg-stone-100 text-stone-900 rounded-tl-md'
        )}>
          {message.type === 'image' && message.mediaUrl ? (
            <img src={message.mediaUrl} alt="Shared image" className="rounded-lg max-w-full mb-1 cursor-pointer hover:opacity-90" />
          ) : message.type === 'video' && message.mediaUrl ? (
            <div className="relative rounded-lg overflow-hidden mb-1 cursor-pointer">
              <video src={message.mediaUrl} className="max-w-full h-40 object-cover" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30"><Play className="w-8 h-8 text-white" /></div>
            </div>
          ) : message.type === 'voice' && message.mediaUrl ? (
            <audio src={message.mediaUrl} controls className="h-8 w-48" />
          ) : message.type === 'document' && message.mediaUrl ? (
            <a href={message.mediaUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 underline">
              <FileText className="w-4 h-4" />{message.fileName || 'Document'}
            </a>
          ) : (
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          )}
        </div>
        <div className={cn('flex items-center gap-1 px-1', isOwn ? 'justify-end' : 'justify-start')}>
          <span className="text-[10px] text-stone-400">
            {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          {isOwn && (
            message.isRead
              ? <CheckCheck className="w-3 h-3 text-blue-500" />
              : message.isDelivered
                ? <CheckCheck className="w-3 h-3 text-stone-400" />
                : <Check className="w-3 h-3 text-stone-400" />
          )}
        </div>
      </div>
    </div>
  );
}
