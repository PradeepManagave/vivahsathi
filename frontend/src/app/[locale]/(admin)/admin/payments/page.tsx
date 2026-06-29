'use client';

import React, { useState, useEffect } from 'react';
import { CreditCard, Download, Filter, Search, ArrowUpRight, ArrowDownRight, DollarSign, TrendingUp, Users, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Pagination } from '@/components/ui/pagination';

interface Payment {
  id: string;
  memberId: string;
  memberName: string;
  amount: number;
  currency: string;
  type: 'subscription' | 'upgrade' | 'prepaid' | 'refund';
  status: 'success' | 'pending' | 'failed' | 'refunded';
  method: 'razorpay' | 'stripe' | 'cash' | 'bank_transfer';
  plan?: string;
  transactionId?: string;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  success: 'bg-success/10 text-success border-success/20',
  pending: 'bg-warning/10 text-warning border-warning/20',
  failed: 'bg-error/10 text-error border-error/20',
  refunded: 'bg-stone-100 text-stone-600 border-stone-200'
};

const methodLabels: Record<string, string> = {
  razorpay: 'Razorpay',
  stripe: 'Stripe',
  cash: 'Cash',
  bank_transfer: 'Bank Transfer'
};

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/admin/payments?page=${page}&status=${statusFilter}&type=${typeFilter}&search=${search}`);
        const data = await res.json();
        setPayments(data.data?.payments || []);
        setTotalPages(data.data?.pagination?.totalPages || 1);
      } catch {
        console.error('Failed to fetch payments');
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, [page, statusFilter, typeFilter, search]);

  const stats = {
    totalRevenue: 1250000,
    thisMonth: 85000,
    pendingAmount: 12000,
    refundAmount: 5000,
    successRate: 94.5,
    growth: 12.3
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 font-headline">Payments</h1>
          <p className="text-stone-500 mt-1">Manage transactions and revenue</p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-stone-500">Total Revenue</p>
              <p className="text-2xl font-bold text-stone-900 mt-1">{formatCurrency(stats.totalRevenue)}</p>
            </div>
            <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-success" />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-2 text-sm text-success">
            <TrendingUp className="w-4 h-4" />
            <span>+{stats.growth}% from last month</span>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-stone-500">This Month</p>
              <p className="text-2xl font-bold text-stone-900 mt-1">{formatCurrency(stats.thisMonth)}</p>
            </div>
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-stone-500">Pending</p>
              <p className="text-2xl font-bold text-warning mt-1">{formatCurrency(stats.pendingAmount)}</p>
            </div>
            <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-warning" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-stone-500">Success Rate</p>
              <p className="text-2xl font-bold text-stone-900 mt-1">{stats.successRate}%</p>
            </div>
            <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-success" />
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <Input
              placeholder="Search by member name or transaction ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-stone-200 rounded-lg text-sm bg-white"
            >
              <option value="all">All Status</option>
              <option value="success">Success</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-stone-200 rounded-lg text-sm bg-white"
            >
              <option value="all">All Types</option>
              <option value="subscription">Subscription</option>
              <option value="upgrade">Upgrade</option>
              <option value="prepaid">Prepaid</option>
              <option value="refund">Refund</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-stone-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-stone-500">Transaction</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-stone-500">Member</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-stone-500">Amount</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-stone-500">Type</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-stone-500">Method</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-stone-500">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-stone-500">Date</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-stone-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-stone-100">
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="py-3 px-4">
                        <div className="h-4 bg-stone-100 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-stone-500">
                    No payments found
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr key={payment.id} className="border-b border-stone-100 hover:bg-stone-50/50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-stone-400" />
                        <span className="text-sm font-mono text-stone-600">{payment.transactionId || '-'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="text-sm font-medium text-stone-900">{payment.memberName}</p>
                        <p className="text-xs text-stone-500">{payment.memberId}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm font-semibold text-stone-900">
                        {formatCurrency(payment.amount)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-stone-600 capitalize">{payment.type}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-stone-600">{methodLabels[payment.method]}</span>
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={statusColors[payment.status]}>
                        {payment.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-stone-500">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Button variant="ghost" size="sm">
                        <ArrowUpRight className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </Card>
    </div>
  );
}
