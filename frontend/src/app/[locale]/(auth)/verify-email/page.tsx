'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { authService } from '@/lib/api/services/auth.service';
import { toast } from 'sonner';

export default function VerifyEmailPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp' | 'success'>('email');
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
      await authService.sendOtp({ email });
      setStep('otp');
      setResendTimer(30);
      toast.success('Verification code sent to your email');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await authService.verifyEmail(otp);
      setStep('success');
      toast.success('Email verified successfully');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setLoading(true);
    try {
      await authService.sendOtp({ email });
      setResendTimer(30);
      toast.success('New code sent');
    } catch (err: any) {
      toast.error('Failed to resend code');
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
          <h1 className="text-2xl font-bold text-stone-900 mb-2">Email Verified!</h1>
          <p className="text-stone-500 mb-6">
            Your email has been successfully verified. You can now access all features.
          </p>
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
            <Mail className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-stone-900">Verify Email</h1>
            <p className="text-sm text-stone-500">
              {step === 'email' ? 'Enter your email address' : 'Enter the code sent to your email'}
            </p>
          </div>
        </div>

        {step === 'email' ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={error}
              required
              leftIcon={<Mail className="w-4 h-4" />}
            />
            <Button variant="primary" fullWidth loading={loading} type="submit">
              Send Verification Code
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <Input
              label="Verification Code"
              type="text"
              placeholder="Enter 6-digit code"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              error={error}
              required
              maxLength={6}
              className="text-center text-2xl tracking-widest"
            />
            <Button variant="primary" fullWidth loading={loading} type="submit">
              Verify Email
            </Button>
            <div className="text-center">
              <button
                type="button"
                onClick={handleResend}
                disabled={resendTimer > 0}
                className="text-sm text-primary hover:underline disabled:opacity-50 disabled:no-underline"
              >
                {resendTimer > 0 ? `Resend code in ${resendTimer}s` : "Didn't receive code? Resend"}
              </button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
