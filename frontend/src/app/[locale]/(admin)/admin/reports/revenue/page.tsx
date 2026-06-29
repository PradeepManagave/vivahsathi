'use client';

import React, { useState } from 'react';
import { TrendingUp, DollarSign, Users, CreditCard, ArrowUpRight, ArrowDownRight, Download, Calendar, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function AdminRevenueReportsPage() {
  const [dateRange, setDateRange] = useState('30d');

  const revenueData = {
    total: 1250000,
    subscriptions: 850000,
    upgrades: 250000,
    prepaid: 150000,
    refunds: 50000,
    netRevenue: 1200000,
    growth: 12.3,
    avgOrderValue: 2500,
    conversionRate: 4.2,
    monthlyRecurring: 75000
  };

  const planBreakdown = [
    { name: 'Free', users: 45000, revenue: 0, percentage: 60 },
    { name: 'Silver', users: 15000, revenue: 300000, percentage: 20 },
    { name: 'Gold', users: 8000, revenue: 480000, percentage: 10.7 },
    { name: 'Diamond', users: 2000, revenue: 470000, percentage: 2.7 }
  ];

  const monthlyRevenue = [
    { month: 'Jan', revenue: 85000 },
    { month: 'Feb', revenue: 92000 },
    { month: 'Mar', revenue: 78000 },
    { month: 'Apr', revenue: 105000 },
    { month: 'May', revenue: 115000 },
    { month: 'Jun', revenue: 98000 },
    { month: 'Jul', revenue: 120000 },
    { month: 'Aug', revenue: 135000 },
    { month: 'Sep', revenue: 110000 },
    { month: 'Oct', revenue: 125000 },
    { month: 'Nov', revenue: 140000 },
    { month: 'Dec', revenue: 147000 }
  ];

  const maxRevenue = Math.max(...monthlyRevenue.map((m) => m.revenue));

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 font-headline">Revenue Reports</h1>
          <p className="text-stone-500 mt-1">Track revenue and financial performance</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-stone-200 rounded-lg text-sm bg-white"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-stone-500">Total Revenue</p>
              <p className="text-2xl font-bold text-stone-900 mt-1">{formatCurrency(revenueData.total)}</p>
            </div>
            <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-success" />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-2 text-sm text-success">
            <ArrowUpRight className="w-4 h-4" />
            <span>+{revenueData.growth}%</span>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-stone-500">Net Revenue</p>
              <p className="text-2xl font-bold text-stone-900 mt-1">{formatCurrency(revenueData.netRevenue)}</p>
            </div>
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-stone-500">Avg Order Value</p>
              <p className="text-2xl font-bold text-stone-900 mt-1">{formatCurrency(revenueData.avgOrderValue)}</p>
            </div>
            <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-warning" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-stone-500">Monthly Recurring</p>
              <p className="text-2xl font-bold text-stone-900 mt-1">{formatCurrency(revenueData.monthlyRecurring)}</p>
            </div>
            <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-stone-900 mb-4">Monthly Revenue</h3>
          <div className="space-y-3">
            {monthlyRevenue.map((month) => (
              <div key={month.month} className="flex items-center gap-3">
                <span className="text-sm text-stone-500 w-8">{month.month}</span>
                <div className="flex-1 bg-stone-100 rounded-full h-6 relative overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-primary to-primary-400 h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                    style={{ width: `${(month.revenue / maxRevenue) * 100}%` }}
                  >
                    <span className="text-xs text-white font-medium">{formatCurrency(month.revenue)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-stone-900 mb-4">Revenue by Plan</h3>
          <div className="space-y-4">
            {planBreakdown.map((plan) => (
              <div key={plan.name} className="flex items-center gap-4">
                <div className="w-20">
                  <Badge
                    variant={plan.name === 'Free' ? 'outline' : plan.name === 'Gold' ? 'gold' : 'primary'}
                  >
                    {plan.name}
                  </Badge>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-stone-600">{plan.users.toLocaleString()} users</span>
                    <span className="font-medium text-stone-900">
                      {plan.revenue > 0 ? formatCurrency(plan.revenue) : '-'}
                    </span>
                  </div>
                  <div className="bg-stone-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        plan.name === 'Free'
                          ? 'bg-stone-400'
                          : plan.name === 'Silver'
                          ? 'bg-stone-500'
                          : plan.name === 'Gold'
                          ? 'bg-secondary-200'
                          : 'bg-primary'
                      }`}
                      style={{ width: `${plan.percentage * 5}%` }}
                    />
                  </div>
                </div>
                <span className="text-sm text-stone-500 w-12 text-right">{plan.percentage}%</span>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-stone-200">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-stone-500">Subscriptions</p>
                <p className="text-lg font-semibold text-stone-900">{formatCurrency(revenueData.subscriptions)}</p>
              </div>
              <div>
                <p className="text-sm text-stone-500">Upgrades</p>
                <p className="text-lg font-semibold text-stone-900">{formatCurrency(revenueData.upgrades)}</p>
              </div>
              <div>
                <p className="text-sm text-stone-500">Prepaid</p>
                <p className="text-lg font-semibold text-stone-900">{formatCurrency(revenueData.prepaid)}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
