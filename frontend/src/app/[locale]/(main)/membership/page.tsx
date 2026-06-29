'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Crown, Check, Star, Zap, Shield, Video, Phone, Heart, Loader2, MessageSquare, ArrowRight } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { membershipService, MembershipPlan } from '@/lib/api/services/membership.service';
import { toast } from 'sonner';

export default function MembershipPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const data = await membershipService.getPlans();
      setPlans(data);
    } catch {
      toast.error('Failed to load membership plans');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = (planId: string) => {
    router.push(`/membership/checkout?plan=${planId}`);
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
      <div className="container-page py-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-stone-900 mb-2">Upgrade Your Membership</h1>
          <p className="text-stone-500 max-w-2xl mx-auto">
            Unlock premium features to find your perfect life partner faster
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              variant={plan.isPopular ? 'hover' : 'default'}
              className={`relative p-6 ${plan.isPopular ? 'border-2 border-primary shadow-lg' : ''}`}
            >
              {plan.isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge variant="primary" className="px-3 py-1">
                    <Star className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-stone-900">{plan.name}</h3>
                <div className="mt-2">
                  <span className="text-4xl font-bold text-primary">
                    ₹{plan.discountedPrice || plan.price}
                  </span>
                  {plan.discountedPrice && (
                    <span className="text-lg text-stone-400 line-through ml-2">
                      ₹{plan.price}
                    </span>
                  )}
                </div>
                <p className="text-sm text-stone-500 mt-1">
                  for {plan.durationDays} days
                </p>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-stone-600">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                variant={plan.isPopular ? 'primary' : 'outline'}
                fullWidth
                onClick={() => handleUpgrade(plan.id)}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                {plan.isPopular ? 'Upgrade Now' : 'Get Started'}
              </Button>
            </Card>
          ))}
        </div>

        {/* Features Comparison */}
        <div className="mt-16 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-stone-900 text-center mb-8">
            Why Upgrade to Premium?
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Heart, title: 'Unlimited Interests', desc: 'Send interests to unlimited profiles' },
              { icon: MessageSquare, title: 'Priority Messaging', desc: 'Get your messages seen first' },
              { icon: Video, title: 'Video Chat', desc: 'Connect face-to-face securely' },
              { icon: Phone, title: 'View Contacts', desc: 'Access phone numbers directly' },
              { icon: Shield, title: 'Verified Badge', desc: 'Stand out with verification' },
              { icon: Zap, title: 'Profile Boost', desc: 'Get featured in search results' },
              { icon: Star, title: 'Advanced Filters', desc: 'Refine your search precisely' },
              { icon: Crown, title: 'Premium Support', desc: 'Dedicated customer support' },
            ].map((feature, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-stone-900 text-sm">{feature.title}</h3>
                <p className="text-xs text-stone-500 mt-1">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
