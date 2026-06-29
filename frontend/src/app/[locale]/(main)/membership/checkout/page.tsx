'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  CreditCard, Shield, CheckCircle, AlertCircle, 
  Loader2, ArrowLeft, Lock, Tag
} from 'lucide-react';
import { membershipService, MembershipPlan } from '@/lib/api/services/membership.service';
import { toast } from 'sonner';

interface CheckoutState {
  plan: MembershipPlan | null;
  loading: boolean;
  processing: boolean;
  error: string | null;
  step: 'review' | 'payment' | 'success' | 'error';
  orderId: string | null;
  paymentId: string | null;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planId = searchParams.get('plan');

  const [state, setState] = useState<CheckoutState>({
    plan: null,
    loading: true,
    processing: false,
    error: null,
    step: 'review',
    orderId: null,
    paymentId: null
  });

  const fetchPlan = useCallback(async () => {
    if (!planId) {
      router.push('/membership');
      return;
    }

    try {
      const plans = await membershipService.getPlans();
      const selected = plans.find(p => p.id === planId);
      if (!selected) {
        router.push('/membership');
        return;
      }
      setState(prev => ({ ...prev, plan: selected, loading: false }));
    } catch {
      setState(prev => ({ ...prev, error: 'Failed to load plan', loading: false }));
    }
  }, [planId, router]);

  useEffect(() => {
    fetchPlan();
  }, [fetchPlan]);

  const handlePayment = async () => {
    if (!state.plan) return;

    setState(prev => ({ ...prev, processing: true, error: null }));

    try {
      const order = await membershipService.createOrder(state.plan.id);

      const options = {
        key: order.key,
        amount: order.amount * 100,
        currency: order.currency,
        name: 'M-Plus Matrimony',
        description: `${state.plan.name} Membership`,
        order_id: order.orderId,
        handler: async (response: any) => {
          try {
            const verified = await membershipService.verifyPayment(
              response.razorpay_payment_id,
              response.razorpay_order_id,
              response.razorpay_signature
            );

            if (verified) {
              setState(prev => ({
                ...prev,
                step: 'success',
                paymentId: response.razorpay_payment_id,
                processing: false
              }));
              toast.success('Payment successful! Welcome to premium.');
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (err) {
            setState(prev => ({
              ...prev,
              step: 'error',
              error: 'Payment verification failed. Please contact support.',
              processing: false
            }));
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          name: '',
          email: '',
          contact: ''
        },
        theme: {
          color: '#570013'
        },
        modal: {
          ondismiss: () => {
            setState(prev => ({ ...prev, processing: false }));
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: 'Failed to initiate payment. Please try again.',
        processing: false
      }));
      toast.error('Failed to initiate payment');
    }
  };

  if (state.loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-[#570013] animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (state.error && !state.plan) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">{state.error}</h2>
          <button
            onClick={() => router.push('/membership')}
            className="mt-4 px-6 py-2 bg-[#570013] text-white rounded-lg hover:bg-[#450010]"
          >
            Back to Plans
          </button>
        </div>
      </div>
    );
  }

  if (state.step === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center max-w-md w-full">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-gray-600 mb-6">
            Welcome to {state.plan?.name} membership. Enjoy all premium features.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-500">Payment ID</p>
            <p className="font-mono text-sm text-gray-900">{state.paymentId}</p>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full px-6 py-3 bg-[#570013] text-white rounded-lg hover:bg-[#450010] font-medium"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (state.step === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center max-w-md w-full">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h1>
          <p className="text-gray-600 mb-6">{state.error}</p>
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/membership')}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Back to Plans
            </button>
            <button
              onClick={handlePayment}
              className="flex-1 px-4 py-2 bg-[#570013] text-white rounded-lg hover:bg-[#450010]"
            >
              Retry Payment
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={() => router.push('/membership')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Plans
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

              {state.plan && (
                <div className="space-y-6">
                  {/* Plan Details */}
                  <div className="flex items-start justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">{state.plan.name}</h2>
                      <p className="text-sm text-gray-500 mt-1">{state.plan.durationDays} days membership</p>
                    </div>
                    <div className="text-right">
                      {state.plan.discountedPrice ? (
                        <>
                          <p className="text-sm text-gray-400 line-through">₹{state.plan.price}</p>
                          <p className="text-xl font-bold text-[#570013]">₹{state.plan.discountedPrice}</p>
                        </>
                      ) : (
                        <p className="text-xl font-bold text-[#570013]">₹{state.plan.price}</p>
                      )}
                    </div>
                  </div>

                  {/* Features */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">What&apos;s included:</h3>
                    <ul className="space-y-2">
                      {state.plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Coupon */}
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Enter coupon code"
                        className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#570013] focus:border-transparent"
                      />
                    </div>
                    <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium">
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Payment Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h2>

              <div className="space-y-4">
                {/* Razorpay Option */}
                <label className="flex items-center gap-3 p-4 border-2 border-[#570013] rounded-xl cursor-pointer bg-[#570013]/5">
                  <input type="radio" name="payment" value="razorpay" defaultChecked className="w-4 h-4 text-[#570013]" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Credit/Debit Card, UPI, Net Banking</p>
                    <p className="text-sm text-gray-500">Secure payment via Razorpay</p>
                  </div>
                  <CreditCard className="w-6 h-6 text-gray-400" />
                </label>

                {/* Security Badge */}
                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl">
                  <Shield className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-green-800">Secure Payment</p>
                    <p className="text-xs text-green-600">256-bit SSL encryption</p>
                  </div>
                </div>

                {/* Pay Button */}
                {state.plan && (
                  <button
                    onClick={handlePayment}
                    disabled={state.processing}
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-[#570013] text-white rounded-xl hover:bg-[#450010] transition-colors disabled:opacity-50 font-semibold text-lg"
                  >
                    {state.processing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        Pay ₹{state.plan.discountedPrice || state.plan.price}
                      </>
                    )}
                  </button>
                )}

                {/* Terms */}
                <p className="text-xs text-gray-500 text-center">
                  By completing this purchase, you agree to our{' '}
                  <a href="/terms" className="text-[#570013] underline">Terms of Service</a>
                  {' '}and{' '}
                  <a href="/privacy" className="text-[#570013] underline">Privacy Policy</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
