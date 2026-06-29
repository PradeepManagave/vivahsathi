'use client';

import React, { useState, useEffect } from 'react';
import { MessageSquare, CheckCircle, XCircle, Clock, Search, Filter, Reply, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Pagination } from '@/components/ui/pagination';

interface Inquiry {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  listingId: string;
  listingName: string;
  message: string;
  status: 'new' | 'replied' | 'closed';
  createdAt: string;
}

const statusConfig: Record<string, { color: string; icon: React.ReactNode }> = {
  new: { color: 'bg-blue-500/10 text-blue-600 border-blue-500/20', icon: <Clock className="w-3 h-3" /> },
  replied: { color: 'bg-success/10 text-success border-success/20', icon: <CheckCircle className="w-3 h-3" /> },
  closed: { color: 'bg-stone-100 text-stone-600 border-stone-200', icon: <XCircle className="w-3 h-3" /> }
};

export default function VendorInquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchInquiries = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/vendor/inquiries?page=${page}&status=${statusFilter}&search=${search}`);
        const data = await res.json();
        setInquiries(data.data?.inquiries || []);
        setTotalPages(data.data?.pagination?.totalPages || 1);
      } catch {
        console.error('Failed to fetch inquiries');
      } finally {
        setLoading(false);
      }
    };
    fetchInquiries();
  }, [page, statusFilter, search]);

  const formatTime = (date: string) => {
    const now = new Date();
    const inquiryDate = new Date(date);
    const diffMs = now.getTime() - inquiryDate.getTime();
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 font-headline">Inquiries</h1>
          <p className="text-stone-500 mt-1">Manage customer inquiries</p>
        </div>
      </div>

      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <Input
              placeholder="Search by customer name or message..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-stone-200 rounded-lg text-sm bg-white"
          >
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="replied">Replied</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        <div className="space-y-3">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="p-4">
                <div className="space-y-3">
                  <div className="h-5 bg-stone-100 rounded animate-pulse w-1/4" />
                  <div className="h-4 bg-stone-100 rounded animate-pulse w-3/4" />
                  <div className="h-4 bg-stone-100 rounded animate-pulse w-1/2" />
                </div>
              </Card>
            ))
          ) : inquiries.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 text-stone-300 mx-auto mb-3" />
              <p className="text-stone-500">No inquiries found</p>
            </div>
          ) : (
            inquiries.map((inquiry) => (
              <Card key={inquiry.id} className="p-4 hover:shadow-soft transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-semibold text-stone-900">{inquiry.customerName}</h3>
                      <Badge className={statusConfig[inquiry.status].color}>
                        {statusConfig[inquiry.status].icon}
                        <span className="ml-1 capitalize">{inquiry.status}</span>
                      </Badge>
                      <span className="text-xs text-stone-400">{formatTime(inquiry.createdAt)}</span>
                    </div>
                    <p className="text-sm text-stone-600 mb-2">
                      Re: <span className="font-medium">{inquiry.listingName}</span>
                    </p>
                    <p className="text-sm text-stone-500 line-clamp-2">{inquiry.message}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-stone-400">
                      <span>{inquiry.customerEmail}</span>
                      <span>{inquiry.customerPhone}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                    {inquiry.status !== 'closed' && (
                      <Button variant="primary" size="sm">
                        <Reply className="w-4 h-4 mr-1" />
                        Reply
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        <div className="mt-4">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </Card>
    </div>
  );
}
