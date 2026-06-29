'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare, Loader2, Clock, Circle } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Pagination } from '@/components/ui/pagination';
import { messagingService, Conversation } from '@/lib/api/services/messaging.service';
import { toast } from 'sonner';

export default function InboxMessagesPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => { loadConversations(); }, [page]);

  const loadConversations = async () => {
    setLoading(true);
    try {
      const res = await messagingService.getConversations(page, 20);
      setConversations(res.data);
      setTotalPages(res.meta?.totalPages || 1);
    } catch { toast.error('Failed to load conversations'); }
    finally { setLoading(false); }
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    const hours = Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60));
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return days < 7 ? `${days}d ago` : d.toLocaleDateString();
  };

  if (loading) return (
    <div className="min-h-screen bg-surface">
      <Header variant="member" />
      <div className="container-page py-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface">
      <Header variant="member" />
      <div className="container-page py-6">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="sm" onClick={() => router.push('/inbox')}>&larr; Back</Button>
          <h1 className="text-2xl font-bold">Messages</h1>
        </div>

        {conversations.length === 0 ? (
          <Card className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-stone-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No conversations</h3>
            <p className="text-stone-500">Start chatting after matching with someone</p>
            <Button variant="primary" className="mt-4" onClick={() => router.push('/search')}>Find Matches</Button>
          </Card>
        ) : (
          <div className="space-y-2">
            {conversations.map((conv) => (
              <Card key={conv.id} variant="hover" className="p-4 cursor-pointer" onClick={() => router.push(`/chat/${conv.participantId}`)}>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar src={conv.participantAvatar} name={conv.participantName} size="md" />
                    {conv.isOnline && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{conv.participantName}</h3>
                      <div className="flex items-center gap-2">
                        {conv.unreadCount > 0 && (
                          <span className="bg-primary text-white text-xs rounded-full px-2 py-0.5">{conv.unreadCount}</span>
                        )}
                        <span className="text-xs text-stone-400">{formatDate(conv.lastMessageAt || '')}</span>
                      </div>
                    </div>
                    <p className={`text-sm mt-0.5 truncate ${conv.unreadCount > 0 ? 'font-medium text-stone-900' : 'text-stone-500'}`}>
                      {conv.lastMessage || 'No messages yet'}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-8"><Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} /></div>
        )}
      </div>
    </div>
  );
}
