'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Message, ChatUser } from '@/components/chat/chat-window';

interface UseChatOptions {
  chatId: string;
  currentUserId: string;
  onTyping?: (userId: string) => void;
}

interface UseChatReturn {
  messages: Message[];
  loading: boolean;
  error: string | null;
  user: ChatUser | null;
  isOnline: boolean;
  sendMessage: (content: string, type?: Message['type']) => void;
  sendMedia: (file: File) => void;
  markAsRead: (messageId: string) => void;
  deleteMessage: (messageId: string) => void;
  startVoiceCall: () => void;
  startVideoCall: () => void;
  isConnected: boolean;
}

export function useChat({ chatId, currentUserId }: UseChatOptions): UseChatReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<ChatUser | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';
    const ws = new WebSocket(`${wsUrl}/chat/${chatId}?userId=${currentUserId}`);

    ws.onopen = () => {
      setIsConnected(true);
      setError(null);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        switch (data.type) {
          case 'message':
            setMessages((prev) => [...prev, data.payload as Message]);
            break;
          case 'typing':
            break;
          case 'read':
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === data.payload.messageId ? { ...msg, status: 'read' as const } : msg
              )
            );
            break;
          case 'user_status':
            setIsOnline(data.payload.isOnline);
            break;
          case 'user_info':
            setUser(data.payload as ChatUser);
            break;
        }
      } catch {
        console.error('Failed to parse WebSocket message');
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      reconnectTimeoutRef.current = setTimeout(connect, 3000);
    };

    ws.onerror = () => {
      setError('Connection error. Retrying...');
      ws.close();
    };

    socketRef.current = ws;
  }, [chatId, currentUserId]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/chat/${chatId}/messages`);
        if (!response.ok) throw new Error('Failed to fetch messages');
        const data = await response.json();
        setMessages(data.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load messages');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
    connect();

    return () => {
      socketRef.current?.close();
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [chatId, connect]);

  const sendMessage = useCallback((content: string, type: Message['type'] = 'text') => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;

    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      senderId: currentUserId,
      content,
      type,
      timestamp: new Date(),
      status: 'sent'
    };

    setMessages((prev) => [...prev, tempMessage]);

    socketRef.current.send(JSON.stringify({
      type: 'message',
      payload: { chatId, content, type }
    }));
  }, [chatId, currentUserId]);

  const sendMedia = useCallback(async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('chatId', chatId);

      const response = await fetch('/api/chat/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      sendMessage(data.data.url, 'image');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send media');
    }
  }, [chatId, sendMessage]);

  const markAsRead = useCallback((messageId: string) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;

    socketRef.current.send(JSON.stringify({
      type: 'read',
      payload: { messageId }
    }));
  }, []);

  const deleteMessage = useCallback((messageId: string) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
  }, []);

  const startVoiceCall = useCallback(() => {
    window.location.href = `/video-chat?chatId=${chatId}&type=voice`;
  }, [chatId]);

  const startVideoCall = useCallback(() => {
    window.location.href = `/video-chat?chatId=${chatId}&type=video`;
  }, [chatId]);

  return {
    messages,
    loading,
    error,
    user,
    isOnline,
    sendMessage,
    sendMedia,
    markAsRead,
    deleteMessage,
    startVoiceCall,
    startVideoCall,
    isConnected
  };
}
