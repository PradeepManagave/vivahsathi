'use client';

import React, { useState, useEffect } from 'react';
import { Activity, Filter, Search, User, Settings, CreditCard, Shield, AlertTriangle, Eye, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Pagination } from '@/components/ui/pagination';

interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  entityType: string;
  entityId?: string;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

const actionIcons: Record<string, React.ReactNode> = {
  login: <User className="w-4 h-4" />,
  logout: <User className="w-4 h-4" />,
  profile_update: <Settings className="w-4 h-4" />,
  payment: <CreditCard className="w-4 h-4" />,
  admin_action: <Shield className="w-4 h-4" />,
  error: <AlertTriangle className="w-4 h-4" />,
  view: <Eye className="w-4 h-4" />
};

const actionColors: Record<string, string> = {
  login: 'bg-success/10 text-success',
  logout: 'bg-stone-100 text-stone-600',
  profile_update: 'bg-primary/10 text-primary',
  payment: 'bg-warning/10 text-warning',
  admin_action: 'bg-blue-500/10 text-blue-600',
  error: 'bg-error/10 text-error',
  view: 'bg-stone-100 text-stone-500'
};

export default function AdminActivityLogPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/admin/activity-log?page=${page}&action=${actionFilter}&role=${roleFilter}&search=${search}`);
        const data = await res.json();
        setLogs(data.data?.logs || []);
        setTotalPages(data.data?.pagination?.totalPages || 1);
      } catch {
        console.error('Failed to fetch activity logs');
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [page, actionFilter, roleFilter, search]);

  const formatTime = (date: string) => {
    const now = new Date();
    const logDate = new Date(date);
    const diffMs = now.getTime() - logDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 font-headline">Activity Log</h1>
          <p className="text-stone-500 mt-1">Track all user and admin actions</p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <Input
              placeholder="Search by user name, action, or IP address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="px-3 py-2 border border-stone-200 rounded-lg text-sm bg-white"
            >
              <option value="all">All Actions</option>
              <option value="login">Login</option>
              <option value="logout">Logout</option>
              <option value="profile_update">Profile Update</option>
              <option value="payment">Payment</option>
              <option value="admin_action">Admin Action</option>
              <option value="error">Error</option>
            </select>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 border border-stone-200 rounded-lg text-sm bg-white"
            >
              <option value="all">All Roles</option>
              <option value="member">Member</option>
              <option value="admin">Admin</option>
              <option value="staff">Staff</option>
              <option value="franchise">Franchise</option>
            </select>
          </div>
        </div>

        <div className="space-y-3">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4 bg-stone-50 rounded-lg">
                <div className="w-8 h-8 bg-stone-200 rounded-full animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-stone-200 rounded animate-pulse w-1/3" />
                  <div className="h-3 bg-stone-200 rounded animate-pulse w-2/3" />
                </div>
              </div>
            ))
          ) : logs.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="w-12 h-12 text-stone-300 mx-auto mb-3" />
              <p className="text-stone-500">No activity logs found</p>
            </div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="flex items-start gap-4 p-4 bg-stone-50 rounded-lg hover:bg-stone-100/50 transition-colors">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${actionColors[log.action] || 'bg-stone-100 text-stone-500'}`}>
                  {actionIcons[log.action] || <Activity className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-stone-900">{log.userName}</span>
                    <Badge variant="outline" className="text-xs">{log.userRole}</Badge>
                    <Badge className={actionColors[log.action] || 'bg-stone-100 text-stone-600'}>
                      {log.action.replace('_', ' ')}
                    </Badge>
                  </div>
                  {log.details && (
                    <p className="text-sm text-stone-600 mt-1 truncate">{log.details}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-xs text-stone-400">
                    <span>{formatTime(log.createdAt)}</span>
                    {log.ipAddress && <span>IP: {log.ipAddress}</span>}
                    {log.entityType && <span>Entity: {log.entityType}</span>}
                  </div>
                </div>
              </div>
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
