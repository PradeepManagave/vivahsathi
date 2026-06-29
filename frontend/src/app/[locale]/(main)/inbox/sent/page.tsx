'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Send, Clock, Loader2 } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/ui/pagination';
import { messagingService } from '@/lib/api/services/messaging.service';
import { Interest } from '@/types';
import { toast } from 'sonner';

export default function InboxSentPage() {
  const router = useRouter();
  const [sent, setSent] = useState<Interest[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => { loadSent(); }, [page]);

  const loadSent = async () => {
    setLoading(true);
    try {
      const res = await messagingService.getSentInterests(page, 10);
      setSent(res.data);
      setTotalPages(res.meta?.totalPages || 1);
    } catch { toast.error('Failed to load sent interests'); }
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

  const statusBadge = (status: string) => {
    const map: Record<string, { variant: 'warning' | 'success' | 'error' | 'outline'; label: string }> = {
      pending: { variant: 'warning', label: 'Pending' },
      accepted: { variant: 'success', label: 'Accepted' },
      rejected: { variant: 'error', label: 'Rejected' },
      cancelled: { variant: 'outline', label: 'Cancelled' },
    };
    const s = map[status];
    return s ? <Badge variant={s.variant}>{s.label}</Badge> : null;
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
          <h1 className="text-2xl font-bold">Sent Interests</h1>
        </div>

        {sent.length === 0 ? (
          <Card className="text-center py-12">
            <Send className="w-12 h-12 text-stone-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No interests sent</h3>
            <Button variant="primary" onClick={() => router.push('/search')}>Find Matches</Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {sent.map((interest) => (
              <Card key={interest.id} className="p-4">
                <div className="flex items-center gap-4">
                  <Avatar src={undefined} name={interest.receiverId} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{interest.receiverId}</h3>
                      <div className="flex items-center gap-2">
                        {statusBadge(interest.status)}
                        <span className="text-xs text-stone-400 flex items-center gap-1"><Clock className="w-3 h-3" />{formatDate(interest.createdAt)}</span>
                      </div>
                    </div>
                    {interest.message && <p className="text-sm text-stone-500 mt-1 truncate">&quot;{interest.message}&quot;</p>}
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
