'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin, Phone, Mail, Globe, Star, Clock, CheckCircle, MessageSquare, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabPanel } from '@/components/ui/tabs';

interface VendorDetail {
  id: string;
  businessName: string;
  slug: string;
  category: string;
  description: string;
  longDescription: string;
  location: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  priceRange: string;
  images: string[];
  services: string[];
  workingHours: { day: string; hours: string }[];
  createdAt: string;
}

export default function VendorDetailPage() {
  const params = useParams();
  const vendorId = params.id as string;
  const [vendor, setVendor] = useState<VendorDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchVendor = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/marketplace/vendors/${vendorId}`);
        const data = await res.json();
        setVendor(data.data || null);
      } catch {
        console.error('Failed to fetch vendor');
      } finally {
        setLoading(false);
      }
    };
    fetchVendor();
  }, [vendorId]);

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

  if (!vendor) {
    return (
      <div className="p-6 text-center py-20">
        <p className="text-stone-500 text-lg">Vendor not found</p>
        <Link href="/marketplace">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Marketplace
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <Link href="/marketplace">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Marketplace
        </Button>
      </Link>

      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-stone-900 font-headline">{vendor.businessName}</h1>
            {vendor.isVerified && (
              <Badge variant="success">
                <CheckCircle className="w-3 h-3 mr-1" />
                Verified
              </Badge>
            )}
          </div>
          <p className="text-stone-500 mt-1">{vendor.category} • {vendor.priceRange}</p>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="font-medium">{vendor.rating}</span>
              <span className="text-stone-400 text-sm">({vendor.reviewCount} reviews)</span>
            </div>
            <div className="flex items-center gap-1 text-stone-500 text-sm">
              <MapPin className="w-4 h-4" />
              {vendor.location}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button variant="primary">
            <MessageSquare className="w-4 h-4 mr-2" />
            Send Inquiry
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {vendor.images.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {vendor.images.slice(0, 4).map((img, i) => (
                <div key={i} className={`rounded-xl overflow-hidden ${i === 0 ? 'col-span-2 h-64' : 'h-32'}`}>
                  <div className="w-full h-full bg-gradient-to-br from-primary-50 to-primary-100" />
                </div>
              ))}
            </div>
          )}

          <Tabs tabs={[
            { id: 'overview', label: 'Overview' },
            { id: 'services', label: 'Services' },
            { id: 'reviews', label: 'Reviews' }
          ]} value={activeTab} onChange={setActiveTab}>
            <div className="mt-4">
              <TabPanel tabId="overview">
                <Card className="p-6">
                  <h2 className="text-lg font-semibold text-stone-900 mb-3">About</h2>
                  <p className="text-stone-600 whitespace-pre-line">{vendor.longDescription || vendor.description}</p>
                </Card>
              </TabPanel>
              <TabPanel tabId="services">
                <Card className="p-6">
                  <h2 className="text-lg font-semibold text-stone-900 mb-3">Services Offered</h2>
                  <div className="grid grid-cols-2 gap-3">
                    {vendor.services.map((service, i) => (
                      <div key={i} className="flex items-center gap-2 p-3 bg-stone-50 rounded-lg">
                        <CheckCircle className="w-4 h-4 text-success" />
                        <span className="text-sm text-stone-700">{service}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </TabPanel>
              <TabPanel tabId="reviews">
                <Card className="p-6">
                  <h2 className="text-lg font-semibold text-stone-900 mb-3">Customer Reviews</h2>
                  <p className="text-stone-500 text-center py-8">Reviews coming soon</p>
                </Card>
              </TabPanel>
            </div>
          </Tabs>
        </div>

        <div className="space-y-4">
          <Card className="p-4">
            <h3 className="font-semibold text-stone-900 mb-3">Contact Information</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-stone-400" />
                <span>{vendor.address}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-stone-400" />
                <a href={`tel:${vendor.phone}`} className="text-primary hover:underline">{vendor.phone}</a>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-stone-400" />
                <a href={`mailto:${vendor.email}`} className="text-primary hover:underline">{vendor.email}</a>
              </div>
              {vendor.website && (
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="w-4 h-4 text-stone-400" />
                  <a href={vendor.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    {vendor.website}
                  </a>
                </div>
              )}
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold text-stone-900 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Working Hours
            </h3>
            <div className="space-y-2">
              {vendor.workingHours.map((wh) => (
                <div key={wh.day} className="flex items-center justify-between text-sm">
                  <span className="text-stone-600">{wh.day}</span>
                  <span className="text-stone-900 font-medium">{wh.hours}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
