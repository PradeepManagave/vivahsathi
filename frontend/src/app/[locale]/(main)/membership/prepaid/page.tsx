'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Zap, Check, Loader2 } from 'lucide-react';
import { membershipService, PrepaidPack } from '@/lib/api/services/membership.service';
import { toast } from 'sonner';

export default function PrepaidPage() {
  const router = useRouter();
  const [packs, setPacks] = useState<PrepaidPack[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPacks();
  }, []);

  const loadPacks = async () => {
    try {
      const data = await membershipService.getPrepaidPacks();
      setPacks(data);
    } catch {
      toast.error('Failed to load prepaid packs');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = (packId: string) => {
    router.push(`/membership/checkout?pack=${packId}&type=prepaid`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#570013] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <button
          onClick={() => router.push('/membership')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Membership
        </button>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Prepaid Packs</h1>
          <p className="text-gray-500 mt-2">Buy contact credits without a subscription</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {packs.map((pack) => (
            <div
              key={pack.id}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-[#570013]/10 rounded-xl flex items-center justify-center">
                  <Zap className="w-6 h-6 text-[#570013]" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{pack.name}</h3>
                  <p className="text-sm text-gray-500">{pack.contacts} contacts</p>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4">{pack.description}</p>

              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-3xl font-bold text-[#570013]">₹{pack.price}</span>
                <span className="text-sm text-gray-500">
                  (₹{Math.round(pack.price / pack.contacts)}/contact)
                </span>
              </div>

              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  {pack.contacts} profile contacts
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  Valid for {pack.durationDays} days
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  No subscription required
                </li>
              </ul>

              <button
                onClick={() => handlePurchase(pack.id)}
                className="w-full py-3 bg-[#570013] text-white rounded-xl hover:bg-[#450010] transition-colors font-medium"
              >
                Buy Now
              </button>
            </div>
          ))}
        </div>

        {packs.length === 0 && (
          <div className="text-center py-12">
            <Zap className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No prepaid packs available</p>
          </div>
        )}
      </div>
    </div>
  );
}
