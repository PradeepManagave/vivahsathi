'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, MapPin, Phone, Mail, Globe, Star, Clock, CheckCircle, 
  MessageSquare, Share2, Users, Briefcase, Building, Calendar, 
  DollarSign, PieChart, BarChart3, UserPlus, Settings, Circle, Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabPanel } from '@/components/ui/tabs';

interface FranchiseDetail {
  id: string;
  name: string;
  slug: string;
  description: string;
  address: string;
  location: string;
  phone: string;
  email: string;
  website?: string;
  logo?: string;
  banner?: string;
  establishedYear: number;
  ownerName: string;
  contactPerson: string;
  isActive: boolean;
  isVerified: boolean;
  totalMembers: number;
  totalStaff: number;
  monthlyRevenue: number;
  commissionRate: number;
  services: string[];
  workingHours: { day: string; hours: string }[];
  socialMedia: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function FranchiseDetailPage() {
  const params = useParams();
  const franchiseId = params.id as string;
  const [franchise, setFranchise] = useState<FranchiseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchFranchise = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/admin/franchises/${franchiseId}`);
        if (!res.ok) {
          throw new Error('Failed to fetch franchise');
        }
        const data = await res.json();
        setFranchise(data.data || null);
      } catch (err) {
        console.error('Error fetching franchise:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFranchise();
  }, [franchiseId]);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-8 bg-stone-100 rounded animate-pulse w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-64 bg-stone-100 rounded-xl animate-pulse" />
            <div className="h-6 bg-stone-100 rounded animate-pulse w-3/4" />
            <div className="h-4 bg-stone-100 rounded animate-pulse w-full" />
            <div className="h-4 bg-stone-100 rounded animate-pulse w-2/3" />
          </div>
          <div className="space-y-4">
            <div className="h-48 bg-stone-100 rounded-xl animate-pulse" />
            <div className="h-32 bg-stone-100 rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!franchise) {
    return (
      <div className="p-6 text-center py-20">
        <p className="text-stone-500 text-lg">Franchise not found</p>
        <Link href="/admin/franchises">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Franchises
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <Link href="/admin/franchises">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Franchises
        </Button>
      </Link>

      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-stone-900 font-headline">{franchise.name}</h1>
            {franchise.isVerified && (
              <Badge variant="success">
                <CheckCircle className="w-3 h-3 mr-1" />
                Verified
              </Badge>
            )}
            {franchise.isActive && (
              <Badge variant="secondary">
                <Circle className="w-3 h-3 mr-1" />
                Active
              </Badge>
            )}
          </div>
          <p className="text-stone-500 mt-1">{franchise.location} • Est. {franchise.establishedYear}</p>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-amber-400" />
              <span className="text-sm text-stone-500">Rating: 4.8</span>
            </div>
            <div className="flex items-center gap-1 text-stone-500 text-sm">
              <MapPin className="w-4 h-4" />
              {franchise.location}
            </div>
            <div className="flex items-center gap-1 text-stone-500 text-sm">
              <Clock className="w-4 h-4" />
              <span className="text-sm">{franchise.workingHours.find(wh => wh.day === new Date().toLocaleString('en-us', { weekday: 'long' }))?.hours || 'Check hours'}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button variant="outline">
            <MessageSquare className="w-4 h-4 mr-2" />
            Message
          </Button>
          {!franchise.isVerified && (
            <Button variant="outline">
              <CheckCircle className="w-4 h-4 mr-2" />
              Verify
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {franchise.banner && (
            <div className="rounded-xl overflow-hidden h-48">
              <div className="w-full h-full bg-gradient-to-br from-primary-50 to-primary-100" />
            </div>
          )}

          <Tabs tabs={[
            { id: 'overview', label: 'Overview' },
            { id: 'details', label: 'Details' },
            { id: 'stats', label: 'Statistics' },
            { id: 'settings', label: 'Settings' }
          ]} value={activeTab} onChange={setActiveTab}>
            <div className="mt-4">
              <TabPanel tabId="overview">
                <Card className="p-6">
                  <h2 className="text-lg font-semibold text-stone-900 mb-3">About</h2>
                  <p className="text-stone-600 whitespace-pre-line">{franchise.description}</p>
                </Card>
              </TabPanel>
              <TabPanel tabId="details">
                <Card className="p-6">
                  <h2 className="text-lg font-semibold text-stone-900 mb-3">Contact Information</h2>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-stone-400" />
                      <span>{franchise.address}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-stone-400" />
                      <span>
                        <a href={`tel:${franchise.phone}`} className="text-primary hover:underline">
                          {franchise.phone}
                        </a>
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-stone-400" />
                      <span>
                        <a href={`mailto:${franchise.email}`} className="text-primary hover:underline">
                          {franchise.email}
                        </a>
                      </span>
                    </div>
                    {franchise.website && (
                      <div className="flex items-center gap-3">
                        <Globe className="w-4 h-4 text-stone-400" />
                        <span>
                          <a href={franchise.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                            {franchise.website}
                          </a>
                        </span>
                      </div>
                    )}
                  </div>
                </Card>
              </TabPanel>
              <TabPanel tabId="stats">
                <Card className="p-6">
                  <h2 className="text-lg font-semibold text-stone-900 mb-3">Franchise Statistics</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <p className="text-xs font-bold text-stone-500 uppercase">Total Members</p>
                      <p className="text-2xl font-bold text-primary">{franchise.totalMembers}</p>
                    </div>
                    <div className="space-y-3">
                      <p className="text-xs font-bold text-stone-500 uppercase">Total Staff</p>
                      <p className="text-2xl font-bold text-primary">{franchise.totalStaff}</p>
                    </div>
                    <div className="space-y-3">
                      <p className="text-xs font-bold text-stone-500 uppercase">Monthly Revenue</p>
                      <p className="text-2xl font-bold text-primary">₹{franchise.monthlyRevenue.toLocaleString()}</p>
                    </div>
                    <div className="space-y-3">
                      <p className="text-xs font-bold text-stone-500 uppercase">Commission Rate</p>
                      <p className="text-2xl font-bold text-primary">{franchise.commissionRate}%</p>
                    </div>
                  </div>
                  <div className="mt-6">
                    <div className="h-4 w-full bg-primary-50 rounded" />
                  </div>
                </Card>
              </TabPanel>
              <TabPanel tabId="settings">
                <Card className="p-6">
                  <h2 className="text-lg font-semibold text-stone-900 mb-3">Franchise Settings</h2>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Users className="w-4 h-4 text-stone-400" />
                      <span className="font-medium">Staff Management</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Building className="w-4 h-4 text-stone-400" />
                      <span className="font-medium">Branch Management</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Settings className="w-4 h-4 text-stone-400" />
                      <span className="font-medium">Franchise Settings</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <PieChart className="w-4 h-4 text-stone-400" />
                      <span className="font-medium">Reports & Analytics</span>
                    </div>
                  </div>
                </Card>
              </TabPanel>
            </div>
          </Tabs>
        </div>

        <div className="space-y-4">
          <Card className="p-4">
            <h3 className="font-semibold text-stone-900 mb-3 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Network Size
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>Active Members</span>
                <span className="font-medium text-stone-900">{franchise.totalMembers}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Staff Count</span>
                <span className="font-medium text-stone-900">{franchise.totalStaff}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Franchise Age</span>
                <span className="font-medium text-stone-900">{new Date().getFullYear() - franchise.establishedYear} years</span>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold text-stone-900 mb-3 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Financial Overview
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>Monthly Revenue</span>
                <span className="font-medium text-stone-900">₹{franchise.monthlyRevenue.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Commission Rate</span>
                <span className="font-medium text-stone-900">{franchise.commissionRate}%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Est. Monthly Profit</span>
                <span className="font-medium text-stone-900">₹{(franchise.monthlyRevenue * (1 - franchise.commissionRate/100)).toLocaleString()}</span>
              </div>
            </div>
          </Card>

          <Button 
            variant="outline" 
            className="w-full flex items-center justify-center gap-3"
            onClick={() => {
              // TODO: Edit franchise functionality
              alert('Edit franchise feature coming soon');
            }}
          >
            <Users className="w-4 h-4 mr-2" />
            Manage Staff
          </Button>

          <Button variant="destructive" className="w-full flex items-center justify-center gap-3 mt-4">
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Franchise
          </Button>
        </div>
      </div>
    </div>
  );
}