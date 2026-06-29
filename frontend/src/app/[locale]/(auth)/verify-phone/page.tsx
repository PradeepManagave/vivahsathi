'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Phone, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { NativeSelect } from '@/components/ui/select';
import { authService } from '@/lib/api/services/auth.service';
import { toast } from 'sonner';

const countryCodes = [
  { value: '+91', label: 'India (+91)' },
  { value: '+1', label: 'USA (+1)' },
  { value: '+44', label: 'UK (+44)' },
  { value: '+971', label: 'UAE (+971)' },
  { value: '+65', label: 'Singapore (+65)' },
];

export default function VerifyPhonePage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp' | 'success'>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await authService.sendOtp({ phone: `${countryCode}${phone}` });
      setStep('otp');
      setResendTimer(30);
      toast.success('OTP sent to your phone');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await authService.verifyPhone(otp);
      setStep('success');
      toast.success('Phone verified successfully');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setLoading(true);
    try {
      await authService.sendOtp({ phone: `${countryCode}${phone}` });
      setResendTimer(30);
      toast.success('New OTP sent');
    } catch {
      toast.error('Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface px-4">
        <Card className="w-full max-w-md text-center p-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-stone-900 mb-2">Phone Verified!</h1>
          <p className="text-stone-500 mb-6">Your phone number has been verified successfully.</p>
          <Button variant="primary" fullWidth onClick={() => router.push('/dashboard')}>
            Go to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <Card className="w-full max-w-md p-8">
        <Link href="/login" className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-primary mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to login
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center">
            <Phone className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-stone-900">Verify Phone</h1>
            <p className="text-sm text-stone-500">
              {step === 'phone' ? 'Enter your phone number' : 'Enter the OTP sent to your phone'}
            </p>
          </div>
        </div>

        {step === 'phone' ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="flex gap-3">
              <div className="w-32">
                <NativeSelect
                  label="Code"
                  options={countryCodes}
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  fullWidth
                />
              </div>
              <div className="flex-1">
                <Input
                  label="Phone Number"
                  type="tel"
                  placeholder="Enter phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  error={error}
                  required
                  maxLength={10}
                  leftIcon={<Phone className="w-4 h-4" />}
                />
              </div>
            </div>
            <Button variant="primary" fullWidth loading={loading} type="submit">
              Send OTP
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <Input
              label="OTP"
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              error={error}
              required
              maxLength={6}
              className="text-center text-2xl tracking-widest"
            />
            <Button variant="primary" fullWidth loading={loading} type="submit">
              Verify Phone
            </Button>
            <div className="text-center">
              <button
                type="button"
                onClick={handleResend}
                disabled={resendTimer > 0}
                className="text-sm text-primary hover:underline disabled:opacity-50 disabled:no-underline"
              >
                {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : "Didn't receive OTP? Resend"}
              </button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}



