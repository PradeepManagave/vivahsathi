'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Megaphone, Search, Filter, MapPin, Clock,
  Phone, MessageCircle, Heart, Share2, Edit, Trash2,
  Map, Globe, User, Briefcase, Clock as ClockIcon,
  ArrowLeft, Eye, RefreshCw, DollarSign, SlidersHorizontal, Mail,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabPanel } from '@/components/ui/tabs';

interface ClassifiedDetail {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  price: string;
  postedBy: string;
  postedAt: string;
  phone: string;
  email?: string;
  images: string[];
  condition?: string;
  negotiable: boolean;
  views: number;
  favorites: number;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function ClassifiedDetailPage() {
  const params = useParams();
  const classifiedId = params.id as string;
  const [classified, setClassified] = useState<ClassifiedDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [favorites, setFavorites] = useState(0);

  useEffect(() => {
    const fetchClassified = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/marketplace/classifieds/${classifiedId}`);
        if (!res.ok) {
          throw new Error('Failed to fetch classified');
        }
        const data = await res.json();
        setClassified(data.data || null);
        setFavorites(data.data?.favorites || 0);
      } catch (err) {
        console.error('Error fetching classified:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchClassified();
  }, [classifiedId]);

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

  if (!classified) {
    return (
      <div className="p-6 text-center py-20">
        <p className="text-stone-500 text-lg">Classified not found</p>
        <Link href="/marketplace/classifieds">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Classifieds
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <Link href="/marketplace/classifieds">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Classifieds
        </Button>
      </Link>

      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-stone-900 font-headline">{classified.title}</h1>
            {classified.isFeatured && (
              <Badge variant="secondary">
                <Star className="w-3 h-3 mr-1" />
                Featured
              </Badge>
            )}
          </div>
          <p className="text-stone-500 mt-1">{classified.category} • {classified.location}</p>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4 text-stone-400" />
              <span className="text-sm text-stone-500">{classified.views} views</span>
            </div>
            <div className="flex items-center gap-1 text-stone-500 text-sm">
              <Heart className="w-4 h-4" />
              <span className="text-sm">{classified.favorites} favorites</span>
            </div>
            <div className="flex items-center gap-1 text-stone-500 text-sm">
              <ClockIcon className="w-4 h-4" />
              <span className="text-sm">{classified.postedAt}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button variant="outline">
            <Heart className="w-4 h-4 mr-2" />
            Favorite
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {classified.images.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {classified.images.slice(0, 4).map((img, i) => (
                <div key={i} className={`rounded-xl overflow-hidden ${i === 0 ? 'col-span-2 h-64' : 'h-32'}`}>
                  <div className="w-full h-full bg-gradient-to-br from-primary-50 to-primary-100" />
                </div>
              ))}
            </div>
          )}

          <Tabs tabs={[
            { id: 'overview', label: 'Overview' },
            { id: 'details', label: 'Details' },
            { id: 'seller', label: 'Seller Info' }
          ]} value={activeTab} onChange={setActiveTab}>
            <div className="mt-4">
              <TabPanel tabId="overview">
                <Card className="p-6">
                  <h2 className="text-lg font-semibold text-stone-900 mb-3">Description</h2>
                  <p className="text-stone-600 whitespace-pre-line">{classified.description}</p>
                </Card>
              </TabPanel>
              <TabPanel tabId="details">
                <Card className="p-6">
                  <h2 className="text-lg font-semibold text-stone-900 mb-3">Item Details</h2>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-sm">
                      <MapPin className="w-4 h-4 text-stone-400" />
                      <span>Location: {classified.location}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Clock className="w-4 h-4 text-stone-400" />
                      <span>Posted: {classified.postedAt}</span>
                    </div>
                    {classified.condition && (
                      <div className="flex items-center gap-3 text-sm">
                        <RefreshCw className="w-4 h-4 text-stone-400" />
                        <span>Condition: {classified.condition}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-3 text-sm">
                      <DollarSign className="w-4 h-4 text-stone-400" />
                      <span>Price: {classified.price}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <SlidersHorizontal className="w-4 h-4 text-stone-400" />
                      <span>Negotiable: {classified.negotiable ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                </Card>
              </TabPanel>
              <TabPanel tabId="seller">
                <Card className="p-6">
                  <h2 className="text-lg font-semibold text-stone-900 mb-3">Seller Information</h2>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <User className="w-4 h-4 text-stone-400" />
                      <span className="font-medium">{classified.postedBy}</span>
                    </div>
                    {classified.email && (
                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-stone-400" />
                        <span>
                          <a href={`mailto:${classified.email}`} className="text-primary hover:underline">
                            {classified.email}
                          </a>
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-stone-400" />
                      <span>
                        <a href={`tel:${classified.phone}`} className="text-primary hover:underline">
                          {classified.phone}
                        </a>
                      </span>
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
              <DollarSign className="w-4 h-4" />
              Price
            </h3>
            <p className="text-3xl font-bold text-primary mt-2">{classified.price}</p>
            <p className="text-stone-500 text-sm">{classified.negotiable ? 'Price negotiable' : 'Fixed price'}</p>
          </Card>

          <Button 
            variant="outline" 
            className="w-full flex items-center justify-center gap-3"
            onClick={() => {
              // TODO: Implement contact seller functionality
              alert('Contact seller feature coming soon');
            }}
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Contact Seller
          </Button>

          {classified.isFeatured ? (
            <Button variant="outline" className="w-full flex items-center justify-center gap-3">
              <Star className="w-4 h-4 mr-2" />
              Remove from Featured
            </Button>
          ) : (
            <Button variant="primary" className="w-full flex items-center justify-center gap-3">
              <Star className="w-4 h-4 mr-2" />
              Mark as Featured
            </Button>
          )}

          <Button variant="destructive" className="w-full flex items-center justify-center gap-3 mt-4">
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Listing
          </Button>
        </div>
      </div>
    </div>
  );
}