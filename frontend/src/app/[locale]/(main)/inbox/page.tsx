'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, MessageSquare, Send, Clock, Check, CheckCheck, Loader2 } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabPanel } from '@/components/ui/tabs';
import { Pagination } from '@/components/ui/pagination';
import { messagingService } from '@/lib/api/services/messaging.service';
import { Interest } from '@/types';
import { toast } from 'sonner';

export default function InboxPage() {
  const router = useRouter();
  const [received, setReceived] = useState<Interest[]>([]);
  const [sent, setSent] = useState<Interest[]>([]);
  const [matches, setMatches] = useState<Interest[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadInterests();
  }, [page]);

  const loadInterests = async () => {
    setLoading(true);
    try {
      const [receivedRes, sentRes, matchesRes] = await Promise.all([
        messagingService.getReceivedInterests(page, 10),
        messagingService.getSentInterests(page, 10),
        messagingService.getMatches(page, 10),
      ]);
      setReceived(receivedRes.data);
      setSent(sentRes.data);
      setMatches(matchesRes.data);
      setTotalPages(Math.max(receivedRes.meta?.totalPages || 1, sentRes.meta?.totalPages || 1));
    } catch {
      toast.error('Failed to load interests');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (interestId: string) => {
    try {
      await messagingService.acceptInterest(interestId);
      toast.success('Interest accepted');
      loadInterests();
    } catch {
      toast.error('Failed to accept interest');
    }
  };

  const handleReject = async (interestId: string) => {
    try {
      await messagingService.rejectInterest(interestId);
      toast.success('Interest rejected');
      loadInterests();
    } catch {
      toast.error('Failed to reject interest');
    }
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString();
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'accepted':
        return <Badge variant="success">Accepted</Badge>;
      case 'rejected':
        return <Badge variant="error">Rejected</Badge>;
      case 'cancelled':
        return <Badge variant="outline">Cancelled</Badge>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface">
        <Header variant="member" />
        <div className="container-page py-8 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      <Header variant="member" />
      <div className="container-page py-6">
        <h1 className="text-2xl font-bold text-stone-900 mb-6">Inbox</h1>

        <Tabs
          tabs={[
            { id: 'received', label: 'Received', icon: <Heart className="w-4 h-4" />, badge: received.length },
            { id: 'sent', label: 'Sent', icon: <Send className="w-4 h-4" />, badge: sent.length },
            { id: 'matches', label: 'Matches', icon: <MessageSquare className="w-4 h-4" />, badge: matches.length },
          ]}
        >
          <TabPanel tabId="received">
            {received.length === 0 ? (
              <Card className="text-center py-12">
                <Heart className="w-12 h-12 text-stone-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-stone-900 mb-2">No interests received</h3>
                <p className="text-stone-500">When someone sends you interest, it will appear here</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {received.map((interest) => (
                  <Card key={interest.id} className="p-4">
                    <div className="flex items-center gap-4">
                      <Avatar
                        src={undefined}
                        name={interest.senderId}
                        size="md"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-stone-900">
                            {interest.senderId}
                          </h3>
                          <div className="flex items-center gap-2">
                            {statusBadge(interest.status)}
                            <span className="text-xs text-stone-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDate(interest.createdAt)}
                            </span>
                          </div>
                        </div>
                        {interest.message && (
                          <p className="text-sm text-stone-500 mt-1 truncate">&quot;{interest.message}&quot;</p>
                        )}
                      </div>
                      {interest.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            variant="primary"
                            size="sm"
                            leftIcon={<Check className="w-3.5 h-3.5" />}
                            onClick={() => handleAccept(interest.id)}
                          >
                            Accept
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleReject(interest.id)}
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                      {interest.status === 'accepted' && (
                        <Button
                          variant="outline"
                          size="sm"
                          leftIcon={<CheckCheck className="w-3.5 h-3.5" />}
                          onClick={() => router.push(`/chat/${interest.senderId}`)}
                        >
                          Chat
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabPanel>

          <TabPanel tabId="sent">
            {sent.length === 0 ? (
              <Card className="text-center py-12">
                <Send className="w-12 h-12 text-stone-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-stone-900 mb-2">No interests sent</h3>
                <Button variant="primary" onClick={() => router.push('/search')}>
                  Find Matches
                </Button>
              </Card>
            ) : (
              <div className="space-y-3">
                {sent.map((interest) => (
                  <Card key={interest.id} className="p-4">
                    <div className="flex items-center gap-4">
                      <Avatar
                        src={undefined}
                        name={interest.receiverId}
                        size="md"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-stone-900">
                            {interest.receiverId}
                          </h3>
                          <div className="flex items-center gap-2">
                            {statusBadge(interest.status)}
                            <span className="text-xs text-stone-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDate(interest.createdAt)}
                            </span>
                          </div>
                        </div>
                        {interest.message && (
                          <p className="text-sm text-stone-500 mt-1 truncate">&quot;{interest.message}&quot;</p>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabPanel>

          <TabPanel tabId="matches">
            {matches.length === 0 ? (
              <Card className="text-center py-12">
                <MessageSquare className="w-12 h-12 text-stone-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-stone-900 mb-2">No matches yet</h3>
                <p className="text-stone-500">When you and someone else accept each other, you&apos;ll match!</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {matches.map((match) => (
                  <Card key={match.id} variant="hover" className="p-4 cursor-pointer" onClick={() => router.push(`/chat/${match.senderId}`)}>
                    <div className="flex items-center gap-4">
                      <Avatar
                        src={undefined}
                        name={`${match.senderId}`}
                        size="lg"
                      />
                      <div>
                        <h3 className="font-semibold text-stone-900">
                          {match.senderId}
                        </h3>
                        <p className="text-sm text-stone-500">Matched {formatDate(match.createdAt)}</p>
                        <Button variant="primary" size="sm" className="mt-2" leftIcon={<MessageSquare className="w-3.5 h-3.5" />}>
                          Send Message
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabPanel>
        </Tabs>

        {totalPages > 1 && (
          <div className="mt-8">
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>
    </div>
  );
}
